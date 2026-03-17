import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Rename the equipment WOD product
    await stripe.products.update("prod_UAAIIaPPTKa1en", {
      name: "Pulse Rush Flow (Equipment)",
    });

    // Rename the bodyweight WOD product  
    await stripe.products.update("prod_UAAJtUlGNrLriH", {
      name: "Pulse Rush Flow (Bodyweight)",
    });

    return new Response(
      JSON.stringify({ success: true, message: "Both Stripe products renamed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
