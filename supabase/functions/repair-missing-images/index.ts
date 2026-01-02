import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[REPAIR-IMAGES] ${step}${detailsStr}`);
};

/**
 * Repair Missing Images
 * 
 * This function properly detects "missing" images by checking:
 * 1. image_url is NULL or empty
 * 2. image_url points to our storage but the file doesn't exist
 * 3. image_url is an invalid URL format
 * 
 * For each broken/missing image, it:
 * 1. Generates a new AI image
 * 2. Uploads to storage
 * 3. Updates the database
 * 4. Optionally syncs to Stripe
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logStep("🚀 Starting image repair process");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: "2023-10-16" }) : null;

    const results = {
      workoutsScanned: 0,
      programsScanned: 0,
      workoutsRepaired: 0,
      programsRepaired: 0,
      workoutsSkipped: 0,
      programsSkipped: 0,
      stripeUpdated: 0,
      errors: [] as string[],
    };

    // Helper: Check if a storage object exists
    async function storageObjectExists(path: string): Promise<boolean> {
      try {
        // Extract bucket and file path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/avatars/program-covers/file.jpg
        const match = path.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)/);
        if (!match) return false;
        
        const [, bucket, filePath] = match;
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .list(filePath.split('/').slice(0, -1).join('/'), {
            search: filePath.split('/').pop(),
          });
        
        if (error) {
          logStep("Storage check error", { path, error: error.message });
          return false;
        }
        
        const fileName = filePath.split('/').pop();
        return data?.some(f => f.name === fileName) || false;
      } catch (e) {
        logStep("Storage check exception", { path, error: String(e) });
        return false;
      }
    }

    // Helper: Check if image URL is valid and reachable
    async function isImageValid(imageUrl: string | null): Promise<boolean> {
      if (!imageUrl || imageUrl.trim() === '') return false;
      
      // Check if it's a valid URL format
      try {
        new URL(imageUrl);
      } catch {
        return false;
      }

      // If it's our storage URL, check if file exists
      if (imageUrl.includes(supabaseUrl) && imageUrl.includes('/storage/')) {
        return await storageObjectExists(imageUrl);
      }

      // For external URLs, do a HEAD request
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    }

    // Process workouts
    logStep("📋 Fetching workouts");
    const { data: workouts, error: workoutsError } = await supabase
      .from("admin_workouts")
      .select("id, name, category, format, difficulty_stars, image_url, stripe_product_id, is_visible")
      .eq("is_visible", true);

    if (workoutsError) {
      logStep("❌ Error fetching workouts", { error: workoutsError.message });
      results.errors.push(`Workouts fetch error: ${workoutsError.message}`);
    } else {
      results.workoutsScanned = workouts?.length || 0;
      logStep(`📊 Scanning ${results.workoutsScanned} workouts`);

      for (const workout of workouts || []) {
        const isValid = await isImageValid(workout.image_url);
        
        if (isValid) {
          results.workoutsSkipped++;
          continue;
        }

        logStep(`🔧 Repairing workout: ${workout.name}`, { 
          currentUrl: workout.image_url?.substring(0, 50) + '...',
          reason: !workout.image_url ? 'NULL' : 'broken/missing file'
        });

        try {
          // Generate new image
          const { data: genData, error: genError } = await supabase.functions.invoke('generate-workout-image', {
            body: {
              name: workout.name,
              category: workout.category,
              format: workout.format,
              difficulty_stars: workout.difficulty_stars,
            },
          });

          if (genError || !genData?.image_url) {
            throw new Error(genError?.message || 'No image URL returned');
          }

          // Update database
          const { error: updateError } = await supabase
            .from('admin_workouts')
            .update({ image_url: genData.image_url })
            .eq('id', workout.id);

          if (updateError) {
            throw new Error(`DB update failed: ${updateError.message}`);
          }

          results.workoutsRepaired++;
          logStep(`✅ Repaired workout: ${workout.name}`);

          // Sync to Stripe if applicable
          if (stripe && workout.stripe_product_id) {
            try {
              await stripe.products.update(workout.stripe_product_id, {
                images: [genData.image_url],
              });
              results.stripeUpdated++;
              logStep(`🔄 Synced to Stripe: ${workout.name}`);
            } catch (stripeErr: any) {
              logStep(`⚠️ Stripe sync failed for ${workout.name}`, { error: stripeErr.message });
            }
          }
        } catch (err: any) {
          results.errors.push(`Workout "${workout.name}": ${err.message}`);
          logStep(`❌ Failed to repair workout: ${workout.name}`, { error: err.message });
        }
      }
    }

    // Process programs
    logStep("📋 Fetching programs");
    const { data: programs, error: programsError } = await supabase
      .from("admin_training_programs")
      .select("id, name, category, difficulty_stars, weeks, image_url, stripe_product_id, is_visible")
      .eq("is_visible", true);

    if (programsError) {
      logStep("❌ Error fetching programs", { error: programsError.message });
      results.errors.push(`Programs fetch error: ${programsError.message}`);
    } else {
      results.programsScanned = programs?.length || 0;
      logStep(`📊 Scanning ${results.programsScanned} programs`);

      for (const program of programs || []) {
        const isValid = await isImageValid(program.image_url);
        
        if (isValid) {
          results.programsSkipped++;
          continue;
        }

        logStep(`🔧 Repairing program: ${program.name}`, { 
          currentUrl: program.image_url?.substring(0, 50) + '...',
          reason: !program.image_url ? 'NULL' : 'broken/missing file'
        });

        try {
          // Generate new image
          const { data: genData, error: genError } = await supabase.functions.invoke('generate-program-image', {
            body: {
              name: program.name,
              category: program.category,
              difficulty_stars: program.difficulty_stars || 3,
              weeks: program.weeks || 6,
            },
          });

          if (genError || (!genData?.imageUrl && !genData?.image_url)) {
            throw new Error(genError?.message || 'No image URL returned');
          }

          const newImageUrl = genData.imageUrl || genData.image_url;

          // Update database
          const { error: updateError } = await supabase
            .from('admin_training_programs')
            .update({ image_url: newImageUrl })
            .eq('id', program.id);

          if (updateError) {
            throw new Error(`DB update failed: ${updateError.message}`);
          }

          results.programsRepaired++;
          logStep(`✅ Repaired program: ${program.name}`);

          // Sync to Stripe if applicable
          if (stripe && program.stripe_product_id) {
            try {
              await stripe.products.update(program.stripe_product_id, {
                images: [newImageUrl],
              });
              results.stripeUpdated++;
              logStep(`🔄 Synced to Stripe: ${program.name}`);
            } catch (stripeErr: any) {
              logStep(`⚠️ Stripe sync failed for ${program.name}`, { error: stripeErr.message });
            }
          }
        } catch (err: any) {
          results.errors.push(`Program "${program.name}": ${err.message}`);
          logStep(`❌ Failed to repair program: ${program.name}`, { error: err.message });
        }
      }
    }

    logStep("🎉 Repair process completed", results);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        summary: `Repaired ${results.workoutsRepaired} workouts and ${results.programsRepaired} programs. Synced ${results.stripeUpdated} to Stripe.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logStep("💥 Fatal error", { error: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
