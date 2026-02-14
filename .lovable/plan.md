
# Fix Exercise View Buttons For ALL Workouts and Training Programs

## Root Cause

The exercise matching system has a fundamental extraction flaw: it only looks for exercise names inside `<strong>` (bold) tags. But most workouts store exercises as plain text in list items:

```text
-- What the system extracts (bold only):
<strong>Station 1:</strong> Burpees    --> extracts "Station 1:" prefix, ignores "Burpees"

-- What it misses (plain text in list items):
<li><p>20 Air Squats</p></li>          --> completely ignored
<li><p>Burpees</p></li>                --> completely ignored
<li><p>15 Push-ups (on knees)</p></li> --> completely ignored
```

The working workout (Leg Anchor Builder) only works because it was manually fixed with `{{exercise:id:name}}` markup already embedded in the database.

## Fix Plan

### 1. Fix Backend Extraction (exercise-matching.ts - edge function shared code)

Add two new extraction patterns to `extractExerciseNames`:

- **Pattern A**: Extract exercise name from text AFTER bold prefix in the same element:
  `<strong>Station 1:</strong> Burpees` should extract "Burpees"

- **Pattern B**: Extract exercise names from list items with number prefix:
  `<li><p>20 Air Squats</p></li>` should extract "Air Squats"
  `<li><p>Burpees</p></li>` should extract "Burpees"

Add corresponding replacement patterns in `buildReplacementPatterns` so the markup can be inserted back into the correct location in the HTML.

### 2. Fix Frontend Extraction (ExerciseHTMLContent.tsx)

Improve `extractExerciseCandidate` to handle:
- "N ExerciseName" patterns (number BEFORE the name, e.g., "20 Air Squats")
- Plain exercise names without any suffix (e.g., just "Burpees" in a list item)
- Text after bold prefixes like "Station 1: Burpees"

### 3. Add Missing Common Exercises to Library

Several very common bodyweight exercises are missing from the 1,330-exercise library. These need to be added so matching can work:

- Jumping Lunges
- Tuck Jumps  
- Air Squats (alias for bodyweight squat)
- Plank Shoulder Taps (currently "shoulder tap" exists but not "plank shoulder taps")

Exercises that DO exist and should match correctly with better extraction:
- "burpee" (id: 1160) -- will match "Burpees"
- "mountain climber" (id: 0630) -- will match "Mountain Climbers"
- "push-up" (id: 0662) -- will match "Push-ups"
- "star jump (male)" (id: 3223) -- will match "Star Jumps"
- "High Knees" (id: high-knees) -- will match "High Knees"
- "Jumping Jacks" (id: jumping-jacks) -- will match "Jumping Jacks"
- "shoulder tap" (id: 3699) -- will match "Shoulder Taps"

### 4. Redeploy and Reprocess ALL Content

- Deploy the fixed edge function code
- Run `reprocess-wod-exercises` with `processAll: true` on all 210 workouts
- Run `reprocess-program-exercises` on all 28 training programs
- Verify by querying the database that exercises now have `{{exercise:id:name}}` markup

### 5. Verify Results

- Query all 210 workouts to confirm main_workout and finisher fields contain exercise markup
- Query all 28 training programs to confirm program_structure and weekly_schedule have markup
- Spot-check specific workouts (Pulse Surge Drive, Endurance Crucible) to confirm View buttons appear
- Check the mismatched_exercises table for any remaining gaps

## Technical Details

### Backend extraction changes (exercise-matching.ts)

```text
Current extraction flow:
  1. Find <strong>text</strong> --> extract text
  2. Filter structural headers
  3. Extract after prefix patterns (Station 1:, Tabata 1:, etc.)

New extraction flow (additions):
  4. Find text after bold closing tag in same parent:
     <strong>Station 1:</strong> Burpees --> extract "Burpees"
  5. Find exercise patterns in <li> items:
     <li><p>20 Air Squats</p></li> --> extract "Air Squats"
     <li><p>Burpees</p></li> --> extract "Burpees"
```

### Backend replacement changes

New replacement patterns needed for plain-text exercises:
- Replace `Station 1:</strong> Burpees` with `Station 1:</strong> {{exercise:1160:burpee}}`
- Replace `20 Air Squats` with `20 {{exercise:id:name}}`

### Frontend changes (ExerciseHTMLContent.tsx)

Update `extractExerciseCandidate` to add patterns:
- `/^(\d+)\s+([A-Za-z][A-Za-z\s'-]+)/` for "20 Air Squats"
- Standalone exercise names without suffix pattern
- Handle text segments after bold elements in same parent

### Database: Add missing exercises

Insert ~4-6 common bodyweight exercises that are genuinely missing from the library (Jumping Lunges, Tuck Jumps, Air Squats, Plank Shoulder Taps, Bodyweight Crunches).

## Expected Outcome

- All 210 workouts will have View buttons on main workout and finisher exercises
- All 28 training programs will have View buttons on exercises
- Every View button will link to the correct, specific exercise from the library
- Warm-up, cool-down, and activation exercises may remain without View buttons (as agreed)
- Future workouts and programs will automatically get View buttons via the same improved logic
