

# Fix ALL Workouts and Training Programs: Universal Library-First Enforcement

## Current State: What's Still Broken

### 38 workouts still have non-library exercises
The previous reprocessing did NOT fully clean existing workouts. These still contain:
- "The Hundred" (plain text, no View button) -- e.g., Core Align Flow, Summit Gauntlet, Core Align
- "Side Kick Series" (plain text, no View button)
- "Abdominal Imprint" (plain text, no View button)
- `{{exercise:forearm-plank:Forearm Plank}}` -- a FAKE exercise ID not in the library (3 workouts)
- "Child's Pose" appearing in cool-down sections

### Training programs have NO strict enforcement at all
- `reprocess-program-exercises` does NOT call `guaranteeAllExercisesLinked` or `rejectNonLibraryExercises`
- `generate-training-program` does NOT call them either
- `regenerate-broken-programs` does NOT call them either
- Training programs were never cleaned with the strict rejection layer

### The `progression_plan` field is being processed (should be excluded per your rules)
The `reprocess-program-exercises` function processes `progression_plan`, which contains descriptive prose and should be skipped.

---

## Fix Plan

### Fix 1: Update `reprocess-program-exercises` to use full enforcement pipeline

Add `guaranteeAllExercisesLinked` and `rejectNonLibraryExercises` imports and run them on every processed field, exactly like `reprocess-wod-exercises` already does. Also remove `progression_plan` from the list of processed fields (keep only `program_structure` and `weekly_schedule`).

### Fix 2: Update `generate-training-program` to use full enforcement pipeline

After AI generation, add the same `guaranteeAllExercisesLinked` + `rejectNonLibraryExercises` steps on the `weekly_schedule` content before saving to the database.

### Fix 3: Update `regenerate-broken-programs` to use full enforcement pipeline

Same treatment -- add the sweep + rejection steps after any content repair.

### Fix 4: Redeploy and reprocess ALL existing content

After deploying the updated functions:
1. Trigger `reprocess-wod-exercises` with `processAll: true` in batches to fix all 38+ remaining broken workouts
2. Trigger `reprocess-program-exercises` (no params = all programs) to fix all 28 training programs

---

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/reprocess-program-exercises/index.ts` | Add `guaranteeAllExercisesLinked` + `rejectNonLibraryExercises` imports and call them after matching; remove `progression_plan` from processed fields |
| `supabase/functions/generate-training-program/index.ts` | Add `guaranteeAllExercisesLinked` + `rejectNonLibraryExercises` calls after AI generates weekly_schedule content |
| `supabase/functions/regenerate-broken-programs/index.ts` | Add `guaranteeAllExercisesLinked` + `rejectNonLibraryExercises` calls after content repair |

## Post-Deploy Actions

- Reprocess all 224 workouts in batches (processAll: true)
- Reprocess all 28 training programs
- Verify "The Hundred", "Side Kick Series", "Abdominal Imprint", "forearm-plank", and "Child's Pose" are all gone from every workout and program

## What This Guarantees

- Every workout of EVERY category (Pilates, Strength, Cardio, Challenge, etc.) enforces library-only exercises
- Every training program of EVERY category enforces library-only exercises
- No exercise can appear without a View button -- it gets substituted or removed
- The same 4-layer pipeline (AI markup, safety net, final sweep, strict rejection) applies universally to both workouts and training programs
- All 224 existing workouts and 28 training programs will be cleaned
