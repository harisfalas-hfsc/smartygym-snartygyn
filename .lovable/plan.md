### Problem
In the mobile homepage WOD card, the metadata row (Category · Format · Difficulty · Duration) uses `flex-wrap`. When the carousel rotates between the two daily workouts, one may wrap to two lines while the other fits on one, causing the card height to jump and the image area to appear to resize.

### Solution
In `src/components/WorkoutOfTheDay.tsx`, update the `renderMiniCard` metadata row:

1. Replace `flex-wrap` with `flex-nowrap` and add `overflow-hidden` to the container.
2. Reduce horizontal gap from `gap-x-2` to `gap-x-1.5` to give more room.
3. Add `shrink-0` to all icons so they never compress.
4. Add `whitespace-nowrap` to all text spans in the row so text never wraps internally.
5. If the row still risks overflowing on very small screens, add `truncate` to the category and format text spans.

This forces every workout's metadata into a single consistent line, eliminating the layout shift when the carousel rotates.

### Files to edit
- `src/components/WorkoutOfTheDay.tsx` (the metadata row inside `renderMiniCard`)