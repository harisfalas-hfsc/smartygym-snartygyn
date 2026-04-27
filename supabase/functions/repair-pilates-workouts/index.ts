import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  processContentSectionAware,
  guaranteeAllExercisesLinked,
  rejectNonLibraryExercises,
  stripExerciseMarkup,
  type ExerciseBasic,
} from "../_shared/exercise-matching.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pilates studio equipment allowlist
const PILATES_ALLOWED_EQUIPMENT = [
  'body weight', 'band', 'resistance band', 'stability ball', 'medicine ball',
  'roller', 'bosu ball', 'rope', 'assisted'
];

function isPilatesAllowedEquipment(equipment: string): boolean {
  const equip = (equipment || '').toLowerCase().trim();
  return PILATES_ALLOWED_EQUIPMENT.some(allowed => equip.includes(allowed));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let dryRun = false;
    let batchSize = 50;

    try {
      const body = await req.json();
      dryRun = body?.dryRun || false;
      batchSize = body?.batchSize || 50;
    } catch { /* defaults */ }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[REPAIR-PILATES] Starting repair. dryRun=${dryRun}, batchSize=${batchSize}`);

    // 1. Load full exercise library
    const allExercises: ExerciseBasic[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, body_part, equipment, target, difficulty")
        .range(from, from + pageSize - 1);
      if (error) throw new Error(`Failed to fetch exercises: ${error.message}`);
      if (!data || data.length === 0) break;
      allExercises.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    console.log(`[REPAIR-PILATES] Loaded ${allExercises.length} exercises from library`);

    // 2. Build Pilates-only exercise pool
    const pilatesExercises = allExercises.filter(ex => isPilatesAllowedEquipment(ex.equipment));
    console.log(`[REPAIR-PILATES] Pilates-allowed exercises: ${pilatesExercises.length}`);

    // 3. Fetch all Pilates workouts
    const { data: pilatesWorkouts, error: fetchError } = await supabase
      .from("admin_workouts")
      .select("id, name, category, equipment, main_workout, warm_up, activation, cool_down, finisher, tips, instructions, notes, is_visible")
      .eq("category", "PILATES")
      .limit(batchSize);

    if (fetchError) throw new Error(`Failed to fetch Pilates workouts: ${fetchError.message}`);

    console.log(`[REPAIR-PILATES] Found ${pilatesWorkouts?.length || 0} Pilates workouts to process`);

    const results = {
      total: pilatesWorkouts?.length || 0,
      repaired: 0,
      hidden: 0,
      skipped: 0,
      details: [] as Array<{ id: string; name: string; equipment: string; action: string; exercisesRemoved: number; exercisesReplaced: number }>,
    };

    if (!pilatesWorkouts || pilatesWorkouts.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No Pilates workouts found", results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const workout of pilatesWorkouts) {
      console.log(`\n[REPAIR-PILATES] Processing: "${workout.name}" (${workout.equipment}) [${workout.id}]`);

      // Determine exercise pool: BODYWEIGHT uses bodyweight only, EQUIPMENT uses Pilates allowlist
      const exercisePool = workout.equipment === "BODYWEIGHT"
        ? allExercises.filter(ex => (ex.equipment || '').toLowerCase() === 'body weight')
        : pilatesExercises;

      const contentFields = ['main_workout', 'warm_up', 'activation', 'cool_down', 'finisher'] as const;
      let totalRemoved = 0;
      let totalReplaced = 0;
      const updates: Record<string, string> = {};

      for (const field of contentFields) {
        const content = workout[field];
        if (!content || typeof content !== 'string') continue;

        // Strip all existing markup first
        let cleaned = stripExerciseMarkup(content);

        // Re-run section-aware matching against the filtered pool
        const matched = processContentSectionAware(cleaned, exercisePool, `[REPAIR][${field}]`);
        let processed = matched.processedContent;

        // Final sweep
        const swept = guaranteeAllExercisesLinked(processed, exercisePool, `[REPAIR-SWEEP][${field}]`);
        processed = swept.processedContent;

        // Strict rejection
        const rejected = rejectNonLibraryExercises(processed, exercisePool, `[REPAIR-REJECT][${field}]`);
        processed = rejected.processedContent;

        totalRemoved += rejected.rejected.length;
        totalReplaced += rejected.substituted.length + swept.forcedMatches.length;

        if (processed !== content) {
          updates[field] = processed;
        }
      }

      const hasChanges = Object.keys(updates).length > 0;

      if (!hasChanges) {
        console.log(`[REPAIR-PILATES] ✓ "${workout.name}" - no changes needed`);
        results.skipped++;
        results.details.push({
          id: workout.id,
          name: workout.name,
          equipment: workout.equipment,
          action: 'skipped',
          exercisesRemoved: 0,
          exercisesReplaced: 0,
        });
        continue;
      }

      // Check if workout still has enough exercise content
      const mainContent = updates.main_workout || workout.main_workout || '';
      const exerciseMarkupCount = (mainContent.match(/\{\{exercise:/gi) || []).length;

      if (exerciseMarkupCount < 3) {
        console.log(`[REPAIR-PILATES] ⚠ "${workout.name}" - too few exercises after repair (${exerciseMarkupCount}), hiding`);
        if (!dryRun) {
          await supabase
            .from("admin_workouts")
            .update({ ...updates, is_visible: false })
            .eq("id", workout.id);
        }
        results.hidden++;
        results.details.push({
          id: workout.id,
          name: workout.name,
          equipment: workout.equipment,
          action: 'hidden (too few exercises)',
          exercisesRemoved: totalRemoved,
          exercisesReplaced: totalReplaced,
        });
      } else {
        console.log(`[REPAIR-PILATES] 🔧 "${workout.name}" - repaired (${totalRemoved} removed, ${totalReplaced} replaced, ${exerciseMarkupCount} exercises remain)`);
        if (!dryRun) {
          await supabase
            .from("admin_workouts")
            .update(updates)
            .eq("id", workout.id);
        }
        results.repaired++;
        results.details.push({
          id: workout.id,
          name: workout.name,
          equipment: workout.equipment,
          action: 'repaired',
          exercisesRemoved: totalRemoved,
          exercisesReplaced: totalReplaced,
        });
      }
    }

    console.log(`\n[REPAIR-PILATES] === COMPLETE ===`);
    console.log(`Total: ${results.total}, Repaired: ${results.repaired}, Hidden: ${results.hidden}, Skipped: ${results.skipped}`);

    return new Response(JSON.stringify({
      success: true,
      dryRun,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[REPAIR-PILATES] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
