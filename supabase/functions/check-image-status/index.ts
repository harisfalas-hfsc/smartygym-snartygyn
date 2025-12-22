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

interface ItemDetail {
  name: string;
  id: string;
  category: string;
  stripeProductId?: string;
}

interface CategoryStats {
  total: number;
  withWebsite: number;
  withStripe: number;
  withBoth: number;
  withNeither: number;
  websiteOnly: number;
  stripeOnly: number;
  noImageItems: ItemDetail[];
  websiteOnlyItems: ItemDetail[];
  stripeOnlyItems: ItemDetail[];
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
      .select("id, name, image_url, stripe_product_id, is_visible, category")
      .eq("is_visible", true);

    if (workoutsError) throw new Error(`Failed to fetch workouts: ${workoutsError.message}`);

    // Fetch all visible programs
    const { data: programs, error: programsError } = await supabase
      .from("admin_training_programs")
      .select("id, name, image_url, stripe_product_id, is_visible, category")
      .eq("is_visible", true);

    if (programsError) throw new Error(`Failed to fetch programs: ${programsError.message}`);

    logStep("Fetched data", { workouts: workouts?.length || 0, programs: programs?.length || 0 });

    // Cache Stripe product image status to reduce API calls
    const stripeImageCache: Map<string, boolean> = new Map();
    
    const checkStripeImage = async (stripeProductId: string | null): Promise<boolean> => {
      if (!stripeProductId) return false;
      
      // Check cache first
      if (stripeImageCache.has(stripeProductId)) {
        return stripeImageCache.get(stripeProductId)!;
      }
      
      try {
        const product = await stripe.products.retrieve(stripeProductId);
        const hasImage = product.images && product.images.length > 0;
        stripeImageCache.set(stripeProductId, hasImage);
        return hasImage;
      } catch (e) {
        console.error(`Failed to check Stripe product ${stripeProductId}:`, e);
        stripeImageCache.set(stripeProductId, false);
        return false;
      }
    };

    // Process workouts
    const workoutStats: CategoryStats = {
      total: workouts?.length || 0,
      withWebsite: 0,
      withStripe: 0,
      withBoth: 0,
      withNeither: 0,
      websiteOnly: 0,
      stripeOnly: 0,
      noImageItems: [],
      websiteOnlyItems: [],
      stripeOnlyItems: [],
    };

    for (const workout of workouts || []) {
      const hasWebsite = !!workout.image_url && workout.image_url.startsWith("http");
      const hasStripe = await checkStripeImage(workout.stripe_product_id);

      if (hasWebsite) workoutStats.withWebsite++;
      if (hasStripe) workoutStats.withStripe++;
      
      const itemDetail: ItemDetail = {
        name: workout.name,
        id: workout.id,
        category: workout.category || 'Unknown',
        stripeProductId: workout.stripe_product_id || undefined,
      };

      if (hasWebsite && hasStripe) {
        workoutStats.withBoth++;
      } else if (!hasWebsite && !hasStripe) {
        workoutStats.withNeither++;
        workoutStats.noImageItems.push(itemDetail);
      } else if (hasWebsite && !hasStripe) {
        workoutStats.websiteOnly++;
        workoutStats.websiteOnlyItems.push(itemDetail);
      } else if (!hasWebsite && hasStripe) {
        workoutStats.stripeOnly++;
        workoutStats.stripeOnlyItems.push(itemDetail);
      }
    }

    // Process programs
    const programStats: CategoryStats = {
      total: programs?.length || 0,
      withWebsite: 0,
      withStripe: 0,
      withBoth: 0,
      withNeither: 0,
      websiteOnly: 0,
      stripeOnly: 0,
      noImageItems: [],
      websiteOnlyItems: [],
      stripeOnlyItems: [],
    };

    for (const program of programs || []) {
      const hasWebsite = !!program.image_url && program.image_url.startsWith("http");
      const hasStripe = await checkStripeImage(program.stripe_product_id);

      if (hasWebsite) programStats.withWebsite++;
      if (hasStripe) programStats.withStripe++;

      const itemDetail: ItemDetail = {
        name: program.name,
        id: program.id,
        category: program.category || 'Unknown',
        stripeProductId: program.stripe_product_id || undefined,
      };

      if (hasWebsite && hasStripe) {
        programStats.withBoth++;
      } else if (!hasWebsite && !hasStripe) {
        programStats.withNeither++;
        programStats.noImageItems.push(itemDetail);
      } else if (hasWebsite && !hasStripe) {
        programStats.websiteOnly++;
        programStats.websiteOnlyItems.push(itemDetail);
      } else if (!hasWebsite && hasStripe) {
        programStats.stripeOnly++;
        programStats.stripeOnlyItems.push(itemDetail);
      }
    }

    // Check for orphaned Stripe products (products in Stripe but not in database)
    logStep("Checking for orphaned Stripe products");
    const orphanedProducts: { id: string; name: string; type: string }[] = [];
    
    try {
      // Get all Stripe products with our metadata
      const stripeProducts = await stripe.products.list({ 
        limit: 100,
        active: true 
      });
      
      // Get all database IDs
      const workoutIds = new Set((workouts || []).map(w => w.stripe_product_id).filter(Boolean));
      const programIds = new Set((programs || []).map(p => p.stripe_product_id).filter(Boolean));
      const allDbStripeIds = new Set([...workoutIds, ...programIds]);
      
      // Find orphaned products (in Stripe but not in DB)
      for (const product of stripeProducts.data) {
        // Check if product looks like one of ours (has workout/program naming pattern)
        const isLikelyOurs = product.metadata?.type === 'workout' || 
                            product.metadata?.type === 'program' ||
                            product.name.toLowerCase().includes('workout') ||
                            product.name.toLowerCase().includes('program');
        
        if (isLikelyOurs && !allDbStripeIds.has(product.id)) {
          orphanedProducts.push({
            id: product.id,
            name: product.name,
            type: product.metadata?.type || 'unknown'
          });
        }
      }
      
      logStep("Orphaned products check complete", { found: orphanedProducts.length });
    } catch (e) {
      console.error("Failed to check for orphaned Stripe products:", e);
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

    if (orphanedProducts.length > 0) {
      recommendations.push(`Found ${orphanedProducts.length} orphaned Stripe product(s) - may need cleanup`);
    }

    if (recommendations.length === 0) {
      recommendations.push("All images are synced! No action needed.");
    }

    logStep("Check complete", { 
      workouts: { ...workoutStats, noImageItems: workoutStats.noImageItems.length },
      programs: { ...programStats, noImageItems: programStats.noImageItems.length },
      orphanedProducts: orphanedProducts.length,
      recommendations 
    });

    return new Response(
      JSON.stringify({
        success: true,
        workouts: workoutStats,
        programs: programStats,
        orphanedProducts,
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
