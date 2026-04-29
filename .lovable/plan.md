I checked the live data and the preview. The website is not missing today’s WOD data: today’s two WODs exist and the safe public metadata function returns them:

- Cadence Shift Flow
- Cadence Ground Pilates

What is actually wrong is the announcement layer and one remaining WOD data path:

1. The homepage WOD card is now loading correctly after the popup is closed.
2. The Smarty Ritual popup is still being triggered as if WOD is unavailable, even though WOD exists.
3. That popup blocks the page and makes it look like the WOD card is missing/being prepared.
4. `WODAnnouncementModal.tsx` still queries the protected `admin_workouts` table directly, so it can wrongly think no WOD exists for logged-out/free users.
5. `AnnouncementManager.tsx` no longer actually checks WOD availability before opening the Ritual modal; it unconditionally opens Ritual after page load.

Plan to fix it now:

1. Replace the broken announcement WOD availability logic
   - Update `AnnouncementManager.tsx` so it first calls the safe `get_visible_workout_metadata` function.
   - Filter by Cyprus date and `is_workout_of_day === true`.
   - If WODs exist, do not show the Ritual modal as a fallback.
   - If WODs do not exist, only then show the Ritual modal.

2. Restore the WOD announcement path safely
   - Update `WODAnnouncementModal.tsx` to use `get_visible_workout_metadata` instead of direct `admin_workouts` reads.
   - Keep full workout instructions protected; only public metadata is exposed.

3. Fix the false “being prepared” behavior
   - Ensure all public WOD display code uses the same source of truth: safe WOD metadata + Cyprus date.
   - Confirm homepage, `/workout`, and `/workout/wod` all resolve today’s WODs the same way.

4. Fix the dialog accessibility console errors
   - Add hidden `DialogTitle` / `DialogDescription` to the custom announcement modals so the Radix dialog errors stop appearing.
   - This is not the main WOD bug, but it is currently adding noise and should be cleaned while touching these files.

5. Verify after implementation
   - Open `/home` on mobile viewport.
   - Confirm the homepage shows today’s WOD card immediately.
   - Confirm the Ritual modal no longer appears when WODs exist.
   - Open `/workout/wod` and confirm both today’s WOD cards show.
   - Check console/network for WOD-related failures.

Technical detail:

The last update fixed the homepage card itself, but not the announcement manager. The announcement manager still had stale logic from the older flow, so it was telling the user interface “WOD unavailable” even while the WOD card data was available. I will remove that contradiction by making announcements use the same safe WOD metadata path as the homepage and WOD pages.