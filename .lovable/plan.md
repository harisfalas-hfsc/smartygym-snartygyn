## Goal

Two layout-only refinements to the Rounds Tracker I just built. No logic changes.

---

## 1. Mobile: fit everything inside the viewport, no scroll

On phones (`/tools/rounds-tracker`), the tool currently scrolls because the big tap button is `55vh` plus header, breadcrumbs, mode toggle, target inputs, sound/vibrate row, undo/reset/+round row, and the footer count.

Make the whole tool live inside one compact card that fits the device viewport (like the hamburger menu drawer panel), with the giant tap button still dominating the space.

Changes in `src/pages/RoundsTracker.tsx` (mobile only — `lg:` keeps current desktop sizing):

- Outer wrapper switches to a fixed-height shell on mobile: `h-[100svh]` (small-viewport-height — accounts for mobile browser chrome) with `overflow-hidden` and `flex flex-col`. Desktop keeps `min-h-screen`.
- Drop the "Smarty Tools — Free to Use" line and the secondary explainer Card on mobile (kept on desktop). Page title shrinks to `text-lg` and breadcrumbs row tightens (`py-1`).
- Wrap the entire tool in a single `Card` styled like the hamburger sheet: `bg-card border-2 border-primary/30 rounded-xl shadow-lg`, internal `flex flex-col` with `flex-1 min-h-0` so the giant button stretches to fill remaining space.
- Compact the controls into a tighter stack:
  - Mode toggle: 2 small buttons, `h-8 text-xs`.
  - Target inputs: inline single-row with shorter labels (`Rounds` / `Reps`), `h-8` inputs.
  - Direction + Sound + Vibrate collapse into one horizontal row of small icon-only toggles (`h-7 px-2`).
- Big tap button becomes `flex-1` (fills the remaining card space instead of `55vh min-h-[320px]`). The huge number uses `clamp(72px, 18vh, 160px)` font-size so it always fits.
- Bottom action row (Undo / Reset / +Round) shrinks to `h-9` and the "Rounds done / Reps this round" footer becomes a one-line `text-xs` strip.
- Desktop layout (`lg:` and above) keeps the current generous spacing and the explainer card.

Result: on a 647×1819 viewport (and smaller real phones) the page renders as one self-contained card; no vertical scrolling needed.

---

## 2. Desktop: keep the Rounds Tracker on the same row as the other small tools

In `src/pages/Tools.tsx`, the desktop layout is:
- Big Workout Timer card on top.
- Below it, `grid grid-cols-4 gap-4` rendering every tool except the timer.

After adding Rounds Tracker there are 5 small cards going into a 4-column grid, so the 5th wraps to a second row and breaks alignment.

Fix: change that grid to `grid-cols-5` so all five small tools (1RM, BMR, Macro, Calorie Counter, Rounds Tracker) sit in a single row under the big timer card. Card height stays `h-64`; no other styling changes.

Mobile carousel already includes Rounds Tracker and is unaffected.

---

## Files touched

- `src/pages/RoundsTracker.tsx` — mobile-only layout compaction inside one card; desktop unchanged.
- `src/pages/Tools.tsx` — single class change: `grid-cols-4` → `grid-cols-5` in the desktop small-tools grid.

No functional/behavior changes, no new dependencies, no backend changes.
