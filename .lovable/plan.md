## 1. Normalize carousel card typography

**Problem:** `src/pages/WorkoutFlow.tsx`, `src/pages/TrainingProgramFlow.tsx`, and `src/pages/Tools.tsx` use the same carousel card shell but with inconsistent text rules:

- Titles use `whitespace-nowrap` (silently clipped on narrower cards, different across pages).
- Descriptions: Tools uses `line-clamp-2`, WorkoutFlow & TrainingProgramFlow have no clamp — descriptions wrap freely and cards end up at different heights.

**Fix (visual only, no logic changes):** Standardize the title + description block to the homepage reference (`src/pages/Index.tsx` lines 528–544):

- Title `<h3>`: replace `whitespace-nowrap` with `line-clamp-2 min-h-[2.5rem]` so long titles wrap to a 2nd line consistently instead of being truncated, and short titles still reserve the same height.
- Description `<p>`: enforce `line-clamp-2 min-h-[2.5rem] leading-snug` on all three pages.
- Keep all spacing, icons, image area, and breakpoints exactly as they are today.

Files touched:
- `src/pages/WorkoutFlow.tsx` (around line 464–470)
- `src/pages/TrainingProgramFlow.tsx` (around line 388–393)
- `src/pages/Tools.tsx` (around line 233–238)

## 2. Recovery-day WOD card fills full width

**Problem:** In `src/pages/WODCategory.tsx` (lines 278–282), on recovery days the single `variousWOD` card is wrapped in `max-w-2xl mx-auto`, so on tablet/desktop it sits centered with large empty space on the right (and left), breaking the layout rhythm of the rest of the page which is laid out at `max-w-[1500px]`.

**Fix:** Make the recovery card occupy the same horizontal footprint as the two-card grid used on training days.

- Remove the `max-w-2xl mx-auto` wrapper.
- Wrap the recovery card in the same desktop grid container used on training days (`grid grid-cols-1 md:grid-cols-2 gap-6`) and apply `md:col-span-2` to the single card so it spans the full row on tablet/desktop.
- On mobile (single column) the card naturally takes the full width — no separate mobile branch needed.

Result: the recovery card spans the entire container width with no dead space on the right, matching the visual weight of the two-card training-day layout.

File touched:
- `src/pages/WODCategory.tsx` (lines 278–282)

## Out of scope

- No changes to WOD generation, data, routing, or business logic.
- No changes to homepage carousel (already the reference).
- No changes to mobile carousel `basis-[…]` sizes set in earlier turns.
