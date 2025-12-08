import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-CORPORATE-IMAGES] ${step}${detailsStr}`);
};

// Corporate plan Stripe product IDs
const CORPORATE_PRODUCTS = {
  dynamic: {
    productId: "prod_TZATAcAlqgc1P7",
    name: "Smarty Dynamic",
    description: "Corporate fitness plan for teams up to 10 members. Full Platinum access for 1 year.",
  },
  power: {
    productId: "prod_TZATDsKcDvMtHc",
    name: "Smarty Power",
    description: "Corporate fitness plan for teams up to 20 members. Full Platinum access for 1 year.",
  },
  elite: {
    productId: "prod_TZATGTAsKalmCn",
    name: "Smarty Elite",
    description: "Corporate fitness plan for teams up to 30 members. Full Platinum access for 1 year.",
  },
  enterprise: {
    productId: "prod_TZATUtaS2jhgtK",
    name: "Smarty Enterprise",
    description: "Corporate fitness plan for unlimited team members. Full Platinum access for 1 year.",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role for storage access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { imageUrls } = await req.json();
    logStep("Received image URLs", { keys: Object.keys(imageUrls || {}) });

    const results: Record<string, { success: boolean; error?: string }> = {};

    // Update each corporate product with its image
    for (const [planKey, plan] of Object.entries(CORPORATE_PRODUCTS)) {
      try {
        const imageUrl = imageUrls?.[planKey];
        
        if (!imageUrl) {
          results[planKey] = { success: false, error: "No image URL provided" };
          continue;
        }

        logStep(`Updating ${planKey}`, { productId: plan.productId, imageUrl: imageUrl.substring(0, 50) });

        const product = await stripe.products.update(plan.productId, {
          images: [imageUrl],
          description: plan.description,
        });

        logStep(`Successfully updated ${planKey}`, { productId: product.id });
        results[planKey] = { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logStep(`Failed to update ${planKey}`, { error: errorMessage });
        results[planKey] = { success: false, error: errorMessage };
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
