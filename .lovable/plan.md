
# Fix ALL Exercise View Buttons - Final Comprehensive Fix

## Root Causes Found

1. **Frontend re-adds View buttons to warm-up/cool-down**: `ExerciseHTMLContent.tsx` does live fuzzy matching on ALL rendered text, overriding the clean DB data. Even if the DB has no markup in warm-up, the frontend matches "Jumping Jacks" and "High Knees" and adds View buttons at render time.

2. **Training programs have ZERO exercise markup**: Program content uses `<br>`-separated lines (`1. Squat to Press - 40 sec work`) which the extraction logic doesn't handle. It only handles `<strong>` tags and `<li>` items.

3. **Some workout exercises missed despite existing in library**: "decline push-up" (id: 0279), "diamond push-up" (id: 0283) exist in the library but were not marked up. Likely a replacement pattern bug.

4. **Missing exercises left as plain text**: User's requirement is clear: if an exercise doesn't match the library, REPLACE the exercise name with the closest library match. Every exercise in main workout/finisher MUST have a View button.

## The Fix

### Step 1: Remove Live Frontend Matching (ExerciseHTMLContent.tsx)

Remove Steps 2 and 3 (bold matching and plain-text matching) from the frontend component entirely. The frontend will ONLY:
- Parse `{{exercise:id:name}}` markup (Step 1) and render View buttons for those
- Render everything else as plain HTML

This eliminates ALL frontend section-awareness bugs permanently. The backend reprocessor is the single source of truth for exercise linking.

### Step 2: Fix Backend Extraction for Training Programs (exercise-matching.ts)

Add new extraction patterns to `extractExerciseNames`:

- **`<br>`-separated numbered lines**: `1. Squat to Press - 40 sec work` extracts "Squat to Press"
- **`<br>`-separated plain lines**: `Goblet Squats, RDL, Rows, Press - 3x12 each` extracts each comma-separated exercise
- **Lines after `<br>` tags**: Many programs use `<br>` instead of `<li>` for line breaks

Add corresponding replacement patterns in `replaceExerciseInContent` for `<br>`-prefixed lines.

### Step 3: Fix Replacement Pattern Bugs (exercise-matching.ts)

Fix why "decline push-up" in `<strong>decline push-up</strong>` wasn't replaced. Review and fix the regex replacement patterns to handle:
- Exercise names that contain hyphens (push-up, push-ups)
- Exercise names followed by sets/reps metadata in the same bold tag
- Exercise names with prefix patterns like "C2:" or "B2:"

### Step 4: Force-Match Unmatched Exercises (exercise-matching.ts)

New behavior for the reprocessor: when an exercise name doesn't match above the 0.65 threshold, instead of leaving it as plain text:

1. Lower threshold to 0.45 and try again
2. If a match is found, REPLACE the exercise name in the content with the matched library exercise name AND add the markup
3. If still no match (below 0.45), leave as plain text and log to mismatched_exercises

This means "Plank Jacks" will be replaced with the closest plank exercise from the library, "Single-Leg Glute Bridges" will match to "glute bridge march" or similar, etc.

### Step 5: Fix Training Program Reprocessor (reprocess-program-exercises)

Update to handle the program HTML format properly. Programs don't have emoji section headers, so ALL exercises in the program should get View buttons (no section filtering needed for programs).

### Step 6: Reprocess ALL 211 Workouts and 28 Training Programs

Deploy fixed edge functions and run full reprocessing on everything.

### Step 7: Verify

Query the database to confirm:
- No workout has exercise markup in warm-up/cool-down sections (emojis before 💪)
- Every main workout and finisher exercise has `{{exercise:...}}` markup
- Every training program exercise has `{{exercise:...}}` markup
- Frontend renders View buttons ONLY from markup, not from live matching

## Technical Details

### Frontend changes (ExerciseHTMLContent.tsx)

Remove the entire Step 2 (bold matching block) and Step 3 (plain-text DOM walking block). Keep only Step 1 (markup parsing) and the DOM-to-React rendering. The `isInProcessableSection` function and `extractExerciseCandidate` function become unused and should be removed.

The `useExerciseLibrary` hook import can be simplified since `findMatchingExercise` is no longer needed.

### Backend extraction additions (exercise-matching.ts)

New Pattern 4 for `extractExerciseNames`:
- Split HTML by `<br>` and `<br/>` tags
- For each line, try numbered format: `N. Exercise Name - duration/reps`
- For each line, try plain format: `Exercise Name - duration/reps`
- For comma-separated lists: split by comma and try each

New replacement patterns in `replaceExerciseInContent`:
- Pattern for `<br>` preceded exercises: handle replacement in `<br>`-delimited content

### Force-match logic (exercise-matching.ts)

New function `forceMatchExercise`:
- First try normal matching at 0.65 threshold
- If no match, try at 0.45 threshold
- If match found at lower threshold, return the library exercise name as the replacement name (not the original name)
- The reprocessor will then replace both the name AND add markup

### Files Changed

1. `src/components/ExerciseHTMLContent.tsx` - Remove live matching (Steps 2 and 3), keep only markup parsing
2. `supabase/functions/_shared/exercise-matching.ts` - Add `<br>` extraction, fix replacement bugs, add force-match logic
3. `supabase/functions/reprocess-wod-exercises/index.ts` - Use force-match for main workout and finisher
4. `supabase/functions/reprocess-program-exercises/index.ts` - Use force-match for all program content
