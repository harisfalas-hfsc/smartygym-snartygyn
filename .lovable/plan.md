

# Library-First Exercise Selection: Permanent Architecture Change

## The Problem (Why It Keeps Failing)

The current system sends the AI a giant wall of 1,329 exercise names as text, then hopes it picks from them. It doesn't. The AI ignores the list and invents exercises like "Child's Pose", "Bird-Dog", and "Happy Baby" which don't exist in the library. Post-processing then tries to fix this -- but that's backwards.

## The Solution: Library-First Architecture

Restructure the entire flow so the AI CANNOT generate exercises outside the library. The library becomes the INPUT, not a post-check.

### How It Will Work

```text
CURRENT (BROKEN):
  AI generates workout freely --> tries to match exercises --> fails --> no View buttons

NEW (CORRECT):
  Load library --> Filter by equipment/target/body_part --> 
  Give AI ONLY filtered exercises with IDs --> 
  AI picks from filtered list --> 
  Output includes exercise IDs --> 
  View buttons are guaranteed
```

## Implementation Steps

### Step 1: Restructure the Exercise Reference List Format

File: `supabase/functions/_shared/exercise-matching.ts`

Change `buildExerciseReferenceList` to output a STRUCTURED, BROWSABLE format grouped by TARGET MUSCLE and BODY PART, with exercise IDs included. Instead of a flat dump, the AI sees:

```text
TARGET: quads / BODY PART: upper legs
  [ID:0043] Barbell Full Squat (barbell)
  [ID:0044] Barbell Hack Squat (barbell)
  [ID:1502] Air Squat (body weight)
  [ID:1503] Bodyweight Lunge (body weight)

TARGET: glutes / BODY PART: upper legs
  [ID:0560] Barbell Hip Thrust (barbell)
  [ID:3561] Glute Bridge March (body weight)
  ...
```

This lets the AI "browse" by muscle/movement pattern exactly like the user described.

### Step 2: Update the AI Prompt to Mandate ID-Based Selection

File: `supabase/functions/generate-workout-of-day/index.ts`

Change the prompt instructions so the AI MUST output exercise names with their IDs from the library. The prompt will say:

```text
MANDATORY: For EVERY exercise you include, you MUST write it as:
{{exercise:ID:Exact Name}}

Example: {{exercise:0043:Barbell Full Squat}}

You MUST pick the ID and name EXACTLY from the library above.
If you write ANY exercise without {{exercise:ID:Name}} format, 
the workout will be REJECTED.
```

This means exercises come out of the AI already marked up with View buttons. No post-processing matching needed.

### Step 3: Add Code-Level Validation That REJECTS Non-Library Exercises

File: `supabase/functions/generate-workout-of-day/index.ts`

After the AI returns the workout JSON, scan for:
1. Any exercise text that is NOT wrapped in `{{exercise:ID:Name}}` markup in Main Workout and Finisher sections
2. Any `{{exercise:ID:Name}}` where the ID does not exist in the library

If violations are found: RE-PROMPT the AI with the specific violations, asking it to fix them using only library exercises. This is the safety net -- not the primary mechanism.

### Step 4: Apply Same Changes to Training Program Generation

File: `supabase/functions/generate-training-program/index.ts`

Same restructured library format, same ID-based output requirement, same validation. Training programs will also output exercises with `{{exercise:ID:Name}}` markup directly from the AI.

### Step 5: Remove Post-Processing Matching as Primary Mechanism

The `processContentSectionAware` and `processContentWithExerciseMatching` calls after AI generation become a SAFETY NET only (for edge cases), not the primary linking mechanism. The AI itself outputs the markup.

## What Changes

| File | Change |
|------|--------|
| `_shared/exercise-matching.ts` | `buildExerciseReferenceList` outputs structured format with IDs grouped by target/body_part |
| `generate-workout-of-day/index.ts` | Prompt restructured to require `{{exercise:ID:Name}}` output; validation added; post-processing becomes safety net |
| `generate-training-program/index.ts` | Same prompt and validation changes |

## What Does NOT Change

- Workout philosophy, periodization, coaching logic, RPE rules
- 5-section structure (Soft Tissue, Activation, Main Workout, Finisher, Cool Down)
- Section awareness (View buttons only in Main Workout and Finisher)
- Category-specific exercise rules (strength, cardio, metabolic, etc.)
- Equipment/bodyweight filtering logic
- Formatting, styling, design, typography
- Naming rules, difficulty system, format definitions
- All existing generation instructions and science

## Technical Detail: The AI's Internal Thinking Process

With the new structured library, the AI will follow this exact logic:

1. "I need a STRENGTH workout, EQUIPMENT, Intermediate difficulty"
2. "Let me look at the library for compound movements..."
3. "TARGET: quads -- I see Barbell Full Squat [0043], Barbell Hack Squat [0044]..."
4. "TARGET: glutes -- I see Barbell Hip Thrust [0560]..."
5. "I'll use `{{exercise:0043:Barbell Full Squat}}` for the main lift"
6. "For the finisher, TARGET: hamstrings -- `{{exercise:0581:Romanian Deadlift}}`"

The exercises come out pre-linked. View buttons are guaranteed.

## Permanent Rule

This architecture becomes the permanent standard for ALL future workout and training program generation. The library is ALWAYS loaded first. Exercises are ALWAYS selected from it. No exceptions.

