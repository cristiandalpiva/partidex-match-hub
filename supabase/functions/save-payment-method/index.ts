import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const PaymentMethodSchema = z.object({
      payment_method_id: z.string().min(1, 'Payment method ID is required').max(255, 'Payment method ID too long'),
      is_default: z.boolean().optional(),
    });

    const requestBody = await req.json();
    const { payment_method_id, is_default } = PaymentMethodSchema.parse(requestBody);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) throw new Error("User not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);
    
    if (paymentMethod.type !== 'card') {
      throw new Error("Only card payment methods are supported");
    }

    // If this is set as default, update all other payment methods to false
    if (is_default) {
      await supabaseClient
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    // Save payment method to database
    const { error } = await supabaseClient
      .from('payment_methods')
      .insert({
        user_id: user.id,
        stripe_payment_method_id: payment_method_id,
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        exp_month: paymentMethod.card?.exp_month,
        exp_year: paymentMethod.card?.exp_year,
        is_default: is_default || false,
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Save payment method error:', error);
    
    // Return generic error message to client
    let userMessage = 'An error occurred while saving the payment method. Please try again.';
    let statusCode = 500;
    
    if (error.name === 'ZodError') {
      userMessage = 'Invalid payment method information provided.';
      statusCode = 400;
    } else if (error.message?.includes('not authenticated')) {
      userMessage = 'Authentication required.';
      statusCode = 401;
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: statusCode,
      }
    );
  }
});