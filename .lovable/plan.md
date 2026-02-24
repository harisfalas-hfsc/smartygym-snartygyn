

# Fix Duplicate Filters + Add Difficulty-Aware Exercise Selection (Workouts AND Training Programs)

## Problems

1. **Duplicate filter values in Exercise Library page** -- The database has case-inconsistent entries (e.g., `beginner` and `Beginner`, `cardio` and `Cardio`), causing the same option to appear twice in the dropdown filters.

2. **AI ignores exercise difficulty** -- The exercise reference list sent to the AI for both workout generation AND training program generation does NOT include each exercise's difficulty level. The AI literally cannot see whether an exercise is beginner, intermediate, or advanced. This is why an advanced exercise like "Dumbbell Burpee" ends up in a beginner workout.

## Solution

### 1. Database Cleanup (Migration)

Normalize the 4 mismatched records so filters show unique values:
- `UPDATE exercises SET difficulty = 'beginner' WHERE difficulty = 'Beginner'`
- `UPDATE exercises SET category = 'cardio' WHERE category = 'Cardio'`

This immediately fixes duplicate dropdown entries without any frontend code changes.

### 2. Add `difficulty` to the Exercise Reference System

Update the shared `exercise-matching.ts` module (used by BOTH workout generation AND training program generation):

- Add `difficulty` to the `ExerciseBasic` interface
- Add `difficulty` to the database query in `fetchAndBuildExerciseReference` (change `select("id, name, body_part, equipment, target")` to include `difficulty`)
- Show difficulty next to each exercise in the reference list output: `[ID:0043] Barbell Full Squat (barbell) [intermediate]`

### 3. Add Difficulty Constraint Rules to Exercise Reference Header

Add a new section to the `buildExerciseReferenceList` header text that tells the AI:

```
DIFFICULTY CONSTRAINT (MANDATORY):
- For BEGINNER workouts: Use ONLY exercises marked [beginner]. No intermediate or advanced.
- For INTERMEDIATE workouts: Use exercises marked [beginner] or [intermediate]. No advanced.
- For ADVANCED workouts: All difficulty levels allowed, but prioritize [intermediate] and [advanced].
- Exercises with no difficulty tag may be used at any level.
```

This rule applies universally since the reference list is shared by both WOD generation and training program generation.

### 4. Pass Workout Difficulty to Reference Builder (WOD Generation)

In `generate-workout-of-day/index.ts`, the difficulty level is already known. Add a `difficultyLevel` parameter to `fetchAndBuildExerciseReference` so the reference list header can state the specific constraint for this workout (e.g., "This is a BEGINNER workout -- use ONLY beginner exercises").

### 5. Pass Program Difficulty to Reference Builder (Training Program Generation)

In `generate-training-program/index.ts`, the difficulty is passed as `data.difficulty`. Thread it through to `fetchAndBuildExerciseReference` the same way.

## Files Changed

| File | Change |
|------|--------|
| Database migration | Normalize `Beginner` to `beginner` and `Cardio` to `cardio` in exercises table |
| `supabase/functions/_shared/exercise-matching.ts` | Add `difficulty` to `ExerciseBasic`, update DB query, show difficulty in reference list, add difficulty constraint rules to header |
| `supabase/functions/generate-workout-of-day/index.ts` | Pass difficulty level to `fetchAndBuildExerciseReference` |
| `supabase/functions/generate-training-program/index.ts` | Pass difficulty level to `fetchAndBuildExerciseReference` |

## What This Does NOT Change
- Exercise Library frontend page (filters load dynamically -- fixing the data fixes the UI)
- Calendar export features (untouched)
- Any other existing functionality
