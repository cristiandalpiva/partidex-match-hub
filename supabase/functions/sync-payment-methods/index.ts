
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError) throw authError;
    const user = authData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeSecret) throw new Error("Stripe secret key not configured");

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2023-10-16",
    });

    // Obtener/crear customer por email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
    }

    // Listar métodos de pago tipo tarjeta en Stripe
    const pmList = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    const stripeMethodIds = pmList.data.map((pm) => pm.id);

    // Upsert métodos actuales
    const rows = pmList.data.map((pm) => ({
      user_id: user.id,
      stripe_payment_method_id: pm.id,
      type: pm.type,
      last4: pm.card?.last4 ?? null,
      brand: pm.card?.brand ?? null,
      exp_month: pm.card?.exp_month ?? null,
      exp_year: pm.card?.exp_year ?? null,
      // No marcamos default aquí; se puede hacer en frontend o con otra lógica
    }));

    if (rows.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("payment_methods")
        .upsert(rows, { onConflict: "user_id,stripe_payment_method_id", ignoreDuplicates: false });
      if (upsertError) throw upsertError;
    }

    // Eliminar de la base los que no estén en Stripe
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("payment_methods")
      .select("id, stripe_payment_method_id")
      .eq("user_id", user.id);

    if (selectError) throw selectError;

    const toDelete = (existing ?? []).filter(
      (row) => !stripeMethodIds.includes(row.stripe_payment_method_id)
    );

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from("payment_methods")
        .delete()
        .in(
          "id",
          toDelete.map((r) => r.id)
        );
      if (deleteError) throw deleteError;
    }

    // Devolver listado final desde base
    const { data: finalList, error: finalError } = await supabaseAdmin
      .from("payment_methods")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (finalError) throw finalError;

    return new Response(
      JSON.stringify({ success: true, payment_methods: finalList }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("sync-payment-methods error:", error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
