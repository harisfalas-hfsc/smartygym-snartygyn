

# Fix: WOD Duplicate Names, Missing Exercise View Buttons, and Data Issues

## Problems Identified

### 1. Both WODs Have the Same Name ("Summit Gauntlet")
**Root Cause**: In `generate-workout-of-day/index.ts`, the variable `firstWorkoutName` is initialized as `""` on line 639 but **never updated** after the first workout is generated. The `bannedNameInstruction` on line 677 checks `if (firstWorkoutName)` -- which is always empty, so the AI is never told to avoid reusing the name. Both BODYWEIGHT and EQUIPMENT workouts receive the same name.

### 2. Main Workout and Finisher Exercises Missing View Buttons
**Root Cause**: The AI generated some exercises as plain text (e.g., "15 Kettlebell Swing", "12 Barbell Jump Squat") instead of using `{{exercise:ID:Name}}` markup. The exercise-matching safety net on the backend ran but failed to match these because:
- The text includes quantities and modifiers ("15 Kettlebell Swing (heavy kettlebell)") that the fuzzy matcher struggles with
- The exercises DO exist in the library (verified: id `0549` = "kettlebell swing", id `0053` = "barbell jump squat", id `0295` = "dumbbell clean", id `0811` = "trap bar deadlift", id `1160` = "burpee")

Other exercises in the Activation and Cool Down sections DO have valid markup (e.g., `{{exercise:1511:hamstring stretch}}`) and those View buttons work correctly. The problem is isolated to exercises the AI wrote as plain text and the safety net couldn't match.

### 3. Invalid Exercise Markup IDs
Some markup uses non-existent IDs like `{{exercise:cat-cow-stretch:Cat-Cow Stretch}}`. While the Cat-Cow Stretch exercise exists in the library, its actual ID is `cat-cow-stretch` -- so these ARE valid. The issue is specifically with the Main Workout and Finisher sections where plain text was used instead of markup.

## Fix Plan

### Fix 1: Set `firstWorkoutName` After First Workout Generation (Critical)

**File**: `supabase/functions/generate-workout-of-day/index.ts`

After the workout content is acquired (around line 1997), add:
```
if (!firstWorkoutName && workoutContent.name) {
  firstWorkoutName = workoutContent.name;
}
```

This ensures the second workout (EQUIPMENT) receives the `bannedNameInstruction` with the first workout's name, preventing duplicate names.

Additionally, add a **post-insert name deduplication check**: after both workouts are inserted, if they somehow still share the same name, append the equipment type to the second workout's name (e.g., "Summit Gauntlet" becomes "Summit Gauntlet (Equipment)").

### Fix 2: Improve Exercise Matching Safety Net

**File**: `supabase/functions/_shared/exercise-matching.ts`

The safety net needs to better handle exercises embedded in workout text with quantities and modifiers. The current matching strips some characters but struggles with lines like "15 Kettlebell Swing (heavy kettlebell)" because it tries to match the entire line segment.

Improvement: Before fuzzy matching, strip leading quantities (digits) and trailing parenthetical modifiers from exercise candidates. For example:
- "15 Kettlebell Swing (heavy kettlebell)" --> extract "Kettlebell Swing" for matching
- "12 Barbell Jump Squat (light barbell)" --> extract "Barbell Jump Squat" for matching
- "10 Dumbbell Clean (heavy dumbbells)" --> extract "Dumbbell Clean" for matching

### Fix 3: Fix Today's WODs in Database (Immediate Data Repair)

Run SQL to:
1. Rename the EQUIPMENT WOD to a different name (since they're both "Summit Gauntlet")
2. Re-process the `main_workout` HTML for both WODs to add proper `{{exercise:ID:Name}}` markup for the plain-text exercises

This will be done by invoking the existing `regenerate-broken-programs` pattern or by direct SQL update with corrected HTML.

### Fix 4: Post-Generation Name Collision Guard

**File**: `supabase/functions/generate-workout-of-day/index.ts`

After the generation loop (around line 2452), add a final name-collision check:
```
if (generatedWorkouts.length === 2 && generatedWorkouts[0].name === generatedWorkouts[1].name) {
  // Rename the second workout
  const suffix = generatedWorkouts[1].equipment === "EQUIPMENT" ? " (Equipment)" : " (Bodyweight)";
  const newName = generatedWorkouts[1].name + suffix;
  await supabase.from("admin_workouts").update({ name: newName }).eq("id", generatedWorkouts[1].id);
}
```

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-workout-of-day/index.ts` | Fix `firstWorkoutName` assignment + add post-loop name dedup guard |
| `supabase/functions/_shared/exercise-matching.ts` | Improve text extraction to strip quantities/modifiers before matching |
| Database (SQL) | Repair today's WODs: rename Equipment WOD + fix exercise markup |

## Verification

After implementation:
- Confirm today's Equipment WOD has a different name from the Bodyweight WOD
- Confirm all exercises in Main Workout and Finisher sections show View buttons
- Confirm the exercise IDs in markup correspond to real exercises in the library

