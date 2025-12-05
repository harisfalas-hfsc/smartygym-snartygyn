import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-STRIPE-IMAGES] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Stripe image sync");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Fetch all workouts with stripe_product_id AND image_url
    const { data: workouts, error: workoutsError } = await supabase
      .from("admin_workouts")
      .select("id, name, stripe_product_id, image_url")
      .not("stripe_product_id", "is", null)
      .not("image_url", "is", null);

    if (workoutsError) {
      throw new Error(`Failed to fetch workouts: ${workoutsError.message}`);
    }

    // Fetch all programs with stripe_product_id AND image_url
    const { data: programs, error: programsError } = await supabase
      .from("admin_training_programs")
      .select("id, name, stripe_product_id, image_url")
      .not("stripe_product_id", "is", null)
      .not("image_url", "is", null);

    if (programsError) {
      throw new Error(`Failed to fetch programs: ${programsError.message}`);
    }

    logStep("Found content to sync", { 
      workouts: workouts?.length || 0, 
      programs: programs?.length || 0 
    });

    const results = {
      workouts: { total: 0, updated: 0, failed: 0, skipped: 0, errors: [] as string[] },
      programs: { total: 0, updated: 0, failed: 0, skipped: 0, errors: [] as string[] }
    };

    // Sync workout images
    if (workouts && workouts.length > 0) {
      results.workouts.total = workouts.length;
      
      for (const workout of workouts) {
        try {
          // Check current Stripe product images
          const product = await stripe.products.retrieve(workout.stripe_product_id);
          
          // Skip if already has correct image
          if (product.images && product.images.length > 0 && product.images[0] === workout.image_url) {
            logStep("Workout already has correct image", { id: workout.id, name: workout.name });
            results.workouts.skipped++;
            continue;
          }

          // Update Stripe product with image
          await stripe.products.update(workout.stripe_product_id, {
            images: [workout.image_url]
          });

          logStep("Updated workout Stripe product", { 
            id: workout.id, 
            name: workout.name,
            productId: workout.stripe_product_id 
          });
          results.workouts.updated++;
        } catch (error: any) {
          const errorMsg = `${workout.name}: ${error.message}`;
          logStep("Failed to update workout", { id: workout.id, error: error.message });
          results.workouts.errors.push(errorMsg);
          results.workouts.failed++;
        }
      }
    }

    // Sync program images
    if (programs && programs.length > 0) {
      results.programs.total = programs.length;
      
      for (const program of programs) {
        try {
          // Check current Stripe product images
          const product = await stripe.products.retrieve(program.stripe_product_id);
          
          // Skip if already has correct image
          if (product.images && product.images.length > 0 && product.images[0] === program.image_url) {
            logStep("Program already has correct image", { id: program.id, name: program.name });
            results.programs.skipped++;
            continue;
          }

          // Update Stripe product with image
          await stripe.products.update(program.stripe_product_id, {
            images: [program.image_url]
          });

          logStep("Updated program Stripe product", { 
            id: program.id, 
            name: program.name,
            productId: program.stripe_product_id 
          });
          results.programs.updated++;
        } catch (error: any) {
          const errorMsg = `${program.name}: ${error.message}`;
          logStep("Failed to update program", { id: program.id, error: error.message });
          results.programs.errors.push(errorMsg);
          results.programs.failed++;
        }
      }
    }

    logStep("Sync complete", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Stripe image sync complete",
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
