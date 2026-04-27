Plan to fix both items:

1. Disable the Workout of the Day announcement popup without deleting it
   - Keep `WODAnnouncementModal.tsx` untouched so the component remains available for future use.
   - Update `AnnouncementManager.tsx` so the WOD modal never opens automatically.
   - Remove/skip the WOD polling path so it does not keep checking the database every few minutes for the WOD announcement.
   - Keep the Smarty Ritual announcement behavior working, since you referenced it as the desired size/style benchmark.

2. Make the 3-day free trial popup smaller
   - Update `FreeTrialPopup.tsx` to use a compact modal size similar to `RitualAnnouncementModal`:
     - change width from large (`sm:max-w-lg`) to compact (`max-w-sm`)
     - reduce image height from about 200px to a smaller banner height
     - reduce content padding, heading size, paragraph size, button height, and spacing
   - Keep the same CTA, close button, routing, and eligibility logic.
   - Do not remove the popup; only make it visually smaller.

3. Quick validation after implementation
   - Run a targeted code check/build if available.
   - Confirm the WOD modal is disabled by code path, not deleted.
   - Confirm the trial popup remains functional but visually closer to the Smarty Ritual announcement size.

Technical details:
- Main files to change:
  - `src/components/announcements/AnnouncementManager.tsx`
  - `src/components/growth/FreeTrialPopup.tsx`
- No database changes are needed.
- No Stripe/payment logic changes are needed.
- The existing harmless `ResizeObserver loop completed with undelivered notifications` runtime message has no stack trace and does not point to these requested changes; I will avoid unrelated risky changes unless a concrete source appears during validation.