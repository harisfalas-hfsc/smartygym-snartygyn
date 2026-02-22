

# Fix Exercise Library-First Generation and Mobile View Button Alignment

## Root Cause Analysis

### Why exercises outside the library keep appearing

There are **two root causes** working together:

1. **The prompt itself contains non-library exercises as examples.** The "Gold Standard Template" hardcoded in the prompt includes exercises like "Child's Pose", "Cat-Cow", "Foam roll quads", "The Hundred", "Roll Up", etc. -- exercises that do NOT exist in your 1,341-exercise library. The AI sees these examples and copies them. The Pilates section even provides a numbered list of 20 "Classical Pilates" exercises that the AI is told to use, but many of them don't exist in the library.

2. **The generation flow is backwards.** The current flow is: (a) Tell the AI to generate a workout, (b) Hope the AI uses `{{exercise:ID:Name}}` markup, (c) Run safety-net matching to fix what the AI missed. This "generate first, match later" approach means the AI invents exercises, and post-processing tries (and sometimes fails) to fix them.

### Why the View button floats away from the exercise name on mobile

The `ExerciseLinkButton` uses `inline-flex` which can cause the eye icon to wrap to the next line on narrow screens when the exercise name is long. The exercise name and button are separate `<span>` elements inside the inline-flex container, so they can break apart.

---

## Fix Plan

### Fix 1: Rewrite the Gold Standard Template to use ONLY library exercises with markup

Replace all plain-text exercise examples in the prompt with actual `{{exercise:ID:Name}}` markup using real IDs from the library. Remove the Pilates "Classical Pilates Order" list that names 20 exercises not in the library. Instead, tell the AI to select Pilates-appropriate exercises FROM the library only.

**Specific changes in `generate-workout-of-day/index.ts`:**

- The Gold Standard Template (lines 1681-1731) will be rewritten so every exercise example uses `{{exercise:ID:Name}}` format with real library IDs
- The Pilates section (lines 1426-1456) will remove the hardcoded classical Pilates exercise list and replace it with: "Select Pilates-appropriate exercises ONLY from the exercise library provided below. Do NOT use exercise names not found in the library."
- The Recovery section will get the same treatment -- no hardcoded exercise names
- The Cool Down example will remove "Child's Pose" and "Supine Spinal Twist" and replace with library exercises
- The Soft Tissue and Activation sections will be marked as non-exercise instructional text (foam rolling, breathing cues) so the AI knows these don't need library exercises

### Fix 2: Add a hard rejection layer after AI generation

After the AI generates the workout, add a validation step that:
1. Scans every `<li>` element for exercise-like text
2. For any text that does NOT have `{{exercise:}}` markup AND cannot be matched to a library exercise at confidence >= 0.50, **remove it and replace with the closest library exercise**
3. This is stronger than the current "final sweep" which accepts matches at 0.30 confidence (too low, causes wrong matches)

**Changes in `_shared/exercise-matching.ts`:**
- Update `guaranteeAllExercisesLinked` to raise the minimum confidence from 0.30 to 0.50
- When no match is found above 0.50, instead of skipping, replace the unmatched text with a library exercise that matches the same body part/target (contextual substitution)

### Fix 3: Add a STRICT post-generation validator

Create a new function `rejectNonLibraryExercises` that runs as the FINAL step before saving to the database. It will:
1. Parse all `{{exercise:ID:Name}}` markup in the content
2. Verify every ID exists in the loaded exercise library
3. For any remaining plain-text exercises in `<li>` elements without markup, force-replace with the closest library match
4. If ANY exercise still has no View button after this, log it to `mismatched_exercises` AND substitute with the closest match by body part

### Fix 4: Fix mobile View button alignment

**Changes in `ExerciseLinkButton.tsx`:**
- Change from `inline-flex` to `inline` layout with `whitespace-nowrap` on the button portion
- Make the Eye icon `inline` and `align-middle` so it stays on the same line as the last word of the exercise name
- Add `flex-shrink-0` to prevent the button from being pushed away

### Fix 5: Reprocess all existing workouts

After deploying the changes, trigger the `reprocess-wod-exercises` function to fix all existing workouts that have exercises without View buttons.

---

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/generate-workout-of-day/index.ts` | Rewrite Gold Standard Template examples to use real library exercise markup; remove Pilates hardcoded exercise list; add strict post-generation validation |
| `supabase/functions/_shared/exercise-matching.ts` | Raise `guaranteeAllExercisesLinked` confidence floor from 0.30 to 0.50; add contextual substitution for unmatched exercises; add `rejectNonLibraryExercises` validator |
| `src/components/ExerciseLinkButton.tsx` | Fix mobile alignment so the View button stays next to the exercise name |

---

## What This Guarantees

- The AI prompt will NEVER show exercise names that don't exist in the library
- The AI is forced to pick from the library FIRST (the prompt examples themselves use `{{exercise:ID:Name}}` format)
- Any exercise the AI still invents despite instructions gets forcefully replaced with the closest library match
- No exercise will ever appear without a View button -- the system will substitute rather than skip
- The View button will stay visually attached to the exercise name on all screen sizes

