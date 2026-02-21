import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDayIn84Cycle, getPeriodizationForDay } from "../_shared/periodization-84day.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SELECT-WOD-FROM-LIBRARY] ${step}${detailsStr}`);
}

function getCyprusDateStr(): string {
  const now = new Date();
  const cyprusFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return cyprusFormatter.format(now);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine today's date in Cyprus timezone
    let targetDate: string;
    let parsedBody: any = {};
    try {
      parsedBody = await req.json();
      targetDate = parsedBody?.targetDate || getCyprusDateStr();
    } catch {
      targetDate = getCyprusDateStr();
    }

    logStep("Starting library selection", { targetDate });

    // Get periodization for today
    const dayIn84 = getDayIn84Cycle(targetDate);
    const periodization = getPeriodizationForDay(dayIn84);
    const isRecoveryDay = periodization.category === "RECOVERY";

    logStep("Periodization", {
      dayIn84,
      category: periodization.category,
      difficulty: periodization.difficulty,
      difficultyStars: periodization.difficultyStars,
      strengthFocus: periodization.strengthFocus,
      isRecoveryDay,
    });

    // Check if WODs already exist for today
    const { data: existingWods } = await supabase
      .from("admin_workouts")
      .select("id, name, equipment")
      .eq("is_workout_of_day", true)
      .eq("generated_for_date", targetDate);

    if (existingWods && existingWods.length > 0) {
      logStep("WODs already exist for today, skipping", { count: existingWods.length });
      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          message: `WODs already exist for ${targetDate}`,
          existing: existingWods.map(w => w.name),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get cooldown list (workouts used in last 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const cooldownDateStr = sixtyDaysAgo.toISOString().split("T")[0];

    const { data: cooldownWorkouts } = await supabase
      .from("wod_selection_cooldown")
      .select("source_workout_id")
      .gte("selected_for_date", cooldownDateStr);

    const cooldownIds = new Set((cooldownWorkouts || []).map(c => c.source_workout_id));
    logStep("Cooldown list", { count: cooldownIds.size });

    const selectedWorkouts: any[] = [];

    if (isRecoveryDay) {
      // Recovery day: pick 1 workout from RECOVERY category
      const selected = await selectWorkout(supabase, {
        category: "RECOVERY",
        difficulty: null,
        difficultyStars: null,
        equipment: null, // Any equipment for recovery
        cooldownIds,
        strengthFocus: null,
      });

      if (selected) {
        selectedWorkouts.push(selected);
      } else {
        logStep("WARNING: No recovery workout found in library");
      }
    } else {
      // Normal day: pick 1 BODYWEIGHT + 1 EQUIPMENT
      const bwSelected = await selectWorkout(supabase, {
        category: periodization.category,
        difficulty: periodization.difficulty,
        difficultyStars: periodization.difficultyStars,
        equipment: "BODYWEIGHT",
        cooldownIds,
        strengthFocus: periodization.strengthFocus || null,
      });

      if (bwSelected) {
        selectedWorkouts.push(bwSelected);
      } else {
        logStep("WARNING: No BODYWEIGHT workout found for", { category: periodization.category, difficulty: periodization.difficulty });
      }

      const eqSelected = await selectWorkout(supabase, {
        category: periodization.category,
        difficulty: periodization.difficulty,
        difficultyStars: periodization.difficultyStars,
        equipment: "EQUIPMENT",
        cooldownIds,
        strengthFocus: periodization.strengthFocus || null,
      });

      if (eqSelected) {
        selectedWorkouts.push(eqSelected);
      } else {
        logStep("WARNING: No EQUIPMENT workout found for", { category: periodization.category, difficulty: periodization.difficulty });
      }
    }

    if (selectedWorkouts.length === 0) {
      logStep("ERROR: No workouts found in library matching criteria");
      return new Response(
        JSON.stringify({
          success: false,
          error: "No matching workouts found in library",
          criteria: {
            category: periodization.category,
            difficulty: periodization.difficulty,
            isRecoveryDay,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Flag selected workouts as WOD
    for (const workout of selectedWorkouts) {
      const { error: updateError } = await supabase
        .from("admin_workouts")
        .update({
          is_workout_of_day: true,
          generated_for_date: targetDate,
          wod_source: "library",
          updated_at: new Date().toISOString(),
        })
        .eq("id", workout.id);

      if (updateError) {
        logStep("ERROR flagging workout as WOD", { id: workout.id, error: updateError.message });
      } else {
        logStep("Flagged workout as WOD", { id: workout.id, name: workout.name, equipment: workout.equipment });
      }

      // Insert cooldown record
      await supabase.from("wod_selection_cooldown").insert({
        source_workout_id: workout.id,
        selected_for_date: targetDate,
        category: workout.category || periodization.category,
        difficulty: workout.difficulty,
        equipment: workout.equipment,
      });
    }

    // Log to wod_generation_runs
    await supabase.from("wod_generation_runs").insert({
      cyprus_date: targetDate,
      status: "success",
      expected_count: isRecoveryDay ? 1 : 2,
      found_count: selectedWorkouts.length,
      is_recovery_day: isRecoveryDay,
      expected_category: periodization.category,
      trigger_source: "library-selection",
      completed_at: new Date().toISOString(),
      wods_created: selectedWorkouts.map(w => ({
        id: w.id,
        name: w.name,
        equipment: w.equipment,
        source: "library",
      })),
    });

    // Call send-wod-notifications ONLY if selecting for today's date
    const todayCyprus = getCyprusDateStr();
    const skipNotifications = parsedBody?.skipNotifications === true;

    if (targetDate !== todayCyprus) {
      logStep("Skipping notifications - selection is for a different date", { targetDate, todayCyprus });
    } else if (skipNotifications) {
      logStep("Skipping notifications - explicitly requested via skipNotifications parameter");
    } else {
      try {
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        await fetch(`${supabaseUrl}/functions/v1/send-wod-notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
          },
          body: JSON.stringify({}),
        });
        logStep("WOD notifications triggered");
      } catch (notifError) {
        logStep("WARNING: Failed to trigger WOD notifications", { error: String(notifError) });
      }
    }

    logStep("Library selection complete", {
      selectedCount: selectedWorkouts.length,
      workouts: selectedWorkouts.map(w => `${w.name} (${w.equipment})`),
    });

    return new Response(
      JSON.stringify({
        success: true,
        mode: "library-selection",
        date: targetDate,
        periodization: {
          dayIn84,
          category: periodization.category,
          difficulty: periodization.difficulty,
          strengthFocus: periodization.strengthFocus,
        },
        selected: selectedWorkouts.map(w => ({
          id: w.id,
          name: w.name,
          equipment: w.equipment,
          category: w.category,
          difficulty: w.difficulty,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

/**
 * Select a workout from the library matching the given criteria.
 * First tries exact match (category + difficulty + equipment).
 * If strengthFocus is provided, tries to match focus first then falls back.
 * If all candidates are in cooldown, picks the one used longest ago.
 */
async function selectWorkout(
  supabase: any,
  params: {
    category: string;
    difficulty: string | null;
    difficultyStars: [number, number] | null;
    equipment: string | null;
    cooldownIds: Set<string>;
    strengthFocus: string | null;
  }
): Promise<any | null> {
  const { category, difficulty, difficultyStars, equipment, cooldownIds, strengthFocus } = params;

  logStep("Selecting workout", { category, difficulty, equipment, strengthFocus, cooldownSize: cooldownIds.size });

  // Build base query
  let query = supabase
    .from("admin_workouts")
    .select("*")
    .eq("category", category)
    .eq("is_workout_of_day", false)
    .eq("is_visible", true);

  // Filter by equipment if specified
  if (equipment) {
    query = query.eq("equipment", equipment);
  }

  // Filter by difficulty range using stars
  if (difficultyStars) {
    query = query.gte("difficulty_stars", difficultyStars[0]).lte("difficulty_stars", difficultyStars[1]);
  }

  const { data: candidates, error } = await query;

  if (error) {
    logStep("Error querying candidates", { error: error.message });
    return null;
  }

  if (!candidates || candidates.length === 0) {
    logStep("No candidates found, trying without difficulty filter");
    
    // Fallback: try without difficulty filter
    let fallbackQuery = supabase
      .from("admin_workouts")
      .select("*")
      .eq("category", category)
      .eq("is_workout_of_day", false)
      .eq("is_visible", true);

    if (equipment) {
      fallbackQuery = fallbackQuery.eq("equipment", equipment);
    }

    const { data: fallbackCandidates } = await fallbackQuery;
    
    if (!fallbackCandidates || fallbackCandidates.length === 0) {
      logStep("No candidates even without difficulty filter");
      return null;
    }

    return pickFromCandidates(supabase, fallbackCandidates, cooldownIds, strengthFocus);
  }

  return pickFromCandidates(supabase, candidates, cooldownIds, strengthFocus);
}

/**
 * Pick best candidate from a list, preferring those not in cooldown.
 * If strengthFocus is provided, prefer workouts matching that focus.
 */
async function pickFromCandidates(
  supabase: any,
  candidates: any[],
  cooldownIds: Set<string>,
  strengthFocus: string | null
): Promise<any | null> {
  // Split candidates: those outside cooldown vs inside
  const available = candidates.filter(c => !cooldownIds.has(c.id));
  const inCooldown = candidates.filter(c => cooldownIds.has(c.id));

  logStep("Candidate split", { available: available.length, inCooldown: inCooldown.length });

  let pool = available.length > 0 ? available : candidates;

  // If strengthFocus, try to match focus first
  if (strengthFocus && pool.length > 1) {
    const focusMatch = pool.filter(c => 
      c.focus && c.focus.toUpperCase().includes(strengthFocus.toUpperCase())
    );
    if (focusMatch.length > 0) {
      pool = focusMatch;
      logStep("Narrowed by strength focus", { focus: strengthFocus, count: pool.length });
    }
  }

  // If all candidates are in cooldown, pick the one used longest ago
  if (available.length === 0 && inCooldown.length > 0) {
    logStep("All candidates in cooldown, picking oldest-used");
    
    // Get cooldown records with dates to find the oldest
    const { data: cooldownRecords } = await supabase
      .from("wod_selection_cooldown")
      .select("source_workout_id, selected_for_date")
      .in("source_workout_id", candidates.map(c => c.id))
      .order("selected_for_date", { ascending: true });

    if (cooldownRecords && cooldownRecords.length > 0) {
      // Pick the candidate whose most recent cooldown entry is oldest
      const oldestId = cooldownRecords[0].source_workout_id;
      const oldest = candidates.find(c => c.id === oldestId);
      if (oldest) return oldest;
    }
  }

  // Random selection from available pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
