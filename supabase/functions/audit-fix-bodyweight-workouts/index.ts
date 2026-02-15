import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Exercise {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
  target: string;
}

interface SwapRecord {
  workout_id: string;
  workout_name: string;
  field: string;
  old_exercise: string;
  new_exercise: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;
    const singleWorkoutId = body.workout_id || null;

    // 1. Load full exercise library
    // Load ALL exercises (paginate past 1000 row limit)
    let allExercises: Exercise[] = [];
    let offset = 0;
    const PAGE = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, body_part, equipment, target")
        .range(offset, offset + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allExercises = allExercises.concat(data);
      if (data.length < PAGE) break;
      offset += PAGE;
    }

    const bodyweightExercises = allExercises!.filter(
      (e: Exercise) => e.equipment === "body weight"
    );
    const exerciseById = new Map<string, Exercise>();
    for (const ex of allExercises!) exerciseById.set(ex.id, ex);

    console.log(`[AUDIT] Loaded ${allExercises!.length} exercises, ${bodyweightExercises.length} bodyweight`);

    // 2. Fetch bodyweight workouts
    let query = supabase
      .from("admin_workouts")
      .select("id, name, main_workout, finisher, equipment")
      .eq("equipment", "BODYWEIGHT");
    if (singleWorkoutId) query = query.eq("id", singleWorkoutId);

    const { data: workouts, error: wErr } = await query;
    if (wErr) throw wErr;
    console.log(`[AUDIT] Found ${workouts!.length} BODYWEIGHT workouts`);

    const swaps: SwapRecord[] = [];
    const unmatchedList: Array<{ workout: string; exercise: string }> = [];
    let workoutsFixed = 0;

    for (const workout of workouts!) {
      let changed = false;
      let newMain = workout.main_workout;
      let newFinisher = workout.finisher;

      if (workout.main_workout) {
        const result = swapEquipmentExercises(
          workout.main_workout, workout.id, workout.name, "main_workout",
          exerciseById, bodyweightExercises, swaps, unmatchedList
        );
        if (result !== workout.main_workout) { newMain = result; changed = true; }
      }

      if (workout.finisher) {
        const result = swapEquipmentExercises(
          workout.finisher, workout.id, workout.name, "finisher",
          exerciseById, bodyweightExercises, swaps, unmatchedList
        );
        if (result !== workout.finisher) { newFinisher = result; changed = true; }
      }

      if (changed && !dryRun) {
        const { error: uErr } = await supabase
          .from("admin_workouts")
          .update({ main_workout: newMain, finisher: newFinisher })
          .eq("id", workout.id);
        if (uErr) console.error(`[AUDIT] Failed to update ${workout.name}: ${uErr.message}`);
        else workoutsFixed++;
      } else if (changed) {
        workoutsFixed++;
      }
    }

    const report = {
      dry_run: dryRun,
      total_bodyweight_workouts: workouts!.length,
      workouts_fixed: workoutsFixed,
      equipment_swaps: swaps.length,
      unmatched_count: unmatchedList.length,
      swap_details: swaps,
      unmatched_details: unmatchedList,
    };

    console.log(`[AUDIT] DONE: ${workoutsFixed} fixed, ${swaps.length} swaps, ${unmatchedList.length} unmatched`);

