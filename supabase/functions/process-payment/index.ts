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
    const PaymentSchema = z.object({
      payment_id: z.string().uuid('Invalid payment ID format'),
      payment_method_id: z.string().min(1, 'Payment method ID is required').max(255, 'Payment method ID too long'),
    });

    const requestBody = await req.json();
    const { payment_id, payment_method_id } = PaymentSchema.parse(requestBody);
    
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

    // Get payment details
    const { data: payment } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .eq('user_id', user.id)
      .single();

    if (!payment) throw new Error("Payment not found");
    if (payment.status === 'paid') throw new Error("Payment already processed");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) throw new Error("Customer not found");
    
    const customerId = customers.data[0].id;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(payment.amount * 100), // Convert to cents
      currency: 'ars',
      customer: customerId,
      payment_method: payment_method_id,
      confirmation_method: 'manual',
      confirm: true,
      off_session: true,
      metadata: {
        payment_id: payment_id,
        user_id: user.id,
      },
    });

    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      await supabaseClient
        .from('payments')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', payment_id);

      return new Response(
        JSON.stringify({ success: true, payment_intent_id: paymentIntent.id }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      throw new Error(`Payment failed: ${paymentIntent.status}`);
    }
  } catch (error) {
    console.error('Process payment error:', error);
    
    // Return generic error message to client
    let userMessage = 'An error occurred while processing the payment. Please try again.';
    let statusCode = 500;
    
    if (error.name === 'ZodError') {
      userMessage = 'Invalid payment information provided.';
      statusCode = 400;
    } else if (error.message?.includes('not found')) {
      userMessage = 'Payment not found.';
      statusCode = 404;
    } else if (error.message?.includes('already processed')) {
      userMessage = 'This payment has already been processed.';
      statusCode = 400;
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