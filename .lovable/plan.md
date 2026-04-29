I found the immediate cause.

The WOD data exists in the database for today:
- BODYWEIGHT WOD: `Cadence Shift Flow`
- EQUIPMENT WOD: `Cadence Ground Pilates`
- Date: `2026-04-29`
- Both are visible and have images/payment metadata.

The break is in the frontend queries that still read WODs directly from `admin_workouts`. After the paid-content RLS hardening, logged-out/free users can no longer read premium rows directly from that table. That is correct for security, but the WOD carousel/card code was not fully migrated to the safe metadata RPC path.

Plan to fix:

1. Update WOD image/card queries to use safe metadata
   - In `src/pages/WorkoutFlow.tsx`, replace the direct `admin_workouts` query for WOD card images with `get_visible_workout_metadata`.
   - Filter the returned metadata client-side for:
     - `is_workout_of_day === true`
     - `generated_for_date === Cyprus today`
   - This keeps the WOD card visible without exposing full workout instructions.

2. Update the standalone Workout of the Day component
   - In `src/components/WorkoutOfTheDay.tsx`, replace the direct `admin_workouts` WOD query with the same safe metadata RPC.
   - This prevents the homepage/section WOD card from showing empty if used elsewhere.

3. Fix date consistency
   - `WorkoutFlow.tsx` currently uses the browser’s local date.
   - Change it to use the existing `getCyprusTodayStr()` helper, matching `WODCategory.tsx` and the generation system.
   - This avoids WOD disappearing around midnight/timezone boundaries.

4. Verify behavior
   - Check `/workout` on mobile size: WOD card appears in the carousel.
   - Check `/workout/wod`: today’s two WOD cards appear.
   - Confirm public/free users still receive metadata only, not protected workout content.

No database policy rollback is needed. The security fix should stay. The frontend needs to use the safe metadata function everywhere WOD preview/listing data is displayed.