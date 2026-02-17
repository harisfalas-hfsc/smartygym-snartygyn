

# Add 10 Missing Basic Exercises to the Library

## Overview
Create 10 new exercises in the database with full metadata (description, instructions, target muscles, etc.) matching the established format (e.g., Air Squats), then upload the 10 provided GIF/image files to storage and link them.

## The 10 Exercises

| # | Exercise Name | File Provided | Body Part | Target | Equipment |
|---|--------------|---------------|-----------|--------|-----------|
| 1 | Bicycle Crunch | Bicycle_Crunch.gif | Waist | Abs | Body Weight |
| 2 | Bird Dog | Bird-Dog.gif | Back | Spine | Body Weight |
| 3 | Broad Jump | Broad_Jump.webp | Upper Legs | Glutes | Body Weight |
| 4 | Cat-Cow Stretch | cat_cow.gif | Back | Spine | Body Weight |
| 5 | Clamshell | Clamshell.gif | Upper Legs | Glutes | Body Weight |
| 6 | Fire Hydrant | Fire_Hydrant.gif | Upper Legs | Glutes | Body Weight |
| 7 | Glute Bridge | Glute_Bridge.gif | Upper Legs | Glutes | Body Weight |
| 8 | Pigeon Stretch | pigeon.webp | Upper Legs | Glutes | Body Weight |
| 9 | Forearm Plank | PLANK.jpg | Waist | Abs | Body Weight |
| 10 | V-Up | V-up.gif | Waist | Abs | Body Weight |

## Steps

### Step 1: Copy all 10 files to project assets
Copy each uploaded file to `src/assets/exercises/` with clean filenames (e.g., `bicycle-crunch.gif`, `bird-dog.gif`, etc.)

### Step 2: Upload all 10 files to cloud storage
Upload each file to the `exercise-gifs` storage bucket.

### Step 3: Insert 10 exercise records into the database
Each exercise will have:
- **id**: Slug-based ID (e.g., `bicycle-crunch`, `bird-dog`)
- **name**: Proper display name
- **body_part, target, equipment**: As shown in the table above
- **secondary_muscles**: Array of 3-5 supporting muscles
- **instructions**: Array of 5-7 step-by-step cues
- **description**: 3-4 sentence expert description matching the Air Squats style (what it targets, why it matters, difficulty/accessibility)
- **difficulty**: beginner for all (these are foundational movements)
- **category**: strength, stretching, or cardio as appropriate
- **gif_url**: Public URL pointing to the uploaded file in cloud storage

### Technical Details

Each description follows the established pattern:
1. First sentence: What the exercise is and primary muscles targeted
2. Second sentence: Benefits (strength, mobility, stability, etc.)
3. Third sentence: Functional/practical value
4. Fourth sentence: Accessibility and suitability

Each instructions array follows the pattern:
1. Starting position setup
2. Body alignment cues
3. Movement execution (2-3 steps)
4. Key form points
5. Return to start / repeat cue

All 10 exercises will be inserted in a single database operation after all GIFs are uploaded to storage.

