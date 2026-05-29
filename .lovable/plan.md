## Rounds Tracker — new Smarty Tool

A big-button counter so you can tap your phone (lying on the floor) to count rounds during a workout, with an optional reps-per-round mode.

### What it does

- **Giant tap area** fills most of the screen. Each tap counts one.
- **Two modes (user choice):**
  - **Rounds only** — simplest. Each tap = one round. Pick count direction: count down (10 → 0) or count up (0 → 10).
  - **Rounds + reps** — each tap = one rep; when reps reach the per-round target, it auto-advances to the next round and resets the rep counter.
- **Big readout** shows the number huge in the middle, with sub-text like "of 10 left" or "Round 3 / 10".
- **Feedback on every tap:** short audio beep, phone vibration, and a quick screen flash (green when finished). Both sound and vibration have on/off toggles.
- **Undo, Reset, +Round** controls under the big button for quick corrections.
- **Screen wake-lock** so the screen doesn't sleep mid-workout.

### Where it lives

- New page at `/tools/rounds-tracker`.
- Added to the Smarty Tools list on `/tools` (mobile carousel + desktop grid) like the other tools.
- Route preloader updated.
- New background image generated for the tool card.

### Files

- New: `src/pages/RoundsTracker.tsx`
- New: `src/assets/tools/rounds-tracker-bg.jpg` (already generated)
- Edit: `src/App.tsx` — lazy import + route `/tools/rounds-tracker` + add to `secondaryRoutePreloaders`
- Edit: `src/pages/Tools.tsx` — add tool entry, image import, and SEO schema block

### Out of scope (not added now)

- Workout assistant toolbar entry on workout pages (current toolbar = Timer / 1RM / Exercise Library). Easy to add later if you want it next to the timer there too — just say the word.