    return new Response(JSON.stringify(report, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[AUDIT] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── Known mappings for common equipment → bodyweight swaps ──────────────────
// These override the automated matching for cases where name similarity is poor
const KNOWN_SWAPS: Record<string, string> = {
  // Squats
  "smith chair squat": "bodyweight drop jump squat",
  "barbell full squat": "jump squat",
  "barbell wide squat": "sumo squat",
  "barbell low bar squat": "jump squat",
  "dumbbell squat": "jump squat",
  "band squat": "jump squat",
  "kettlebell squat": "jump squat",
  "kettlebell pistol squat": "one leg squat",
  "barbell single leg split squat": "split squats",
  "dumbbell lunge": "bodyweight rear lunge",
  "smith squat": "jump squat",
  "smith sumo squat": "sumo squat",
  "smith leg press": "jump squat",
  "barbell side split squat": "side lunge",
  // Lunges
  "barbell rear lunge": "bodyweight rear lunge",
  "barbell lunge": "bodyweight rear lunge",
  "barbell lateral lunge": "side lunge",
  // Bridges / Glutes
  "barbell glute bridge": "glute bridge march",
  "band squat row": "bodyweight drop jump squat",
  "band bent-over hip extension": "flutter kicks",
  "band pull through": "glute-ham raise",
  "lever lying leg curl": "standing single leg curl",
  // Deadlifts / Hinges
  "barbell romanian deadlift": "glute-ham raise",
  "dumbbell romanian deadlift": "glute-ham raise",
  "barbell good morning": "glute-ham raise",
  // Leg curl
  "lever lying leg curl": "standing single leg curl",
  // Upper body
  "cable reverse crunch": "decline crunch",
  "band bicycle crunch": "bicycle crunch",
  "medicine ball chest push from 3 point stance": "modified hindu push-up (male)",
  "dumbbell standing bent over one arm triceps extension": "overhead triceps stretch",
  "band y-raise": "rear deltoid stretch",
  "dumbbell rotation reverse fly": "rear deltoid stretch",
  // Calf
  "hack calf raise": "standing calf raise (on a staircase)",
  "smith reverse calf raises": "one leg donkey calf raise",
  // Cardio machines
  "walking on stepmill": "high knee against wall",
  // Stretches
  "behind head chest stretch": "dynamic chest stretch (male)",
  "standing hamstring and calf stretch with strap": "hamstring stretch",
  "intermediate hip flexor and quad stretch": "chair leg extended stretch",
  "exercise ball seated hamstring stretch": "leg up hamstring stretch",
  "exercise ball hip flexor stretch": "seated glute stretch",
  "chest stretch with exercise ball": "dynamic chest stretch (male)",
  "exercise ball lying side lat stretch": "kneeling lat stretch",
  "exercise ball on the wall calf raise (tennis ball between knees)": "standing calf raise (on a staircase)",
  "calf stretch with rope": "seated calf stretch (male)",
  "assisted lying glutes stretch": "seated glute stretch",
  "reclining big toe pose with rope": "hamstring stretch",
  // Kettlebell
  "kettlebell swing": "jump squat",
  "kettlebell swings": "jump squat",
};

function norm(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function levenshtein(a: string, b: string): number {
  const m: number[][] = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = b[i - 1] === a[j - 1]
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
}

/**
 * Find the best bodyweight alternative for an equipment exercise.
 * 1. Check KNOWN_SWAPS first
 * 2. Find candidates with same target AND body_part, pick closest name
 * 3. Fall back to same body_part, then same target
 */
function findBodyweightAlternative(
  equipEx: Exercise,
  bwExercises: Exercise[]
): Exercise | null {
  // Check known swaps
  const knownName = KNOWN_SWAPS[equipEx.name.toLowerCase()];
  if (knownName) {
    const known = bwExercises.find(e => e.name.toLowerCase() === knownName.toLowerCase());
    if (known) return known;
    // Try normalized
    const kn = norm(knownName);
    const knownNorm = bwExercises.find(e => norm(e.name) === kn);
    if (knownNorm) return knownNorm;
  }

  // Tier 1: same target AND same body_part
  const tier1 = bwExercises.filter(e => e.target === equipEx.target && e.body_part === equipEx.body_part);
  if (tier1.length > 0) return findClosestByName(equipEx.name, tier1);

  // Tier 2: same body_part
  const tier2 = bwExercises.filter(e => e.body_part === equipEx.body_part);
  if (tier2.length > 0) return findClosestByName(equipEx.name, tier2);

  // Tier 3: same target
  const tier3 = bwExercises.filter(e => e.target === equipEx.target);
  if (tier3.length > 0) return findClosestByName(equipEx.name, tier3);

  return null;
}

function findClosestByName(name: string, candidates: Exercise[]): Exercise {
  const n = norm(name);
  let best = candidates[0];
  let bestScore = Infinity;
  for (const c of candidates) {
    const d = levenshtein(n, norm(c.name));
    if (d < bestScore) {
      bestScore = d;
      best = c;
    }
  }
  return best;
}

/**
 * Scan HTML for {{exercise:ID:NAME}} markup, check each exercise's equipment,
 * and swap equipment exercises with bodyweight alternatives.
 */
function swapEquipmentExercises(
  html: string,
  workoutId: string,
  workoutName: string,
  field: string,
  exerciseById: Map<string, Exercise>,
  bwExercises: Exercise[],
  swaps: SwapRecord[],
  unmatchedList: Array<{ workout: string; exercise: string }>
): string {
  let content = html;
  const markupPattern = /\{\{(?:exercise|exrcise|excersize|excercise):([^:]+):([^}]+)\}\}/gi;
  const toSwap: Array<{ fullMatch: string; id: string; name: string }> = [];

  let match;
  while ((match = markupPattern.exec(content)) !== null) {
    toSwap.push({ fullMatch: match[0], id: match[1], name: match[2] });
  }

  console.log(`[AUDIT-DBG] ${workoutName} ${field}: found ${toSwap.length} markups`);
  if (toSwap.length > 0) {
    console.log(`[AUDIT-DBG] First 3:`, JSON.stringify(toSwap.slice(0, 3)));
  }

  for (const m of toSwap) {
    const ex = exerciseById.get(m.id);
    if (!ex) {
      console.log(`[AUDIT-DBG] ID "${m.id}" NOT FOUND in exerciseById map`);
      continue;
    }
    if (ex.equipment === "body weight") continue;

    const alt = findBodyweightAlternative(ex, bwExercises);
    if (alt) {
      const newMarkup = `{{exercise:${alt.id}:${alt.name}}}`;
      content = content.replace(m.fullMatch, newMarkup);
      swaps.push({
        workout_id: workoutId,
        workout_name: workoutName,
        field,
        old_exercise: `${ex.name} (${ex.equipment})`,
        new_exercise: `${alt.name} (body weight)`,
      });
      console.log(`[AUDIT] SWAP "${workoutName}": "${ex.name}" → "${alt.name}"`);
    } else {
      unmatchedList.push({ workout: workoutName, exercise: ex.name });
      console.log(`[AUDIT] ⚠ No BW alt for "${ex.name}" in "${workoutName}"`);
    }
  }

  return content;
}
