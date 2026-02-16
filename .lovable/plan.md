

# Permanent Global Rule: Exercise Library as Single Source of Truth

## What This Does

Embeds your exact rule — word for word — into the AI generation code so that every workout, WOD, and training program generated from this moment forward can ONLY use exercises from the exercise library database (the equivalent of exerciseData_complete.json). No exceptions, no inventions, no synonyms.

## What Needs to Change

### Problem: Hardcoded Exercise Names in Prompts

The current prompts contain dozens of hardcoded exercise name examples that tell the AI things like:

- "ALLOWED EXERCISES: Burpees, Squat Jumps, High Knees, Mountain Climbers..."
- "Cat-Cow, Thoracic Rotations, 90/90 Hip Rotations, Dead Bugs..."
- "Kettlebell Swings, Thrusters, Dumbbell Snatches..."

These example lists are the root cause of the AI inventing exercises. When the AI sees "Cat-Cow" in the prompt instructions but "Cat-Cow" doesn't exist in the library with that exact name, it writes "Cat-Cow" anyway because the prompt told it to.

### The Fix: Replace Hardcoded Names with Library-Browse Instructions

Every category-specific "ALLOWED EXERCISES" section will be rewritten to say:

"Browse the EXERCISE LIBRARY above. Filter by TARGET MUSCLE: [relevant muscles for this category]. Select exercises ONLY from the filtered results."

The coaching philosophy, forbidden patterns, rest periods, intensity rules, and category purpose remain UNTOUCHED. Only the exercise name lists are replaced with library-browse instructions.

## Implementation Steps

### Step 1: Add Permanent Global Rule to Exercise Reference Header

File: `supabase/functions/_shared/exercise-matching.ts` (in `buildExerciseReferenceList`)

Add the user's exact rule as the first block in the library header that gets sent to the AI with every generation:

```text
PERMANENT GLOBAL RULE — NO EXCEPTIONS:
The exercise library below is the SINGLE AND EXCLUSIVE source of truth.
You are permanently forbidden from:
- Creating new exercises
- Modifying exercise names
- Renaming exercises
- Using synonyms
- Inventing variations
- Using external knowledge
- Using memory of exercises outside this library
If an exercise does not exist exactly in this library, it does not exist.
You must NEVER generate a workout first and then try to match exercises.
Selection must ALWAYS start from this library.
If a requested exercise does not exist, adapt using the closest available 
exercise FROM THIS LIBRARY. Never create a new one.
This rule overrides all other instructions. This rule is permanent.
```

### Step 2: Replace Hardcoded Exercise Lists in WOD Prompt

File: `supabase/functions/generate-workout-of-day/index.ts`

For each category section, replace the "ALLOWED EXERCISES: [list of names]" with library-browse instructions:

- **STRENGTH**: "Browse library by TARGET: quads, glutes, pecs, lats, delts. Select compound movements."
- **CARDIO**: "Browse library by TARGET: cardiovascular system. For bodyweight, filter equipment='body weight'."
- **METABOLIC**: "Browse library by TARGET: full body movements. Select explosive/power exercises."
- **CALORIE BURNING**: "Browse library for high-rep bodyweight and plyometric exercises."
- **MOBILITY and STABILITY**: "Browse library by TARGET: spine stabilizers, hip flexors, rotator cuff."
- **CHALLENGE**: "Browse library for any exercises suitable for high-rep fatigue work."

What stays the same in each category: philosophy, forbidden patterns, rest periods, RPE targets, format rules, coaching mindset, intensity governance.

### Step 3: Replace Hardcoded Exercise Lists in Training Program Prompt

File: `supabase/functions/generate-training-program/index.ts`

Same replacement: remove hardcoded exercise name examples from category philosophy sections. Replace with "Browse the exercise library by TARGET MUSCLE and BODY PART."

### Step 4: Strengthen Post-Generation Validation

File: `supabase/functions/generate-workout-of-day/index.ts`

The existing validation already checks IDs. Add a final check: scan for any exercise-like text in Main Workout/Finisher that does NOT have `{{exercise:ID:Name}}` markup. If found, run the safety-net matcher one more time. This is already partially in place but will be made more explicit.

## What Does NOT Change (Untouched)

- Workout philosophy, periodization, coaching logic
- 84-day cycle, difficulty system, RPE rules
- 5-section structure (Soft Tissue, Activation, Main Workout, Finisher, Cool Down)
- Category philosophy and mindset descriptions
- Format definitions and rules
- Equipment governance
- Volume and value-for-money standards
- Challenge gamification concepts
- Recovery/Pilates special structures
- Naming rules
- HTML formatting rules
- Strength day focus system
- All training program category philosophies (Functional Strength, Hypertrophy, Weight Loss, Low Back Pain, Mobility)
- Periodization context (yesterday/tomorrow awareness)

## Summary

| Area | Change |
|------|--------|
| `_shared/exercise-matching.ts` | Add permanent global rule text to library header |
| `generate-workout-of-day/index.ts` | Replace hardcoded exercise name lists with library-browse instructions in all 6+ category sections |
| `generate-training-program/index.ts` | Same replacement for training program category sections |
| Philosophy/coaching/formatting | Zero changes |

