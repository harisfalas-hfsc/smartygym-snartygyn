## Plan

You are right: this must be fixed across all breakpoints, not only mobile. The recovery WOD has one card, so it must not behave like a carousel slide or a half-grid card anywhere.

## Implementation

1. Fix `src/pages/WODCategory.tsx`
   - Render recovery WOD as a dedicated single-card layout for all screen sizes.
   - Use a plain full-width wrapper: `w-full` / `max-w-none`.
   - Remove the current `md:grid-cols-2` recovery wrapper because a single recovery card should not be treated like a two-card row.
   - Ensure no carousel arrows/dots appear for the recovery card when only one WOD exists.

2. Fix the WOD card itself
   - Change the card root from relying on `flex-1` to explicitly using `w-full max-w-none`.
   - Keep normal training-day cards unchanged visually, but make them also fill their grid/carousel item correctly.

3. Check related recovery rendering
   - Review the homepage `WorkoutOfTheDay` recovery mini-card too, because it currently has `max-w-md mx-auto`, which creates the same centered/narrow single-card problem.
   - If recovery WOD is displayed there, make that recovery card fill its available container consistently as well.

4. Verify all breakpoints
   - Mobile/current preview width.
   - Tablet portrait.
   - Desktop.

## Scope

Only recovery WOD card width/alignment and single-card carousel behavior. No WOD data, generation, pricing, content, or unrelated layout changes.