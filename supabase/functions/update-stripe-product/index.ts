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
    const { productId, name, description, imageUrl } = await req.json();
    
    if (!productId) {
      throw new Error("Product ID is required");
    }

    console.log("[UPDATE-STRIPE-PRODUCT] Request received:", { 
      productId, 
      name, 
      description, 
      imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : "NULL/MISSING" 
    });

    // CRITICAL: URL validation - reject invalid URLs
    let validatedImageUrl = null;
    if (imageUrl) {
      if (imageUrl.startsWith('https://')) {
        validatedImageUrl = imageUrl;
        console.log("[UPDATE-STRIPE-PRODUCT] Image URL validated successfully");
      } else if (imageUrl.startsWith('http://')) {
        console.warn("[UPDATE-STRIPE-PRODUCT] WARNING: HTTP URL provided, converting to HTTPS");
        validatedImageUrl = imageUrl.replace('http://', 'https://');
      } else {
        console.error("[UPDATE-STRIPE-PRODUCT] REJECTED: Invalid image URL format:", imageUrl.substring(0, 100));
        throw new Error(`Invalid image URL format: URL must start with https:// - received: ${imageUrl.substring(0, 50)}...`);
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const updateData: any = {};
    if (name) {
      updateData.name = name;
    }
    if (description) {
      updateData.description = description;
    }
    if (validatedImageUrl) {
      updateData.images = [validatedImageUrl];
      console.log("[UPDATE-STRIPE-PRODUCT] Image will be updated:", validatedImageUrl.substring(0, 80));
    }

    const product = await stripe.products.update(productId, updateData);

    console.log("Product updated:", product.id, product.name);

    return new Response(
      JSON.stringify({
        product_id: product.id,
        name: product.name,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating Stripe product:", error);
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
