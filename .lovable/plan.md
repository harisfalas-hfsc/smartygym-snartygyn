

# Fix Missing View Buttons + Enforce Exercise Library for AI Generation

## Equipment Rule (Crystal Clear)

- **BODYWEIGHT workouts**: AI sees ONLY exercises where `equipment = 'body weight'`. No kettlebells, no barbells, no dumbbells, no machines -- period.
- **EQUIPMENT workouts**: AI sees the ENTIRE 1,329-exercise library (bodyweight exercises ARE allowed inside equipment workouts, plus all equipment exercises). No filtering.

## Two Problems to Fix

### Problem 1: Missing View Buttons on Existing Workouts
Some exercises in existing workouts are plain text without `{{exercise:id:name}}` markup. The `ai-exercise-linker` needs to run across ALL workouts to add View buttons.

### Problem 2: AI Generates Exercises Not in the Library
Current prompt says "PREFER listed exercises" -- too permissive. Must change to "ONLY use exercises from this library. NEVER invent exercises."

## Implementation Steps

### Step 1: Update shared exercise-matching module

File: `supabase/functions/_shared/exercise-matching.ts`

- Add `equipmentFilter` parameter to `buildExerciseReferenceList` and `fetchAndBuildExerciseReference`
- When `equipmentFilter = 'body weight'`, filter library to bodyweight-only exercises
- When no filter (equipment workouts), pass full library
- Change prompt from "PREFER listed exercises" to: **"You MUST ONLY use exercises from this list. Using ANY exercise not on this list is FORBIDDEN."**

### Step 2: Update workout-of-day generation

File: `supabase/functions/generate-workout-of-day/index.ts`

- When generating BODYWEIGHT workout: pass `equipmentFilter: 'body weight'`
- When generating EQUIPMENT workout: pass no filter (full library)

### Step 3: Update training program generation

File: `supabase/functions/generate-training-program/index.ts`

- Same equipment filter logic as workout generation

### Step 4: Create batch-relink function and run on ALL workouts

File: `supabase/functions/batch-relink-exercises/index.ts`

- Fetches ALL workout IDs from `admin_workouts` (both bodyweight AND equipment)
- Calls `ai-exercise-linker` in batches of 3-5 workouts
- Processes `main_workout` and `finisher` fields
- Adds `{{exercise:id:name}}` markup to every exercise that matches the library
- Reports which workouts were updated and how many View buttons were added

### Step 5: Store uploaded JSON as reference

File: `public/data/exerciseData_complete.json`

- Copy of the uploaded exercise library as documented reference
- Actual exercise data still comes from the `exercises` database table

### Step 6: Verification

- Query database to confirm all exercises in Main Workout and Finisher sections have View button markup
- Confirm zero bodyweight workouts contain equipment-only exercises
- Full report with counts

## What Changes

| File | Change |
|------|--------|
| `_shared/exercise-matching.ts` | Add equipment filter + strict prompt language |
| `generate-workout-of-day/index.ts` | Pass equipment type for filtering |
| `generate-training-program/index.ts` | Same equipment filter |
| `batch-relink-exercises/index.ts` | New function to relink all workouts |
| `public/data/exerciseData_complete.json` | Reference copy of exercise library |

## Cost Estimate
- Running ai-exercise-linker on ~213 workouts: approximately $0.50-$1.50 one-time (Gemini 2.5 Flash)

## What Does NOT Change
- Exercise names displayed to users
- Workout structure, formatting, layout
- Training programs (not relinked in this batch -- can be done separately)
- Frontend components

