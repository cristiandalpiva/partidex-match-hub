
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreatePreferencePayload = {
  title?: string;
  description?: string;
  amount: number; // en ARS
  quantity?: number;
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: "approved" | "all";
  metadata?: Record<string, string | number | boolean>;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;
    const user = authData.user;
    if (!user) throw new Error("User not authenticated");

    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("Mercado Pago access token (MP_ACCESS_TOKEN) not configured");
    }

    // Validate input
    const PreferenceSchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      amount: z.number().positive('Amount must be positive'),
      quantity: z.number().int().positive().optional(),
      back_urls: z.object({
        success: z.string().url().optional(),
        failure: z.string().url().optional(),
        pending: z.string().url().optional(),
      }).optional(),
      auto_return: z.enum(['approved', 'all']).optional(),
      metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    });

    const body = PreferenceSchema.parse(await req.json());

    const quantity = Math.max(1, Math.trunc(body.quantity ?? 1));
    const title = body.title ?? "Pago";
    const description = body.description ?? "Pago a través de Mercado Pago";

    const preferencePayload = {
      items: [
        {
          title,
          description,
          currency_id: "ARS",
          quantity,
          unit_price: Number(body.amount),
        },
      ],
      payer: {
        email: user.email ?? undefined,
        // Podemos agregar más datos si existiera en profiles...
      },
      back_urls: body.back_urls ?? undefined,
      auto_return: body.auto_return ?? "approved",
      metadata: {
        user_id: user.id,
        ...body.metadata,
      },
    };

    // Crear preferencia en Mercado Pago
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferencePayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Mercado Pago error:", errText);
      throw new Error("Mercado Pago preference creation failed");
    }

    const pref = await res.json();

    // Responder con datos clave para redireccionar
    return new Response(
      JSON.stringify({
        id: pref.id,
        init_point: pref.init_point,
        sandbox_init_point: pref.sandbox_init_point,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("create-mercadopago-preference error:", error);
    
    // Return generic error message to client
    let userMessage = 'An error occurred while creating the payment preference. Please try again.';
    let statusCode = 500;
    
    if (error.name === 'ZodError') {
      userMessage = 'Invalid payment preference data provided.';
      statusCode = 400;
    } else if (error.message?.includes('not authenticated')) {
      userMessage = 'Authentication required.';
      statusCode = 401;
    } else if (error.message?.includes('not configured')) {
      userMessage = 'Payment service is not properly configured.';
      statusCode = 503;
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: statusCode }
    );
  }
});
