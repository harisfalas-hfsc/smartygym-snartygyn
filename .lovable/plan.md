

# Fix Exercise View Buttons (Two Frontend Bugs)

## What's Actually Wrong

The database content is correct. The "Leg Anchor Builder" workout has proper exercise markup for all 6 exercises (barbell bench squat, dumbbell romanian deadlift, smith leg press, lever leg extension, cable standing calf raise, dumbbell goblet squat). The problem is entirely in the frontend rendering.

**Two bugs are blocking View buttons from appearing:**

1. In `WorkoutDisplay.tsx` (the card-based workout view), `ExerciseHTMLContent` is used but with `enableExerciseLinking={false}` -- this explicitly disables all exercise matching and View button rendering.

2. In `IndividualWorkout.tsx` (the individual workout page you're looking at), it uses plain `HTMLContent` instead of `ExerciseHTMLContent`. Plain `HTMLContent` has no idea what `{{exercise:id:name}}` means, so it renders the raw markup text like "exercise:0026:barbell bench squat" on screen.

## The Fix

### File 1: `src/pages/IndividualWorkout.tsx`

Replace all `HTMLContent` components for workout sections (activation, warm_up, main_workout, finisher, cool_down) with `ExerciseHTMLContent` with `enableExerciseLinking={true}`. This will parse the `{{exercise:id:name}}` markup and render View buttons.

### File 2: `src/components/WorkoutDisplay.tsx`

Change `enableExerciseLinking={false}` to `enableExerciseLinking={true}` on line 283 for the workout content section. Same for training program content on lines 301 and 317.

## No Backend Changes Needed

The reprocessing already worked -- the database has the correct markup. This is purely a frontend display fix.

## Expected Result

After this fix, every exercise in the "Leg Anchor Builder" (and all other workouts/programs) will show:
- The exercise name as text
- A small eye icon (View button) next to it
- Clicking the eye opens the mobile-optimized exercise detail popup with name, body part, target, equipment, instructions, and GIF (when available)

