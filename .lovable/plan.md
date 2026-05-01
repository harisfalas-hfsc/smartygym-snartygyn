# WOD Generation Pipeline — Consolidation Plan

Honest answer first: the **logic** is now correct (today's two WODs were repaired and the integrity contract blocks bad publishes), but the **code** is still a mess. The generator alone is **3,351 lines in a single file**, and there are **5 overlapping recovery paths** (orchestrator → generator → backup → watchdog → library fallback). Every fix added new lines instead of replacing old ones. That is exactly what you described.

This plan does **no rewrites of behavior**. It splits the existing logic into small, named modules and deletes only true duplicates. Prices stay 3.99 EUR. Periodization stays the 84‑day cycle. Stripe + image flow stays identical. Format rules (Strength = REPS & SETS, etc.) stay identical.

## What's wrong today (audit findings)

```text
generate-workout-of-day/index.ts        3,351 lines  ← single god-file
wod-generation-orchestrator/index.ts      646 lines  ← also calls library + backup
backup-wod-generation/index.ts            338 lines  ← duplicates generator setup
watchdog-wod-check/index.ts               248 lines  ← third recovery path
select-wod-from-library/index.ts          580 lines  ← fourth recovery path
_shared/wod-integrity.ts                  214 lines  ← the ONE good seam (keep)
```

Inside `generate-workout-of-day/index.ts` there are 12 top-level helpers mixed with one giant `serve()` handler that does: timezone math, periodization lookup, completeness check, parameter forcing, AI prompting, Stripe product creation, image generation, validation, retry, rollback, and notifications. That's why every change risks breaking something else.

## Goal

One simple mental model:

```text
EVERY DAY at 00:30 Cyprus time:
  1. Look up the 84-day periodization → category + difficulty
  2. For each required slot (BODYWEIGHT + EQUIPMENT, or VARIOUS on recovery day):
       a. Build prompt (category, difficulty, format rules, exercise library)
       b. Generate workout content via AI
       c. Validate against the integrity contract (already exists)
       d. Create Stripe product + price (3.99 EUR, SMARTYGYM metadata)
       e. Generate unique image, attach to Stripe product
       f. Publish (is_workout_of_day=true, is_visible=true)
  3. If any slot fails → rollback the day, raise alert, retry once
```

That's the whole thing. The code should read like that.

## The plan — 6 focused steps, no behavior change

### Step 1 — Split `generate-workout-of-day/index.ts` into named modules

Move existing helpers out of `index.ts` into `_shared/wod/` so the entry file becomes ~200 lines that read top-to-bottom like the mental model above.

```text
supabase/functions/_shared/wod/
  schedule.ts        cyprus-date math + periodization lookup (existing logic)
  parameters.ts      difficulty + format selection per category (existing logic)
  prompt.ts          prompt builder (existing prompt strings, untouched)
  stripe.ts          create product + price + image attach (existing logic)
  publish.ts         atomic insert/rollback + visibility flags (existing logic)
  naming.ts          public-name cleaner (already exists inline, just extract)
```

`generate-workout-of-day/index.ts` becomes a short orchestration of these modules. **No prompt text changes, no validation rule changes, no Stripe metadata changes.**

### Step 2 — Collapse the 4 recovery paths into 1

Today, `orchestrator`, `backup-wod-generation`, `watchdog-wod-check`, and `select-wod-from-library` all duplicate "is the day complete? if not, try to fix it." Replace with one function:

- **Keep**: `wod-generation-orchestrator` — the single entry point. It runs verification + retry + library fallback in one place.
- **Keep**: `select-wod-from-library` — but only as a function called BY the orchestrator, not as a standalone recovery cron.
- **Merge into orchestrator and delete**:
  - `backup-wod-generation` (its retry-with-delay logic moves into the orchestrator's existing retry loop)
  - `watchdog-wod-check` (its "is it healthy?" check is already `validateDayPublishContract`)

The cron jobs change from 4 schedules to 2:
```text
00:30 Cyprus  →  wod-generation-orchestrator   (primary)
03:00 Cyprus  →  wod-generation-orchestrator   (safety net, same function)
```

### Step 3 — One validation gate, called everywhere

`_shared/wod-integrity.ts` already exists and is correct. Audit every WOD code path and ensure they all go through `validateWodPublishContract` / `validateDayPublishContract` — no exceptions, no inline ad-hoc checks. Remove any leftover inline duplicates.

### Step 4 — Format & category rules in one table

Today the rules ("Strength = REPS & SETS", "Pilates = REPS & SETS", "Recovery = MIX", strength focuses, equipment vs bodyweight, micro-workouts excluded from WOD cycle) are scattered across `parameters.ts`-equivalent code, the DB trigger `enforce_workout_format_rules`, and the prompt. Move the source of truth to one constant in `_shared/wod/rules.ts`:

```ts
export const CATEGORY_RULES = {
  STRENGTH:              { format: "REPS & SETS", focuses: [...6 strength focuses] },
  "MOBILITY & STABILITY":{ format: "REPS & SETS" },
  PILATES:               { format: "REPS & SETS" },
  RECOVERY:              { format: "MIX" },
  "CALORIE BURNING":     { format: null /* flexible */ },
  METABOLIC:             { format: null },
  CARDIO:                { format: null },
  CHALLENGE:             { format: null },
  // MICRO-WORKOUTS excluded from WOD periodization
};
```

Both the prompt builder and the validator import from this file. The DB trigger stays as a last-line defense but reads the same rules.

### Step 5 — Visual format guarantee (already partially done)

The previous round wired `WorkoutDisplay.tsx` to render Instructions and Tips through `ExerciseHTMLContent` inside `workout-content`. Add one verification: every newly generated WOD's `main_workout`, `instructions`, and `tips` are passed through `htmlNormalizer` server-side before publish, so the bullet+exercise-icon format is guaranteed at the source, not just the renderer.

### Step 6 — One health report

Replace the multiple audit functions (`audit-stripe-images`, `audit-content-formatting`, `wod-payment-health-report`, `run-quick-health-audit`) with a single daily call to `wod-payment-health-report` that uses `validateDayPublishContract` for the last 7 days and emails a one-line summary: `"2026-05-01: BODYWEIGHT ✓  EQUIPMENT ✓"` or the specific failure.

The other audit functions stay (they cover non-WOD content) but stop being called by WOD crons.

## Technical details

**Files created**
- `supabase/functions/_shared/wod/schedule.ts`
- `supabase/functions/_shared/wod/parameters.ts`
- `supabase/functions/_shared/wod/prompt.ts`
- `supabase/functions/_shared/wod/stripe.ts`
- `supabase/functions/_shared/wod/publish.ts`
- `supabase/functions/_shared/wod/naming.ts`
- `supabase/functions/_shared/wod/rules.ts`

**Files shrunk (logic moved, not changed)**
- `generate-workout-of-day/index.ts`: 3,351 → ~250 lines
- `wod-generation-orchestrator/index.ts`: 646 → ~300 lines (absorbs backup + watchdog)
- `select-wod-from-library/index.ts`: 580 → ~350 lines (only the library-pick logic)

**Files deleted**
- `supabase/functions/backup-wod-generation/`
- `supabase/functions/watchdog-wod-check/`

**Cron jobs updated**
- Remove: `backup-wod-generation` cron, `watchdog-wod-check` cron
- Keep: `generate-workout-of-day` 00:30 Cyprus, plus a 03:00 Cyprus safety re-run of the orchestrator

**No changes to**
- Prices (3.99 EUR), Stripe metadata (`project: SMARTYGYM`, `content_type: Workout`)
- Periodization 84-day cycle
- Exercise library + `{{exercise:ID:Name}}` markup
- Format rules per category
- Difficulty rules
- Image generation pipeline
- Frontend rendering (already fixed last round)
- Database schema or RLS

## What you get

- **One file to read** to understand WOD generation: `generate-workout-of-day/index.ts` (~250 lines, top-to-bottom).
- **One recovery path** instead of four.
- **One rules table** instead of rules scattered across prompt, code, and DB.
- **Same prices, same look, same content quality**, just code that you and I can both follow without breaking it next time.

## Risk & rollout

Behavior-preserving refactor, but it touches the WOD pipeline. Rollout:

1. Build the `_shared/wod/` modules and the new slim `index.ts` in parallel.
2. Deploy the slim generator and orchestrator.
3. Trigger a manual re-run for today's date (already complete — should be a no-op).
4. Trigger a dry-run for tomorrow's date (skip publish, just validate).
5. Once tomorrow's 00:30 cron runs cleanly, delete `backup-wod-generation` and `watchdog-wod-check` and remove their crons.

If anything fails, the integrity contract refuses to publish and the safety re-run at 03:00 retries — same protection you have today.

**Approve and I'll execute steps 1–6 in order, in one pass, and report back with the new file sizes and a verification of tomorrow's WOD.**
