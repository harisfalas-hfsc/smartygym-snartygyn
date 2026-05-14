## Goal
On mobile carousels, show more of each picture and avoid cutting off faces. Apply the exact same change to every mobile carousel for consistency.

## Affected carousels (mobile only — desktop untouched)
- Smarty Workouts carousel — `src/pages/WorkoutFlow.tsx`
- Smarty Programs carousel — `src/pages/TrainingProgramFlow.tsx`
- Smarty Tools carousel — `src/pages/Tools.tsx`
- Any other mobile carousel using the same card pattern (verify: `src/pages/Index.tsx`, `src/pages/WODCategory.tsx`, `src/pages/Community.tsx`, `src/components/HeroThreeColumns.tsx`) and align them only if they use the same image-card style.

## Changes (consistent across all three)
1. Increase card height: `h-[220px]` → `h-[260px]`.
2. Increase image area inside card: `h-[55%]` → `h-[70%]` (image goes from ~121px to ~182px tall — ~50% more visible image).
3. Add face-safe focus: keep `object-cover` (so the card edges stay clean), but add `object-[center_top]` so portraits and faces stay in frame instead of being cropped away.
4. Tighten the text section so the title + description still fit cleanly in the remaining 30% (reduce vertical padding from `p-3` to `px-3 py-2`, drop title margin to `mb-0.5`).

## Out of scope
- No change to desktop layouts.
- No change to which images are used or to image assets themselves.
- No change to card width / `basis-[75%]` (keeps the "peek of next card" affordance the carousels rely on).
- No change to the WOD rotating-image card logic — only its container height/percent updates with the rest.

## Files to edit
- `src/pages/WorkoutFlow.tsx` — mobile carousel CarouselItem block (around lines 424–472).
- `src/pages/TrainingProgramFlow.tsx` — mobile carousel CarouselItem block (around lines 359–397).
- `src/pages/Tools.tsx` — mobile carousel CarouselItem block (the `md:hidden` Carousel section).
- Quick audit pass on the other carousel files listed above; align only if they share the same card pattern.

## Verification
- Resize preview to 390px and 360px width.
- Confirm in each carousel: more of the image is visible, faces are no longer cropped at the chin/forehead, title + description still readable on one card without overflow.
