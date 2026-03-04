// ═══════════════════════════════════════════════════════════════════════════════
// BULK FORMAT CONSISTENCY REPAIR V2
// Processes ALL workouts and training programs with sanitizer-first approach:
// 1. Sanitizes malformed HTML
// 2. Strips existing exercise markup
// 3. Re-runs exercise matching
// 4. Splits multi-exercise lines (1 exercise = 1 bullet = 1 View button)
// 5. Removes orphan bullets
// 6. Normalizes HTML to Gold Standard V4
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  processContentSectionAware,
  processContentWithExerciseMatching,
  stripExerciseMarkup,
  guaranteeAllExercisesLinked,
  rejectNonLibraryExercises,
  type ExerciseBasic,
} from "../_shared/exercise-matching.ts";
import { normalizeWorkoutHtml } from "../_shared/html-normalizer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOG = "[BULK-REPAIR-V2]";

const WORKOUT_HTML_FIELDS = [
  "main_workout", "warm_up", "cool_down", "activation", "finisher",
  "instructions", "tips", "notes"
] as const;

const PROGRAM_HTML_FIELDS = [
  "weekly_schedule", "program_structure", "overview",
  "expected_results", "nutrition_tips", "progression_plan"
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const {
      contentType = "all",
      batchOffset = 0,
      batchSize = 50,
      dryRun = false,
      targetId = null,
      processAll = false,
    } = body;

    console.log(`${LOG} Starting. type=${contentType}, offset=${batchOffset}, size=${batchSize}, dryRun=${dryRun}, target=${targetId}, processAll=${processAll}`);

    // ── Load full exercise library (paginated) ──
    const exerciseLibrary: ExerciseBasic[] = [];
    let exFrom = 0;
    const exPageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, body_part, equipment, target")
        .range(exFrom, exFrom + exPageSize - 1);
      if (error) throw new Error(`Failed to load exercises: ${error.message}`);
      if (!data || data.length === 0) break;
      exerciseLibrary.push(...(data as ExerciseBasic[]));
      if (data.length < exPageSize) break;
      exFrom += exPageSize;
    }
    console.log(`${LOG} Loaded ${exerciseLibrary.length} exercises`);

    const stats = {
      workoutsProcessed: 0,
      workoutsModified: 0,
      programsProcessed: 0,
      programsModified: 0,
      errors: [] as Array<{ id: string; error: string }>,
    };

    // ── Helper: process one HTML field ──
    function processField(
      content: string | null,
      fieldName: string,
      entityName: string,
      useSectionAware: boolean
    ): string | null {
      if (!content || !content.trim()) return null;

      // Strip existing markup to get clean text
      const stripped = stripExerciseMarkup(content);

      // Re-match exercises
      let result;
      if (useSectionAware) {
        result = processContentSectionAware(stripped, exerciseLibrary, `${LOG}[${entityName}][${fieldName}]`);
      } else {
        result = processContentWithExerciseMatching(stripped, exerciseLibrary, `${LOG}[${entityName}][${fieldName}]`);
      }

      // Final sweep + rejection
      let processed = result.processedContent;
      const sweep = guaranteeAllExercisesLinked(processed, exerciseLibrary, `${LOG}[${entityName}][${fieldName}-SWEEP]`);
      processed = sweep.processedContent;
      const rejection = rejectNonLibraryExercises(processed, exerciseLibrary, `${LOG}[${entityName}][${fieldName}-REJECT]`);
      processed = rejection.processedContent;

      // Normalize (V4: sanitize → split → orphan removal → absorb)
      processed = normalizeWorkoutHtml(processed);

      return processed;
    }

    // ── Process workouts ──
    if (contentType === "workouts" || contentType === "all") {
      let totalProcessed = 0;
      let currentOffset = batchOffset;
      const effectiveBatchSize = processAll ? 50 : batchSize;
      
      while (true) {
        let query = supabase
          .from("admin_workouts")
          .select("id, name, " + WORKOUT_HTML_FIELDS.join(", "))
          .order("id");

        if (targetId) {
          query = query.eq("id", targetId);
        } else {
          query = query.range(currentOffset, currentOffset + effectiveBatchSize - 1);
        }

        const { data: workouts, error: wErr } = await query;
        if (wErr) throw new Error(`Failed to load workouts: ${wErr.message}`);
        if (!workouts || workouts.length === 0) break;

        for (const workout of workouts) {
          stats.workoutsProcessed++;
          try {
            const updates: Record<string, string> = {};

            for (const field of WORKOUT_HTML_FIELDS) {
              const original = workout[field] as string | null;
              if (!original) continue;

              const useSectionAware = field === "main_workout";
              const processed = processField(original, field, workout.name, useSectionAware);

              if (processed && processed !== original) {
                updates[field] = processed;
              }
            }

            if (Object.keys(updates).length > 0) {
              if (!dryRun) {
                const { error: updateErr } = await supabase
                  .from("admin_workouts")
                  .update(updates)
                  .eq("id", workout.id);

                if (updateErr) {
                  stats.errors.push({ id: workout.id, error: updateErr.message });
                  continue;
                }
              }
              stats.workoutsModified++;
              console.log(`${LOG} ✅ ${dryRun ? "[DRY]" : ""} Fixed workout "${workout.name}" (${Object.keys(updates).length} fields)`);
            }
          } catch (e) {
            stats.errors.push({ id: workout.id, error: String(e) });
          }
        }

        totalProcessed += workouts.length;
        
        // If targeting a specific ID or not processAll, break after first batch
        if (targetId || !processAll) break;
        
        currentOffset += effectiveBatchSize;
        console.log(`${LOG} Workout batch done. Processed ${totalProcessed} so far...`);
      }
    }

    // ── Process training programs ──
    if (contentType === "programs" || contentType === "all") {
      let currentOffset = batchOffset;
      
      while (true) {
        let query = supabase
          .from("admin_training_programs")
          .select("id, name, " + PROGRAM_HTML_FIELDS.join(", "))
          .order("id");

        if (targetId && contentType === "programs") {
          query = query.eq("id", targetId);
        } else {
          query = query.range(currentOffset, currentOffset + 50 - 1);
        }

        const { data: programs, error: pErr } = await query;
        if (pErr) throw new Error(`Failed to load programs: ${pErr.message}`);
        if (!programs || programs.length === 0) break;

        for (const program of programs) {
          stats.programsProcessed++;
          try {
            const updates: Record<string, string> = {};

            for (const field of PROGRAM_HTML_FIELDS) {
              const original = program[field] as string | null;
              if (!original) continue;

              // Skip progression_plan from exercise matching per architecture rules
              if (field === "progression_plan") continue;

              const processed = processField(original, field, program.name, false);

              if (processed && processed !== original) {
                updates[field] = processed;
              }
            }

            if (Object.keys(updates).length > 0) {
              if (!dryRun) {
                const { error: updateErr } = await supabase
                  .from("admin_training_programs")
                  .update(updates)
                  .eq("id", program.id);

                if (updateErr) {
                  stats.errors.push({ id: program.id, error: updateErr.message });
                  continue;
                }
              }
              stats.programsModified++;
              console.log(`${LOG} ✅ ${dryRun ? "[DRY]" : ""} Fixed program "${program.name}" (${Object.keys(updates).length} fields)`);
            }
          } catch (e) {
            stats.errors.push({ id: program.id, error: String(e) });
          }
        }

        if (targetId || !processAll) break;
        currentOffset += 50;
      }
    }

    console.log(`${LOG} Complete.`, stats);

    return new Response(JSON.stringify({
      success: true,
      ...stats,
      batchOffset,
      batchSize,
      dryRun,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`${LOG} ❌ Error:`, error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
