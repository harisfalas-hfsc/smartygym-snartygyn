// ═══════════════════════════════════════════════════════════════════════════════
// REPROCESS WOD EXERCISES
// Re-runs exercise matching on existing WODs to fix broken/missing links
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  processContentWithExerciseMatching,
  logUnmatchedExercises,
  type ExerciseBasic,
} from "../_shared/exercise-matching.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOG_PREFIX = "[REPROCESS-WOD]";
  console.log(`${LOG_PREFIX} 🔄 Starting WOD exercise reprocessing...`);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { wodIds, targetDate, processAll } = body;

    console.log(`${LOG_PREFIX} Request params:`, { wodIds, targetDate, processAll });

    // Fetch WODs to reprocess
    let wodsQuery = supabase
      .from("admin_workouts")
      .select("id, name, main_workout, warm_up, cool_down, finisher, activation");

    if (wodIds && Array.isArray(wodIds) && wodIds.length > 0) {
      wodsQuery = wodsQuery.in("id", wodIds);
    } else if (targetDate) {
      wodsQuery = wodsQuery.eq("generated_for_date", targetDate);
    } else if (processAll) {
      // Process ALL workouts - no filter
      console.log(`${LOG_PREFIX} Processing ALL workouts`);
    } else {
      // Default: today's WODs
      const today = new Date().toISOString().split("T")[0];
      wodsQuery = wodsQuery.eq("generated_for_date", today);
    }

    const { data: wods, error: wodsError } = await wodsQuery;

    if (wodsError) {
      console.error(`${LOG_PREFIX} ❌ Error fetching WODs:`, wodsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch WODs", details: wodsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!wods || wods.length === 0) {
      console.log(`${LOG_PREFIX} ⚠️ No WODs found to reprocess`);
      return new Response(
        JSON.stringify({ message: "No WODs found to reprocess", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`${LOG_PREFIX} Found ${wods.length} WODs to reprocess:`, wods.map(w => w.name));

    // Fetch exercise library
    const { data: exerciseLibrary, error: libraryError } = await supabase
      .from("exercises")
      .select("id, name, body_part, equipment, target")
      .limit(2000);

    if (libraryError || !exerciseLibrary) {
      console.error(`${LOG_PREFIX} ❌ Error fetching exercise library:`, libraryError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch exercise library" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`${LOG_PREFIX} Loaded ${exerciseLibrary.length} exercises from library`);

    const results: Array<{
      id: string;
      name: string;
      matched: number;
      unmatched: number;
      unmatchedNames: string[];
    }> = [];

    // Process each WOD
    for (const wod of wods) {
      console.log(`${LOG_PREFIX} 📋 Processing: "${wod.name}" (${wod.id})`);

      const contentFields = ["main_workout", "warm_up", "cool_down", "finisher", "activation"];
      const updates: Record<string, string> = {};
      let totalMatched = 0;
      const allUnmatched: string[] = [];

      for (const field of contentFields) {
        const content = wod[field as keyof typeof wod] as string | null;
        if (!content) continue;

        console.log(`${LOG_PREFIX} Processing field: ${field}`);
        
        const result = processContentWithExerciseMatching(
          content,
          exerciseLibrary as ExerciseBasic[],
          `${LOG_PREFIX}[${field}]`
        );

        updates[field] = result.processedContent;
        totalMatched += result.matched.length;
        allUnmatched.push(...result.unmatched);
      }

      // Update the WOD with processed content
      const { error: updateError } = await supabase
        .from("admin_workouts")
        .update(updates)
        .eq("id", wod.id);

      if (updateError) {
        console.error(`${LOG_PREFIX} ❌ Failed to update WOD "${wod.name}":`, updateError);
      } else {
        console.log(`${LOG_PREFIX} ✅ Updated WOD "${wod.name}" - ${totalMatched} exercises matched`);
      }

      // Clear old mismatched entries for this WOD
      const { error: deleteError } = await supabase
        .from("mismatched_exercises")
        .delete()
        .eq("source_id", wod.id);

      if (deleteError) {
        console.log(`${LOG_PREFIX} ⚠️ Failed to clear old mismatches:`, deleteError.message);
      } else {
        console.log(`${LOG_PREFIX} 🗑️ Cleared old mismatched entries for "${wod.name}"`);
      }

      // Log new unmatched exercises
      const uniqueUnmatched = [...new Set(allUnmatched)];
      if (uniqueUnmatched.length > 0) {
        await logUnmatchedExercises(
          supabase,
          uniqueUnmatched,
          "wod",
          wod.id,
          wod.name,
          LOG_PREFIX
        );
      }

      results.push({
        id: wod.id,
        name: wod.name,
        matched: totalMatched,
        unmatched: uniqueUnmatched.length,
        unmatchedNames: uniqueUnmatched,
      });
    }

    console.log(`${LOG_PREFIX} ✅ Completed reprocessing ${wods.length} WODs`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: wods.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Unexpected error:`, error);
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
