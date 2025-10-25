import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, setting free plan");
      
      const { error: upsertError } = await supabaseClient
        .from('user_subscriptions')
        .upsert(
          {
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
            stripe_customer_id: null,
            stripe_subscription_id: null,
            current_period_start: null,
            current_period_end: null,
            cancel_at_period_end: false,
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        );
      
      if (upsertError) {
        logStep('Free plan sync error', { error: upsertError });
      }
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan_type: 'free' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get all subscriptions with expanded data
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
      expand: ['data.items.data.price']
    });
    
    logStep("Found subscriptions", { count: subscriptions.data.length });
    
    // Find first active subscription
    const activeSubscription = subscriptions.data.find((sub: any) => 
      sub.status === 'active' || sub.status === 'trialing'
    );
    
    let planType = 'free';
    let subscriptionEnd = null;
    let stripeSubscriptionId = null;

    if (activeSubscription) {
      stripeSubscriptionId = activeSubscription.id;
      logStep("Active subscription found", { 
        subscriptionId: activeSubscription.id,
        status: activeSubscription.status 
      });
      
      // Get subscription details
      const periodEnd = activeSubscription.current_period_end;
      const periodStart = activeSubscription.current_period_start;
      
      if (periodEnd && typeof periodEnd === 'number') {
        subscriptionEnd = new Date(periodEnd * 1000).toISOString();
        logStep("Subscription period", { 
          start: new Date(periodStart * 1000).toISOString(),
          end: subscriptionEnd 
        });
      }
      
      // Determine plan type based on price
      const priceId = activeSubscription.items.data[0]?.price?.id;
      logStep("Checking price ID", { priceId });
      
      // Gold Plan: €9.99/month
      if (priceId === "price_1SJ9q1IxQYg9inGKZzxxqPbD") {
        planType = 'gold';
        logStep("Matched Gold Plan", { priceId, productId: "prod_TFfAcybp438BH6" });
      } 
      // Platinum Plan: €89.99/year
      else if (priceId === "price_1SJ9qGIxQYg9inGKFbgqVRjj") {
        planType = 'platinum';
        logStep("Matched Platinum Plan", { priceId, productId: "prod_TFfAPp1tq7RdUk" });
      } else {
        logStep("Unknown price ID - defaulting to free", { priceId });
      }
      
      logStep("Determined plan type", { planType, interval: activeSubscription.items.data[0]?.price?.recurring?.interval });

      // Update database with subscription info
      const { error: upsertError } = await supabaseClient
        .from('user_subscriptions')
        .upsert(
          {
            user_id: user.id,
            plan_type: planType,
            status: 'active',
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: customerId,
            current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
            current_period_end: subscriptionEnd,
            cancel_at_period_end: activeSubscription.cancel_at_period_end || false,
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        );

      if (upsertError) {
        logStep('Subscription sync error', { error: upsertError });
        return new Response(
          JSON.stringify({ 
            subscribed: true, 
            plan_type: planType,
            subscription_end: subscriptionEnd,
            error: 'Subscription active but sync failed'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      logStep("Database updated successfully");
    } else {
      logStep("No active subscription found");
      
      // Update to free plan
      const { error: upsertError } = await supabaseClient
        .from('user_subscriptions')
        .upsert(
          {
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: null,
            current_period_start: null,
            current_period_end: null,
            cancel_at_period_end: false,
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        );

      if (upsertError) {
        logStep('Free plan update error', { error: upsertError });
      }
    }

    return new Response(JSON.stringify({
      subscribed: !!activeSubscription,
      plan_type: planType,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: 'Unable to check subscription status. Please try again.' }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});