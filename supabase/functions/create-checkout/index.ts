import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// First-time subscriber coupon ID (35% off)
const FIRST_TIME_COUPON_ID = "TnTNe1uX";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { priceId, applyFirstTimeDiscount } = await req.json();
    logStep("Request received", { priceId, applyFirstTimeDiscount });
    
    if (!priceId) {
      throw new Error("Price ID is required");
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // CRITICAL: Check if user already has an active subscription (prevent double billing)
    if (customerId) {
      const activeSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });
      
      if (activeSubscriptions.data.length > 0) {
        logStep("User already has active subscription - blocking checkout", {
          subscriptionId: activeSubscriptions.data[0].id
        });
        return new Response(JSON.stringify({ 
          error: "You already have an active subscription. Please manage your existing subscription instead.",
          hasActiveSubscription: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Check if user is truly a first-time subscriber (server-side validation)
    let shouldApplyCoupon = false;
    if (applyFirstTimeDiscount && customerId) {
      // Check if customer has EVER had any subscription (including cancelled ones)
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all', // Include all statuses: active, cancelled, past_due, etc.
        limit: 1
      });
      
      const isFirstTimeSubscriber = subscriptions.data.length === 0;
      shouldApplyCoupon = isFirstTimeSubscriber;
      logStep("First-time subscriber check", { 
        hasSubscriptionHistory: subscriptions.data.length > 0,
        shouldApplyCoupon 
      });
    } else if (applyFirstTimeDiscount && !customerId) {
      // No customer record means they've never purchased anything
      shouldApplyCoupon = true;
      logStep("New customer - applying first-time discount");
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/userdashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        user_id: user.id,
      },
      // Apply first-time discount coupon if eligible
      ...(shouldApplyCoupon && { discounts: [{ coupon: FIRST_TIME_COUPON_ID }] }),
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      discountApplied: shouldApplyCoupon 
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});