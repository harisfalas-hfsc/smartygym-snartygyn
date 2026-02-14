

# Exercise Library Integration: AI Uses Your Library First

## The Problem

The AI generates exercise names freely (e.g., "Cable Glute Kickbacks") while your exercise library has 1,330 exercises with specific names (e.g., "cable glute kickback"). Users can't find exercises when searching, and View buttons don't appear because names don't match.

## The Solution

A two-part approach: (1) Make the AI pick exercises directly from your library, and (2) retroactively fix all 209 existing workouts and training programs.

---

## How It Will Work

### Part 1: AI Picks From Your Exercise Library (Future Content)

Before the AI generates any workout or training program, the system will:

1. Query the exercise library (1,330 exercises) and group them by body part and equipment type
2. Inject a condensed reference list into the AI prompt, organized like this:
   - BACK / body weight: pull-up, chin-up, inverted row, ...
   - BACK / cable: cable seated row, cable lat pulldown, ...
   - CHEST / dumbbell: dumbbell bench press, dumbbell fly, ...
   - UPPER LEGS / body weight: bodyweight squat, lunge, ...
3. Instruct the AI: "You MUST use exercises from this library. Write the name EXACTLY as listed. Choose exercises that match the category, equipment type, difficulty, and focus."
4. After the AI generates content, run the existing post-processing fuzzy matching as a safety net to catch any exercises the AI might have written slightly differently
5. Add `{{exercise:id:name}}` markup for every matched exercise

This applies to:
- Workout of the Day generation (automatic and manual)
- Training program generation (from admin prompts)

### Part 2: View Button + Popup (Already Built, Just Needs Data)

The frontend already has everything needed:
- `ExerciseHTMLContent` component already parses `{{exercise:id:name}}` markup and renders View buttons inline
- `ExerciseLinkButton` already shows the eye icon that opens a popup
- `ExerciseDetailModal` already displays exercise details in a mobile-optimized modal
- The frontend also does client-side fuzzy matching on bold text as a second pass

The only thing missing is the `{{exercise:id:name}}` markup in the stored workout content. Once the AI writes exact library names and the post-processing adds the markup, View buttons will appear automatically.

### Part 3: Fix All Existing Content (Retroactive)

Run the reprocess functions across all existing workouts and training programs:
- `reprocess-wod-exercises` (already exists) -- will scan all 209+ workouts, fuzzy-match exercise names to the library, and add `{{exercise:id:name}}` markup
- Create `reprocess-program-exercises` -- same logic for training programs
- Unmatched exercises get logged to the `mismatched_exercises` table (currently has 49 entries) for admin review

---

## Technical Implementation

### Step 1: Build Exercise Reference List Builder

Create a shared utility function in `supabase/functions/_shared/exercise-matching.ts` that:
- Queries all 1,330 exercises from the database
- Groups them by body_part and equipment
- Formats into a condensed string for the AI prompt (~8-10K tokens)

### Step 2: Update Workout Generation (`generate-workout-of-day`)

- Before the AI call, fetch and build the exercise reference list
- Add to the workout prompt: "EXERCISE LIBRARY REFERENCE: You MUST use exercises from this list. Write names EXACTLY as shown."
- Re-enable the exercise matching post-processing (currently disabled at line 1993-1997)
- After AI response, run `processContentWithExerciseMatching()` to add `{{exercise:id:name}}` markup
- Log unmatched exercises to `mismatched_exercises` table

### Step 3: Update Training Program Generation (`generate-training-program`)

- Same changes as Step 2 but for training programs
- Re-enable matching at line 466-468

### Step 4: Lower Matching Threshold

- Change confidence threshold from 0.75 to 0.65 in the shared matching code to catch more variations (e.g., "Push-Ups" vs "push up")

### Step 5: Fix Existing Content

- Update `reprocess-wod-exercises` to process ALL workouts (not just WODs)
- Create `reprocess-program-exercises` for training programs
- Both functions will scan content, fuzzy-match, add markup, and log mismatches
- Trigger both to run across all existing content

### Step 6: Admin Visibility

The admin panel already has a "Mismatched Exercises" section showing exercises that couldn't be matched. After reprocessing, this will show which exercises in existing content need manual attention (adding to the library or creating aliases).

---

## What Users Will See

After implementation:
- Every exercise in a workout will have a small View (eye) button next to it
- Tapping the View button opens a mobile-optimized popup showing:
  - Exercise name
  - Body part, target muscle, equipment
  - Description and instructions
  - GIF animation (when available)
- The popup works exactly like the current Exercise Library detail view
- No need to copy exercise names and search manually

---

## Files to Modify

1. `supabase/functions/_shared/exercise-matching.ts` -- Add exercise reference list builder, lower threshold
2. `supabase/functions/generate-workout-of-day/index.ts` -- Add exercise library to prompt, re-enable post-processing
3. `supabase/functions/generate-training-program/index.ts` -- Same changes
4. `supabase/functions/reprocess-wod-exercises/index.ts` -- Expand to process all workouts (not just today's WODs)
5. New: `supabase/functions/reprocess-program-exercises/index.ts` -- Reprocess all training programs

No frontend changes needed -- `ExerciseHTMLContent`, `ExerciseLinkButton`, and `ExerciseDetailModal` already handle everything.

---

## Cost Impact

- Extra ~8-10K tokens per AI generation call for the exercise reference list
- Estimated additional cost: ~$0.01-0.03 per workout generation
- One-time reprocessing of existing content: no AI cost (just database queries and fuzzy matching)
