## Changes

### 1. `src/components/WorkoutToolsMobile.tsx` — icon-only centered toolbar
- Re-add the **1RM** button (re-import `OneRMCalculatorPopup` + `Calculator` icon, restore `calculatorOpen` state).
- All 4 buttons (Timer · Rounds · 1RM · Exercise Library) become **icon-only** — remove the text labels.
- Keep the "Tools:" prefix label, center the row, give each button a square icon size (e.g. `h-9 w-9 p-0`) with `aria-label` for accessibility.
- Order: **Timer · Rounds · 1RM · Exercise Library**.

### 2. `src/components/RoundsCounterPopup.tsx` — fix minimized tap
- Make the minimized chip **bigger** so the main count is itself a tap target:
  - Wrap the count number in a `<button>` that calls `tapRound()` / `tapRep()` (same logic as the big tap button).
  - Increase chip padding (`px-5 py-3`), larger count font (`text-2xl`), larger badges.
  - Keep Maximize + Close buttons on the right; remove the redundant small `+` button (the whole number area is now the tap zone).
- No change to expanded view, transparency, or in-page toolbar behavior.

### Files touched
- Edited: `src/components/WorkoutToolsMobile.tsx`
- Edited: `src/components/RoundsCounterPopup.tsx`