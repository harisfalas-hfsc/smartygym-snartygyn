# Plan

## Part 1 — Soft Tissue Preparation must be foam-rolling only

**Rule (locked in):** The `🧽 Soft Tissue Preparation` section contains ONLY foam-rolling / lacrosse-ball / trigger-point release cues in plain text. It must NEVER contain library-exercise markup (`{{exercise:...}}`) or movement names like Hamstring Stretch, Cobra Pose, Cat-Cow, Dynamic Mobility, etc. Stretches/mobility belong in **Activation** or **Cool-down**, not here.

### 1a. Fix the two workouts shown in screenshots
- **Titan Strength** — current Soft Tissue lists "Assisted prone hamstring, Assisted prone leg raise". Replace with foam-rolling cues targeting the muscles the session trains (glutes, quads, hamstrings, lats, T-spine), e.g.:
  - Foam roll glutes & TFL (45 sec each side)
  - Foam roll quads (45 sec each leg)
  - Foam roll lats (30 sec each side)
  - Foam roll thoracic spine extensions × 8–10
  - Lacrosse ball under foot arch (30 sec each)
- **Bodyweight Strength Session** — current Soft Tissue lists "hamstring circles, standing calves, runners stretch, sweet bend curls". Replace with bodyweight-appropriate foam/ball cues (or "self-massage with hands/tennis ball" if no foam roller assumed):
  - Foam roll (or tennis-ball) glutes 45 sec/side
  - Foam roll quads 45 sec/leg
  - Foam roll calves 30 sec/leg
  - Lacrosse-ball pec release 30 sec/side
  - Thoracic spine foam-roll extensions × 8

Both are updated via direct edit of `admin_workouts.warm_up` (the Soft Tissue block lives at the top of warm-up HTML), preserving the rest of the workout and re-running the normalizer.

### 1b. Audit & repair ALL published workouts
New one-off edge function `repair-soft-tissue-sections` that, for every visible `admin_workouts` row:
1. Locate the `🧽 Soft Tissue Preparation` block in `warm_up` (and program structures).
2. Strip any `{{exercise:...}}` markup inside that block.
3. Detect non-foam-rolling lines (heuristic: no `foam roll`, `lacrosse`, `trigger`, `release`, `tennis ball`, `self-massage`, `ball` keywords) and replace them with category-appropriate foam-rolling cues derived from the workout's `focus` / equipment (lower-body focus → glutes/quads/hams/calves; upper-body → lats/pecs/T-spine; full-body → mixed 4–5 lines).
4. Re-normalize HTML and save.
Returns a report (count fixed, list of workout names).

### 1c. Lock the rule for FUTURE generations
Update generator prompts so the model cannot put exercises in Soft Tissue:
- `generate-category-difficulty-batch`, `generate-strength-focus-batch`, `generate-free-category-workouts`, `generate-training-program`, `generate-wod-bodyweight-daily`, `generate-wod-equipment-daily` — strengthen the Soft Tissue instruction to:
  > Soft Tissue Preparation: PLAIN TEXT ONLY. Each line MUST start with `Foam roll`, `Lacrosse ball`, `Tennis ball`, `Trigger point`, or `Self-massage`. NEVER use `{{exercise:` markup here. NEVER list stretches, mobility drills, or library exercises. Stretches go in Activation; static stretches go in Cool-down.
- Update `_shared/section-validator.ts` to add a `validateSoftTissueBlock()` check: reject any save where the Soft Tissue section contains `{{exercise:` or lacks at least one foam-roll/ball/trigger keyword. Wire it into the same save path used by generators + manual editor (`fix-workout-formatting`, `repair-content-formatting`).
- Update memory `mem://content-creation/workout-structure-exact-format` (and add a dedicated `mem://content-creation/soft-tissue-foam-rolling-only` rule) so all future prompts/edits remember.

## Part 2 — Login dropdown stays clickable behind the announcement

**Cause:** The Radix `DropdownMenu` opened from the user-icon (Login / Sign Up) stays mounted with its own portal + high z-index. When `RitualAnnouncementModal` (or PAR-Q modal) opens shortly after, the modal's backdrop sits under the dropdown, so the user sees both and can't dismiss the dropdown.

**Fix:** In `AnnouncementManager.tsx`, the moment we set `showRitualModal` / `showParQModal` to `true`, programmatically close any open Radix overlays first by dispatching an Escape keydown on `document` (Radix listens for it):
```ts
const closeOpenOverlays = () => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
};
```
Call `closeOpenOverlays()` immediately before `setShowRitualModal(true)` and `setShowParQModal(true)`. As a belt-and-braces measure, ensure `RitualAnnouncementModal` / `ParQReminderModal` use `Dialog` with `modal={true}` (default) and a z-index ≥ the dropdown (already `z-50` on both — keep, no override needed once dropdown is closed).

## Technical notes
- Soft Tissue detection: parse `warm_up` HTML, find `<p>` containing `🧽`, take the following `<ul>`/`<ol>` until the next section icon (🔥, 💪, ❄️, 🧘, 🎯, etc.) — that's the Soft Tissue block.
- Repair function runs on demand from the admin WOD/Workout manager via existing audit button pattern; not a cron.
- No DB schema changes.
- All edits are server-side content + frontend overlay handling; no business-logic rewrites elsewhere.

## Deliverables
1. Edge function `repair-soft-tissue-sections` + admin button entry.
2. Direct content fix for the two named workouts.
3. Prompt + validator updates across all 6 generator functions.
4. New memory rule + updated structure memory.
5. `AnnouncementManager.tsx` dispatches Escape before opening modals.
