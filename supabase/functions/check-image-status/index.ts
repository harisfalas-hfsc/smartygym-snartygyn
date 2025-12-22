import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-IMAGE-STATUS] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting image status check");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Fetch all visible workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from("admin_workouts")
      .select("id, name, image_url, stripe_product_id, is_visible")
      .eq("is_visible", true);

    if (workoutsError) throw new Error(`Failed to fetch workouts: ${workoutsError.message}`);

    // Fetch all visible programs
    const { data: programs, error: programsError } = await supabase
      .from("admin_training_programs")
      .select("id, name, image_url, stripe_product_id, is_visible")
      .eq("is_visible", true);

    if (programsError) throw new Error(`Failed to fetch programs: ${programsError.message}`);

    logStep("Fetched data", { workouts: workouts?.length || 0, programs: programs?.length || 0 });

    // Check Stripe images for each item
    const checkStripeImage = async (stripeProductId: string | null): Promise<boolean> => {
      if (!stripeProductId) return false;
      try {
        const product = await stripe.products.retrieve(stripeProductId);
        return product.images && product.images.length > 0;
      } catch (e) {
        console.error(`Failed to check Stripe product ${stripeProductId}:`, e);
        return false;
      }
    };

    // Process workouts
    const workoutStats = {
      total: workouts?.length || 0,
      withWebsite: 0,
      withStripe: 0,
      withBoth: 0,
      withNeither: 0,
      websiteOnly: 0,
      stripeOnly: 0,
      missingDetails: [] as { name: string; hasWebsite: boolean; hasStripe: boolean }[]
    };

    for (const workout of workouts || []) {
      const hasWebsite = !!workout.image_url && workout.image_url.startsWith("http");
      const hasStripe = await checkStripeImage(workout.stripe_product_id);

      if (hasWebsite) workoutStats.withWebsite++;
      if (hasStripe) workoutStats.withStripe++;
      if (hasWebsite && hasStripe) workoutStats.withBoth++;
      if (!hasWebsite && !hasStripe) {
        workoutStats.withNeither++;
        workoutStats.missingDetails.push({ name: workout.name, hasWebsite, hasStripe });
      }
      if (hasWebsite && !hasStripe) {
        workoutStats.websiteOnly++;
        workoutStats.missingDetails.push({ name: workout.name, hasWebsite, hasStripe });
      }
      if (!hasWebsite && hasStripe) {
        workoutStats.stripeOnly++;
        workoutStats.missingDetails.push({ name: workout.name, hasWebsite, hasStripe });
      }
    }

    // Process programs
    const programStats = {
      total: programs?.length || 0,
      withWebsite: 0,
      withStripe: 0,
      withBoth: 0,
      withNeither: 0,
      websiteOnly: 0,
      stripeOnly: 0,
      missingDetails: [] as { name: string; hasWebsite: boolean; hasStripe: boolean }[]
    };

    for (const program of programs || []) {
      const hasWebsite = !!program.image_url && program.image_url.startsWith("http");
      const hasStripe = await checkStripeImage(program.stripe_product_id);

      if (hasWebsite) programStats.withWebsite++;
      if (hasStripe) programStats.withStripe++;
      if (hasWebsite && hasStripe) programStats.withBoth++;
      if (!hasWebsite && !hasStripe) {
        programStats.withNeither++;
        programStats.missingDetails.push({ name: program.name, hasWebsite, hasStripe });
      }
      if (hasWebsite && !hasStripe) {
        programStats.websiteOnly++;
        programStats.missingDetails.push({ name: program.name, hasWebsite, hasStripe });
      }
      if (!hasWebsite && hasStripe) {
        programStats.stripeOnly++;
        programStats.missingDetails.push({ name: program.name, hasWebsite, hasStripe });
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (workoutStats.withNeither > 0 || programStats.withNeither > 0) {
      const count = workoutStats.withNeither + programStats.withNeither;
      recommendations.push(`Run "Generate Images" for ${count} item(s) missing all images`);
    }
    
    if (workoutStats.websiteOnly > 0 || programStats.websiteOnly > 0) {
      const count = workoutStats.websiteOnly + programStats.websiteOnly;
      recommendations.push(`Run "Audit Stripe" to sync ${count} website image(s) to Stripe`);
    }
    
    if (workoutStats.stripeOnly > 0 || programStats.stripeOnly > 0) {
      const count = workoutStats.stripeOnly + programStats.stripeOnly;
      recommendations.push(`Run "Pull from Stripe" to download ${count} image(s) to website`);
    }

    if (recommendations.length === 0) {
      recommendations.push("All images are synced! No action needed.");
    }

    logStep("Check complete", { 
      workouts: workoutStats, 
      programs: programStats,
      recommendations 
    });

    return new Response(
      JSON.stringify({
        success: true,
        workouts: workoutStats,
        programs: programStats,
        recommendations,
        summary: {
          totalItems: workoutStats.total + programStats.total,
          fullySynced: workoutStats.withBoth + programStats.withBoth,
          needsAction: (workoutStats.withNeither + workoutStats.websiteOnly + workoutStats.stripeOnly) + 
                       (programStats.withNeither + programStats.websiteOnly + programStats.stripeOnly)
        }
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
