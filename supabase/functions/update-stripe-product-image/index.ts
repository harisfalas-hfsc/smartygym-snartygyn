import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, imageUrl } = await req.json();
    
    if (!productId || !imageUrl) {
      throw new Error("Missing productId or imageUrl");
    }

    console.log("[UPDATE-STRIPE-PRODUCT-IMAGE] Updating product:", productId, "with image:", imageUrl);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    await stripe.products.update(productId, {
      images: [imageUrl]
    });

    console.log("[UPDATE-STRIPE-PRODUCT-IMAGE] Successfully updated product:", productId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[UPDATE-STRIPE-PRODUCT-IMAGE] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
