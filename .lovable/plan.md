

# Rename Exercise "X" to "Air Squats" and Fix Start Frame

## What Will Change

1. **Rename**: Update the exercise name from "x" to "Air Squats" and change the ID from `demo-x-bw-squat` to `air-squats` for cleanliness.

2. **Fix Starting Position Image**: Regenerate ONLY the start frame with an improved prompt emphasizing a fully upright standing position (straight legs, no knee bend). The end frame (bottom squat) stays as-is.

3. **Storage Cleanup**: Upload the new start frame image, replacing the old one. Rename files to match the new ID (`air-squats_start.png`, `air-squats_end.png`).

## Steps

### Step 1: Update Database Record
- Change `name` from `x` to `Air Squats`
- Change `id` from `demo-x-bw-squat` to `air-squats`
- Update `frame_start_url` and `frame_end_url` to point to the renamed files

### Step 2: Regenerate Start Frame
- Call the `generate-exercise-frames` edge function with an updated prompt specifically for the starting position: a figure standing fully upright with straight legs, arms relaxed at sides
- Upload the new image to `exercise-gifs/air-squats_start.png`
- Copy/rename the end frame to `exercise-gifs/air-squats_end.png`

### Step 3: Update URLs in Database
- Set the new `frame_start_url` and `frame_end_url` pointing to the renamed files

## About AI Discovery

No additional changes are needed for AI discovery. The exercise library hook (`useExerciseLibrary`) fetches ALL exercises from the database. The fuzzy matching system (`exerciseMatching.ts`) will automatically match searches like "squat", "air squat", "bodyweight squat" to "Air Squats". The Smartly Suggest engine also pulls from the same database, so this exercise will appear in personalized recommendations too.

