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
    const { name, price, contentType, imageUrl } = await req.json();
    
    if (!name || !price) {
      throw new Error("Name and price are required");
    }

    // Enhanced logging for debugging image issues
    console.log("[CREATE-STRIPE-PRODUCT] Request received:", { 
      name, 
      price, 
      contentType, 
      imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : "NULL/MISSING" 
    });

    if (!imageUrl) {
      console.warn("[CREATE-STRIPE-PRODUCT] WARNING: No imageUrl provided - Stripe product will be created WITHOUT an image");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create product with image
    const productData: any = {
      name: name,
      description: `${contentType}: ${name}`,
    };

    // Add image if provided
    if (imageUrl) {
      productData.images = [imageUrl];
      console.log("[CREATE-STRIPE-PRODUCT] Image will be added to product");
    } else {
      console.log("[CREATE-STRIPE-PRODUCT] No image - product created without image");
    }

    const product = await stripe.products.create(productData);

    console.log("Product created:", product.id);

    // Create price (convert to cents)
    const priceInCents = Math.round(parseFloat(price) * 100);
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: priceInCents,
      currency: "eur",
    });

    console.log("Price created:", stripePrice.id);

    return new Response(
      JSON.stringify({
        product_id: product.id,
        price_id: stripePrice.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating Stripe product:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
