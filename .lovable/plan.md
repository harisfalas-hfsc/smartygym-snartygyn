
# Fix Exercise Matching and Reprocess This Workout (Then All)

## What's Broken

The exercise extraction and matching has three bugs preventing matches:

1. **Trailing colons not stripped**: The bold text `<strong>Goblet Squats:</strong>` extracts as "Goblet Squats:" instead of "Goblet Squats"
2. **Equipment prefixes kill matches**: The AI writes "Standing Calf Raises" but the library has "dumbbell standing calf raise". The substring match gives only 0.52 confidence (below the 0.65 threshold) because the library name is much longer
3. **"Machine" suffix confuses matching**: "Leg Press Machine" vs "sled 45 leg press" -- the word "Machine" adds noise

## The Fix (3 Parts)

### Part 1: Improve extraction (strip colons and "Machine")

In `_shared/exercise-matching.ts`, update the `extractExerciseNames` function:
- Strip trailing colons and periods from extracted bold text
- Remove generic suffixes like "Machine" before matching (e.g., "Leg Press Machine" becomes "Leg Press")

### Part 2: Improve matching confidence for substring matches

The current formula for substring matches is `shorter / longer`. When the search term is "goblet squat" (11 chars) and the library name is "dumbbell goblet squat" (21 chars), confidence = 0.52 which fails.

New approach: If the search term is fully contained within the library name, boost the confidence. The exercise IS a goblet squat -- it just has an equipment prefix. Change the formula so that when the search is a full substring of the library name, confidence = 0.85 (high match). This captures cases like:
- "Goblet Squats" matching "dumbbell goblet squat" or "kettlebell goblet squat"
- "Calf Raises" matching "dumbbell standing calf raise"
- "Leg Press" matching "sled 45 leg press"
- "Leg Extension" matching "lever leg extension"

### Part 3: Auto-reprocess this workout, then ALL workouts and programs

After deploying the improved matching:
1. Call `reprocess-wod-exercises` with this specific workout ID to verify it works
2. Then call it with `processAll: true` to fix all existing workouts
3. Then call `reprocess-program-exercises` to fix all existing training programs

No manual action required from you -- I will trigger everything automatically.

## Technical Details

### File: `supabase/functions/_shared/exercise-matching.ts`

**extractExerciseNames function** (around line 216):
- Add colon/period stripping: `.replace(/[:;.]+$/, '')` before the existing cleanup line
- Add "Machine" suffix removal: `.replace(/\s+machine\s*$/i, '')`

**calculateConfidence function** (around line 72):
- When search term is a full substring of the library name (normalized), return a boosted confidence of `0.80 + (shorter/longer * 0.20)` instead of just `shorter/longer`
- This ensures "goblet squat" inside "dumbbell goblet squat" gets ~0.90 confidence instead of 0.52

**buildReplacementPatterns function** (around line 234):
- Add a pattern that matches the exercise name followed by a colon: `<strong>Exercise Name:</strong>` so the replacement works even when the original text had a colon

### File: `supabase/functions/reprocess-wod-exercises/index.ts`

No code changes needed -- the function already supports `wodIds` and `processAll` parameters. I will call it after deploying the matching fix.

### File: `supabase/functions/reprocess-program-exercises/index.ts`

Already created in previous step. Will be called after the workout reprocessing.

## Expected Results for "Leg Anchor Builder"

After the fix, all 6 exercises should match:
- "Barbell Back Squats" --> barbell full squat (or barbell high bar squat)
- "Dumbbell Romanian Deadlifts" --> dumbbell romanian deadlift
- "Leg Press Machine" --> sled 45 leg press
- "Leg Extension Machine" --> lever leg extension
- "Standing Calf Raises" --> dumbbell standing calf raise (or similar)
- "Goblet Squats" --> dumbbell goblet squat (or kettlebell goblet squat)

Each will get a View button that opens the mobile-optimized exercise detail popup.
