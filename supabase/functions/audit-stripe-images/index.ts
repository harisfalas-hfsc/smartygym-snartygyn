import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    console.log("[AUDIT-STRIPE-IMAGES] Starting audit...");

    // Fetch workouts with stripe_product_id and image_url
    const { data: workouts, error: workoutsError } = await supabase
      .from("admin_workouts")
      .select("id, name, stripe_product_id, image_url")
      .not("stripe_product_id", "is", null);

    if (workoutsError) {
      throw new Error(`Failed to fetch workouts: ${workoutsError.message}`);
    }

    // Fetch programs with stripe_product_id and image_url
    const { data: programs, error: programsError } = await supabase
      .from("admin_training_programs")
      .select("id, name, stripe_product_id, image_url")
      .not("stripe_product_id", "is", null);

    if (programsError) {
      throw new Error(`Failed to fetch programs: ${programsError.message}`);
    }

    const allItems = [
      ...(workouts || []).map(w => ({ ...w, type: "workout" })),
      ...(programs || []).map(p => ({ ...p, type: "program" })),
    ];

    console.log(`[AUDIT-STRIPE-IMAGES] Found ${allItems.length} items with Stripe products`);

    const results = {
      total: allItems.length,
      missing_stripe_image: 0,
      synced: 0,
      skipped_no_website_image: 0,
      already_has_image: 0,
      errors: [] as string[],
      details: [] as { name: string; type: string; status: string }[],
    };

    for (const item of allItems) {
      try {
        // Fetch the Stripe product
        const product = await stripe.products.retrieve(item.stripe_product_id);
        
        // Check if Stripe product has images
        const hasStripeImage = product.images && product.images.length > 0;
        
        if (hasStripeImage) {
          results.already_has_image++;
          results.details.push({
            name: item.name,
            type: item.type,
            status: "has_image",
          });
          continue;
        }

        // Stripe product is missing image
        results.missing_stripe_image++;

        // Check if website has an image to sync (supports full URLs and relative paths)
        const hasValidImage = item.image_url && (item.image_url.startsWith("http") || item.image_url.startsWith("/"));
        if (!hasValidImage) {
          results.skipped_no_website_image++;
          results.details.push({
            name: item.name,
            type: item.type,
            status: "no_website_image",
          });
          console.log(`[AUDIT-STRIPE-IMAGES] ${item.name}: No website image to sync`);
          continue;
        }

        // Sync the website image to Stripe
        console.log(`[AUDIT-STRIPE-IMAGES] Syncing image for ${item.name}: ${item.image_url}`);
        await stripe.products.update(item.stripe_product_id, {
          images: [item.image_url],
        });

        results.synced++;
        results.details.push({
          name: item.name,
          type: item.type,
          status: "synced",
        });
        console.log(`[AUDIT-STRIPE-IMAGES] ✓ Synced image for ${item.name}`);

      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        results.errors.push(`${item.name}: ${errorMsg}`);
        results.details.push({
          name: item.name,
          type: item.type,
          status: "error",
        });
        console.error(`[AUDIT-STRIPE-IMAGES] Error for ${item.name}:`, errorMsg);
      }
    }

    console.log(`[AUDIT-STRIPE-IMAGES] Audit complete:`, results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[AUDIT-STRIPE-IMAGES] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
