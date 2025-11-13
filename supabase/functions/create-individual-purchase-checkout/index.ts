import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, contentId, contentName, price, stripeProductId, stripePriceId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Check if user already purchased this
    const { data: existingPurchase } = await supabaseClient
      .from('user_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .maybeSingle();

    if (existingPurchase) {
      return new Response(JSON.stringify({ error: "You already own this content" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create or use existing Stripe product/price
    let finalPriceId = stripePriceId;
    
    if (!finalPriceId) {
      // Create new product and price if doesn't exist
      const product = await stripe.products.create({
        name: contentName,
        metadata: {
          content_type: contentType,
          content_id: contentId,
        },
      });

      const priceObj = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(parseFloat(price) * 100), // Convert to cents
        currency: 'eur',
      });

      finalPriceId = priceObj.id;

      // Update database with Stripe IDs
      const tableName = contentType === 'workout' ? 'admin_workouts' : 'admin_training_programs';
      await supabaseClient
        .from(tableName)
        .update({
          stripe_product_id: product.id,
          stripe_price_id: priceObj.id,
        })
        .eq('id', contentId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/${contentType}/${contentId}`,
      metadata: {
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        content_name: contentName,
      },
      metadata: {
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        content_name: contentName,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
