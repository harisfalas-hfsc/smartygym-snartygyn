// ═══════════════════════════════════════════════════════════════════════════════
// BULK FORMAT CONSISTENCY REPAIR V2
// Two modes:
// - normalizeOnly=true (default): Just normalize HTML (fast, no CPU issues)
// - normalizeOnly=false: Full strip+rematch+normalize (heavy, use small batches)
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
  "expected_results", "nutrition_tips"
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
      batchSize = 100,
      dryRun = false,
      targetId = null,
      normalizeOnly = true, // DEFAULT: just normalize, don't re-match
    } = body;

    console.log(`${LOG} Starting. type=${contentType}, offset=${batchOffset}, size=${batchSize}, normalizeOnly=${normalizeOnly}, target=${targetId}`);

    // Only load exercise library if doing full re-matching
    let exerciseLibrary: ExerciseBasic[] = [];
    if (!normalizeOnly) {
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
    }

    const stats = {
      workoutsProcessed: 0,
      workoutsModified: 0,
      programsProcessed: 0,
      programsModified: 0,
      errors: [] as Array<{ id: string; error: string }>,
    };

    function processField(content: string | null, fieldName: string, entityName: string, useSectionAware: boolean): string | null {
      if (!content || !content.trim()) return null;

      if (normalizeOnly) {
        // Just normalize - no exercise re-matching
        return normalizeWorkoutHtml(content);
      }

      // Full re-match path
      const stripped = stripExerciseMarkup(content);
      let result;
      if (useSectionAware) {
        result = processContentSectionAware(stripped, exerciseLibrary, `${LOG}[${entityName}][${fieldName}]`);
      } else {
        result = processContentWithExerciseMatching(stripped, exerciseLibrary, `${LOG}[${entityName}][${fieldName}]`);
      }
      let processed = result.processedContent;
      const sweep = guaranteeAllExercisesLinked(processed, exerciseLibrary, `${LOG}[${entityName}][${fieldName}-SWEEP]`);
      processed = sweep.processedContent;
      const rejection = rejectNonLibraryExercises(processed, exerciseLibrary, `${LOG}[${entityName}][${fieldName}-REJECT]`);
      processed = rejection.processedContent;
      processed = normalizeWorkoutHtml(processed);
      return processed;
    }

    // ── Process workouts ──
    if (contentType === "workouts" || contentType === "all") {
      let query = supabase
        .from("admin_workouts")
        .select("id, name, " + WORKOUT_HTML_FIELDS.join(", "))
        .order("id");

      if (targetId) {
        query = query.eq("id", targetId);
      } else {
        query = query.range(batchOffset, batchOffset + batchSize - 1);
      }

      const { data: workouts, error: wErr } = await query;
      if (wErr) throw new Error(`Failed to load workouts: ${wErr.message}`);

      for (const workout of (workouts || []) as Array<Record<string, any>>) {
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
            console.log(`${LOG} ✅ Fixed workout "${workout.name}" (${Object.keys(updates).length} fields)`);
          }
        } catch (e) {
          stats.errors.push({ id: workout.id, error: String(e) });
        }
      }
    }

    // ── Process training programs ──
    if (contentType === "programs" || contentType === "all") {
      let query = supabase
        .from("admin_training_programs")
        .select("id, name, " + PROGRAM_HTML_FIELDS.join(", "))
        .order("id");

      if (targetId && contentType === "programs") {
        query = query.eq("id", targetId);
      } else if (!targetId) {
        query = query.range(batchOffset, batchOffset + batchSize - 1);
      }

      const { data: programs, error: pErr } = await query;
      if (pErr) throw new Error(`Failed to load programs: ${pErr.message}`);

      for (const program of (programs || []) as Array<Record<string, any>>) {
        stats.programsProcessed++;
        try {
          const updates: Record<string, string> = {};
          for (const field of PROGRAM_HTML_FIELDS) {
            const original = program[field] as string | null;
            if (!original) continue;
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
            console.log(`${LOG} ✅ Fixed program "${program.name}" (${Object.keys(updates).length} fields)`);
          }
        } catch (e) {
          stats.errors.push({ id: program.id, error: String(e) });
        }
      }
    }

    console.log(`${LOG} Complete.`, stats);

    return new Response(JSON.stringify({
      success: true,
      ...stats,
      batchOffset,
      batchSize,
      dryRun,
      normalizeOnly,
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
