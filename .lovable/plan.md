

# Demo: Create Exercise "X" (Bodyweight Squat) with Two-Frame Animation

## What You Will See

A new exercise called **"X"** will appear in your Exercise Library. When you open it, instead of a GIF, you will see two sketch-style illustrations alternating every 1.2 seconds:
- **Frame 1**: Standing position (start of squat)
- **Frame 2**: Bottom squat position (end of squat)

Below the animation, you will see the same badges, description, secondary muscles, and step-by-step instructions as any other exercise.

## Implementation Steps

### Step 1: Add Two New Columns to `exercises` Table

Add `frame_start_url` and `frame_end_url` (both nullable text) so exercises can store individual frame images when no GIF exists.

### Step 2: Create Edge Function `generate-exercise-frames`

A backend function that:
1. Takes exercise name and ID as input
2. Calls the Lovable AI image generation API (google/gemini-2.5-flash-image) twice:
   - "Simple clean anatomical line-art sketch on white background: bodyweight squat STARTING position (standing upright). Gender-neutral human figure, no text, no labels, minimal style."
   - "Simple clean anatomical line-art sketch on white background: bodyweight squat BOTTOM position (deep squat). Gender-neutral human figure, no text, no labels, minimal style."
3. Uploads both images to the existing `exercise-gifs` storage bucket as `X_start.png` and `X_end.png`
4. Returns the public URLs

### Step 3: Insert Exercise "X" into Database

Insert the exercise with:
- **id**: `demo-x-bw-squat`
- **name**: `x`
- **body_part**: `upper legs`
- **equipment**: `body weight`
- **target**: `glutes`
- **difficulty**: `beginner`
- **category**: `strength`
- **secondary_muscles**: `["quadriceps", "hamstrings", "calves", "core"]`
- **instructions**: Full step-by-step squat instructions (6-7 steps)
- **description**: Science-based description matching the existing exercise style and SmartyGym branding
- **frame_start_url / frame_end_url**: URLs from the generated images
- **gif_url**: null (since we use frames instead)

### Step 4: Create `ExerciseFrameAnimation` Component

A small React component that:
- Accepts `frameStartUrl` and `frameEndUrl` props
- Alternates between the two images every 1.2 seconds using `setInterval`
- Uses a CSS fade transition for smooth switching
- Renders in the same container style as GIFs (white background, aspect-square, rounded-lg, border-2)

### Step 5: Update `ExerciseDetailModal` and `ExerciseDatabase`

Add a third display condition:

```
if gif_url exists --> show GIF (unchanged)
else if frame_start_url AND frame_end_url exist --> show ExerciseFrameAnimation
else --> show "GIF not available yet" placeholder (unchanged)
```

## How to Verify

1. Go to Exercise Library page
2. Search for "X"
3. Click on the exercise card
4. You should see two sketches alternating in the image area
5. Below: badges (Upper Legs, Body Weight, Glutes, Beginner, Strength)
6. Below: description, secondary muscles, instructions

## What Does NOT Change

- All existing exercises with GIFs remain exactly as they are
- No changes to exercise filtering, searching, or matching logic
- No changes to workout/program generation code
- The exercise library source-of-truth rule is unaffected

