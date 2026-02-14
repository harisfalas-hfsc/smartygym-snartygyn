
# Fix Exercise View Buttons - Do It Right This Time

## What Went Wrong

1. **6 fake exercises were added to the library** with no GIFs, no proper descriptions. These must be deleted: `jumping-lunges`, `tuck-jumps`, `air-squats`, `plank-shoulder-taps`, `bodyweight-crunches`, `butt-kicks`
2. **Warm-up and cool-down exercises got View buttons** because the reprocessor doesn't distinguish between sections within the `main_workout` field -- it processes the entire field blindly
3. **159 out of 210 workouts** store warm-up, main workout, finisher, AND cool-down ALL inside the single `main_workout` database field, so the reprocessor can't just skip fields -- it needs to parse sections WITHIN the HTML

## The Fix

### Step 1: Delete the 6 Fake Exercises from Library

Remove `jumping-lunges`, `tuck-jumps`, `air-squats`, `plank-shoulder-taps`, `bodyweight-crunches`, `butt-kicks` from the `exercises` table. These have no GIFs and no real content.

### Step 2: Make the Reprocessor Section-Aware

Update `supabase/functions/_shared/exercise-matching.ts` to add a new function `processMainWorkoutAndFinisherOnly()` that:

- Parses the HTML content to detect section headers (by looking for patterns like "Main Workout", "Finisher" in bold/underlined text)
- ONLY applies exercise matching within Main Workout and Finisher sections
- Leaves Warm Up, Cool Down, Soft Tissue Preparation, and Activation sections completely untouched
- Strips any existing exercise markup (`{{exercise:...}}`) from non-Main/Finisher sections

### Step 3: Update the Reprocess Edge Function

Update `supabase/functions/reprocess-wod-exercises/index.ts` to:

- Use the new section-aware processing for the `main_workout` field
- For separate `finisher` fields (if they exist), process normally
- For `warm_up`, `cool_down`, and `activation` fields: STRIP any exercise markup instead of adding it

### Step 4: Handle Missing Exercises Properly

When an exercise name in a workout doesn't match any existing library exercise (above 0.65 confidence), the system will:
- Leave it as plain text (no View button)
- Log it to `mismatched_exercises` table for admin review
- NOT add fake exercises to the library

For the exercises that were previously linked to the 6 fake IDs, the reprocessor will try to match them to real existing exercises:
- "jumping lunge" should match to something like "lunge" or "jump squat" from the real library
- "air squat" should match to "bodyweight squat" (id: 3533) 
- "butt kicks" should match to an existing cardio exercise if one exists
- If no good match exists (below threshold), it stays as plain text

### Step 5: Strip Existing Bad Markup from All Content

Before reprocessing, scan all 210 workouts and:
- Remove any `{{exercise:jumping-lunges:...}}`, `{{exercise:tuck-jumps:...}}`, `{{exercise:air-squats:...}}`, `{{exercise:plank-shoulder-taps:...}}`, `{{exercise:bodyweight-crunches:...}}`, `{{exercise:butt-kicks:...}}` markup (references to deleted exercises)
- Remove ALL exercise markup from warm-up, cool-down, and activation sections within `main_workout`
- Then re-run matching ONLY on main workout and finisher sections

### Step 6: Reprocess All 210 Workouts and 28 Programs

Deploy and run the fixed reprocessor on everything. Then verify.

### Step 7: Update Frontend (IndividualWorkout.tsx)

Change `enableExerciseLinking` to `false` for Warm Up, Cool Down, Activation, Description, Instructions, and Tips sections. Only keep it `true` for Main Workout and Finisher.

### Step 8: Verify and Report

- Query every workout to confirm no exercise markup exists in warm-up/cool-down sections
- Confirm all main workout and finisher exercises either have valid View buttons (linking to real exercises with GIFs) or are plain text
- Confirm the 6 fake exercises are deleted
- Provide full report

## Technical Details

### Section Detection Logic

The `main_workout` field uses emoji headers to separate sections:

```text
Soft Tissue Preparation 5'  (skip)
Warm Up 5'                   (skip)
Main Workout: ...            (PROCESS - add View buttons)
Finisher: ...                (PROCESS - add View buttons)  
Cool Down 5'                 (skip)
```

The code will split HTML by these header patterns and only process the "Main Workout" and "Finisher" blocks.

### Frontend Changes (IndividualWorkout.tsx)

```text
Warm Up:      enableExerciseLinking={false}
Activation:   enableExerciseLinking={false}
Main Workout: enableExerciseLinking={true}
Finisher:     enableExerciseLinking={true}
Cool Down:    enableExerciseLinking={false}
Instructions: enableExerciseLinking={false}
Tips:         enableExerciseLinking={false}
Description:  enableExerciseLinking={false}
```

### Database Changes

- DELETE 6 fake exercises from `exercises` table
- UPDATE all `admin_workouts` to strip bad markup from warm-up/cool-down sections
- UPDATE all `admin_workouts` main workout and finisher sections with correct exercise markup

### Files Changed

1. `supabase/functions/_shared/exercise-matching.ts` - Add section-aware processing
2. `supabase/functions/reprocess-wod-exercises/index.ts` - Use section-aware processing, strip warm-up/cool-down markup
3. `src/pages/IndividualWorkout.tsx` - Disable exercise linking for non-main-workout sections
4. `src/components/WorkoutDisplay.tsx` - Same frontend fix for workout display component
