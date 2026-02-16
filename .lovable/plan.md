

# Re-Verify and Fix ALL Existing Workouts and Programs

## Current State (Issues Found)

- **214 workouts**: All have some markup, BUT 3 exercise IDs have wrong zero-padding (e.g., `043` instead of `0043`) across 9 workouts. These View buttons are broken.
- **28 training programs**: 1 invalid ID (`084` instead of `0084`).
- **765 unmatched exercises** logged in the system from previous processing -- these are exercises in workouts/programs that never got View buttons at all.
- No markup in wrong sections (Activation, Warm-up, Cool Down are clean).

## What Needs to Happen

### Fix 1: Repair Zero-Padding on Exercise IDs

Find and fix all `{{exercise:043:...}}` to `{{exercise:0043:...}}`, `{{exercise:084:...}}` to `{{exercise:0084:...}}`, and `{{exercise:0000:...}}` (invalid ID -- needs replacement with correct exercise).

Affected: 9 workouts + 1 training program.

### Fix 2: Re-Run Section-Aware Relinking on ALL 214 Workouts

Use the `reprocess-wod-exercises` function to strip and re-apply exercise markup on all 214 workouts. This ensures:
- Every exercise in Main Workout and Finisher that exists in the library gets a View button
- No markup in other sections
- All IDs are correctly formatted

### Fix 3: Re-Run Relinking on ALL 28 Training Programs

Use the `reprocess-program-exercises` function on all 28 programs to ensure every exercise that exists in the library gets proper markup.

### Fix 4: Clear and Re-Check Mismatched Exercises Log

After reprocessing, the mismatched table will be refreshed with only genuinely unmatched exercises (ones that truly don't exist in the library). This gives a clean audit of what's left.

## Permanent Guarantee Going Forward

The library-first architecture is now built into the generation code:
- The AI receives the structured library (grouped by target/body part) with IDs BEFORE generating
- The AI MUST output `{{exercise:ID:Name}}` format
- Post-generation validation checks every ID against the database
- `processContentSectionAware` runs as safety net
- View buttons restricted to Main Workout and Finisher only

This is permanent. No future workout or program generation can bypass this -- it's enforced at the code level, not just in prompt instructions.

## What Does NOT Change

- Workout structure, philosophy, formatting, styling
- Periodization, coaching logic, RPE rules
- Category-specific exercise rules
- Equipment/bodyweight filtering
- Section awareness rules

## Execution

All 214 workouts and 28 programs will be batch-reprocessed in one operation using the existing edge functions. No manual workout-by-workout work needed.
