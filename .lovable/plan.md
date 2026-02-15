

# Fix Equipment Exercises in Bodyweight Workouts + Missing View Buttons

## The Problem

1. **Equipment exercises inside BODYWEIGHT workouts**: The exercise matching engine matched text to the closest library name without checking equipment compatibility. "Squat" matched to "Smith Chair Squat" instead of "Bodyweight Squat." Found in 70+ bodyweight workouts.
2. **Missing View buttons**: Some exercises like "Mountain Climbers" were left as plain text without the `{{exercise:id:name}}` markup needed for View buttons.

## The Fix

### Step 1: Create a new backend function `audit-fix-bodyweight-workouts`

This function will:
- Fetch ALL workouts where `equipment = 'BODYWEIGHT'`
- Scan `main_workout` and `finisher` HTML for every `{{exercise:ID:NAME}}` tag
- For each matched exercise, look up its `equipment` field in the exercise library
- If the exercise requires equipment (not "body weight"), find the closest bodyweight alternative from the library using the same body part and target muscle
- Replace the equipment exercise markup with the correct bodyweight exercise markup
- Also scan for unlinked exercise text (like "Mountain Climbers") and add proper `{{exercise:id:name}}` markup
- Process all 70+ affected workouts in one run without stopping

### Step 2: Update the shared exercise-matching module

Add an equipment-compatibility check to `processContentWithExerciseMatching` so that when a workout is tagged as BODYWEIGHT, only exercises with `equipment = 'body weight'` can be matched. This prevents the problem from recurring in future processing.

### Step 3: Run the function on all bodyweight workouts

Process every single bodyweight workout (estimated ~100+), fix all equipment mismatches, fix all missing View buttons, and generate a full report showing:
- Which workouts were fixed
- Which exercises were swapped (old exercise -> new exercise)
- Which exercises got new View buttons
- Any exercises that could not be matched

### Step 4: Verification

Query the database to confirm zero bodyweight workouts contain equipment exercises, and all exercises in Main Workout and Finisher sections have View button markup.

## What Will NOT Change
- Exercise names displayed to users stay natural (the replacement will be a biomechanically equivalent bodyweight exercise)
- Workout structure, formatting, and layout remain untouched
- Equipment workouts are not affected
- Training programs are not affected by this fix

## Technical Details

- New edge function: `supabase/functions/audit-fix-bodyweight-workouts/index.ts`
- Modified shared module: `supabase/functions/_shared/exercise-matching.ts` (add equipment filter parameter)
- Database tables read: `exercises` (for equipment field lookup), `admin_workouts` (for content)
- Database tables written: `admin_workouts` (corrected content)
- No frontend changes needed
- No AI balance consumed (pure string matching, no LLM calls)

