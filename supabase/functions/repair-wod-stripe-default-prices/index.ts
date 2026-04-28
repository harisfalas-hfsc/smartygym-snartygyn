import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const repairs = [
  { productId: "prod_UPnHgrcKiw9pfJ", priceId: "price_1TQxhKIxQYg9inGKgW7igRQ2" },
  { productId: "prod_UPnGP6hUhoUAcE", priceId: "price_1TQxgAIxQYg9inGKAP5TODtQ" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const updated = [];
  for (const repair of repairs) {
    const product = await stripe.products.update(repair.productId, {
      default_price: repair.priceId,
    });
    updated.push({
      productId: product.id,
      defaultPrice: typeof product.default_price === "string" ? product.default_price : product.default_price?.id,
    });
  }

  return new Response(JSON.stringify({ success: true, updated }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});