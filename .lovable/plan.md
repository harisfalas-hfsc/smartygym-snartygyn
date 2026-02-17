

## Upload Exercise GIFs for 4 Exercises

### What this does
Upload the 4 GIF files you provided to the file storage and update the exercise database records so the proper GIF displays instead of "GIF not available" or the AI-generated frame animation.

### Exercise-to-GIF mapping

| Exercise | Database IDs to update | GIF file |
|----------|----------------------|----------|
| Jumping Jacks | `jumping-jacks`, `jumping-jacks-cardio` | Jumping-jack.gif |
| Butt Kicks | `butt-kicks-cardio` | Butt-Kicks.gif |
| High Knees | `high-knees`, `high-knees-cardio` | HIGH_KNESS.gif |
| Air Squats | `air-squats` | Air_Squat.gif (replaces current frame animation) |

### Steps

1. **Copy GIF files** from uploads into `src/assets/exercises/` directory
2. **Upload each GIF** to the `exercise-gifs` storage bucket using the exercise ID as filename (e.g., `jumping-jacks.gif`)
3. **Update the `gif_url`** column in the `exercises` table for all 6 exercise records listed above
4. **Air Squats**: The existing frame animation (`frame_start_url`/`frame_end_url`) will be superseded since `gif_url` takes priority in the display logic

### How the display works
The exercise detail modal checks `gif_url` first -- if it has a value, it shows that GIF. If `gif_url` is null, it falls back to the two-frame animation. By setting `gif_url` for these exercises, the proper animated GIFs will show immediately.

### Result
All 4 exercises will display proper anatomical GIF illustrations when users tap the [VIEW] button in any workout.
