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
    const { productId } = await req.json();
    
    if (!productId) {
      console.log("No product ID provided, skipping Stripe deletion");
      return new Response(
        JSON.stringify({ success: true, message: "No Stripe product to delete" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log("Attempting to delete Stripe product:", productId);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Archive the product in Stripe (products cannot be permanently deleted if they have prices)
    await stripe.products.update(productId, {
      active: false,
    });

    console.log("Stripe product archived successfully:", productId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Stripe product archived successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting Stripe product:", error);
    
    // If product doesn't exist in Stripe, consider it a success
    if (error instanceof Error && error.message.includes("No such product")) {
      return new Response(
        JSON.stringify({ success: true, message: "Product already removed from Stripe" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
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
