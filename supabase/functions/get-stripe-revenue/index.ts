import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-STRIPE-REVENUE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify admin authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin access required");
    }
    logStep("Admin verified");

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    logStep("Stripe initialized");

    // Fetch all active subscriptions (with pagination)
    let allSubscriptions: any[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const params: any = { status: "active", limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const subscriptions = await stripe.subscriptions.list(params);
      allSubscriptions = allSubscriptions.concat(subscriptions.data);
      hasMore = subscriptions.has_more;
      
      if (subscriptions.data.length > 0) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
      }
    }

    logStep("Fetched all subscriptions", { count: allSubscriptions.length });

    // Calculate total monthly recurring revenue - ONLY for SMARTYGYM products
    let totalRevenue = 0;
    const revenueByPlan: { [key: string]: number } = {};
    const subscriptionDetails: any[] = [];
    let skippedNonSmartyGym = 0;

    for (const subscription of allSubscriptions) {
      // Get the product ID to check metadata
      const productId = subscription.items.data[0].price.product as string;
      
      // Fetch the product to check its metadata
      let product;
      try {
        product = await stripe.products.retrieve(productId);
      } catch (error) {
        logStep("Failed to fetch product, skipping", { productId });
        skippedNonSmartyGym++;
        continue;
      }
      
      // FILTER: Only include SMARTYGYM products
      if (product.metadata?.project !== "SMARTYGYM") {
        logStep("Skipping non-SMARTYGYM product", { 
          productId, 
          productName: product.name,
          projectTag: product.metadata?.project || "none"
        });
        skippedNonSmartyGym++;
        continue;
      }

      // Get the price amount (in cents) and convert to dollars/euros
      const amount = subscription.items.data[0].price.unit_amount || 0;
      const currency = subscription.items.data[0].price.currency;
      const amountInCurrency = amount / 100;
      
      totalRevenue += amountInCurrency;

      // Get product name for grouping
      const priceId = subscription.items.data[0].price.id;
      
      if (!revenueByPlan[productId]) {
        revenueByPlan[productId] = 0;
      }
      revenueByPlan[productId] += amountInCurrency;

      // Safely handle current_period_end which may be undefined
      const periodEnd = subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;

      subscriptionDetails.push({
        id: subscription.id,
        customer: subscription.customer,
        amount: amountInCurrency,
        currency: currency.toUpperCase(),
        priceId,
        productId,
        productName: product.name,
        status: subscription.status,
        currentPeriodEnd: periodEnd,
      });
    }

    logStep("Revenue calculated (SMARTYGYM only)", { 
      totalRevenue, 
      smartyGymSubscriptions: subscriptionDetails.length,
      skippedNonSmartyGym,
      totalSubscriptions: allSubscriptions.length
    });

    return new Response(
      JSON.stringify({
        totalRevenue,
        subscriptionCount: subscriptionDetails.length,
        skippedNonSmartyGym,
        totalSubscriptionsChecked: allSubscriptions.length,
        revenueByPlan,
        subscriptions: subscriptionDetails,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});