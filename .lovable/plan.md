# WOD Generation — Chain Fix (No Library Fallback, Alert-Only)

## Your rules (locked in)
- **Library mode is admin-only.** Triggered manually by you from the admin panel. Never automatically. Never by cron, watchdog, or backup.
- **If fresh AI generation fails: do nothing + send you an alert.** No silent substitutions. No retries that mask failure.
- **Keep today's split** (Bodyweight + Equipment as separate calls). Each slot fits under the 150s edge limit. The split is correct.
- **No new workouts will be generated during this work.** This is a wiring fix only.

## Why this is fixable (and why previous attempts weren't)
Every previous attempt patched one symptom and broke another safety. Today's deploy is a perfect example: it solved the timeout (good) but made the call fire-and-forget (bad), so failures became invisible.

The actual problem is a **broken chain of accountability**, not a single broken function:

```text
cron → generator (background) → [silence] → ??? → no record → no alert
```

We will replace it with a chain where every link must prove the previous link succeeded:

```text
cron → orchestrator (sync per slot)
        ├─ INSERT run row FIRST (so failure is always visible)
        ├─ call generator synchronously for ONE slot (fits in 150s)
        ├─ VERIFY row exists in admin_workouts for today + slot
        ├─ if verified → mark run success
        └─ if not verified → mark run failed + send admin alert (email + dashboard)
```

No library fallback anywhere in the automated path. Period.

## The 4 links being rewired

### 1. Cron jobs (4 rows)
- Unschedule any cron that calls `generate-workout-of-day` directly.
- Schedule cron to call `wod-generation-orchestrator` instead, once per slot:
  - 21:05 UTC → orchestrator with `{slot: "BODYWEIGHT"}`
  - 21:25 UTC → orchestrator with `{slot: "EQUIPMENT"}`
  - (Recovery days handled by same orchestrator with `{slot: "VARIOUS"}`)
- Backup + watchdog crons keep their existing times but call the orchestrator's verify-only mode.

### 2. `wod-generation-orchestrator` (the new accountability layer)
- **First action, before anything else:** INSERT a row into `wod_generation_runs` with status `started`, slot, trigger source, timestamp. If this insert fails, abort and alert — we never want to be blind again.
- Call `generate-workout-of-day` **synchronously** (await the response, no background mode) for the single slot it was given.
- After the call returns, query `admin_workouts` to confirm a row exists for today + slot + `is_workout_of_day = true`.
- Update the run row to `success` or `failed` with the real outcome.
- On `failed`: send admin alert (email to you + dashboard notification). Do nothing else.

### 3. `generate-workout-of-day`
- Remove background-mode (`EdgeRuntime.waitUntil`) from the cron path. Run synchronously, return only when the workout is actually saved (or the error is captured).
- Keep the per-slot split — one slot per call fits in 150s comfortably.
- Return a clear success/failure payload the orchestrator can verify against.

### 4. `backup-wod-generation` + `watchdog-wod-check`
- Stop calling `generate-workout-of-day` directly.
- Call `wod-generation-orchestrator` in **verify-only mode**: it checks today's slots, and if any are missing it sends an alert. **It does NOT regenerate.** It does NOT pull from the library. You decide what to do from the admin panel.

## Admin-only library trigger (already exists, just confirming)
- Your admin panel keeps the manual "Publish from Library" action via `select-wod-from-library`.
- Nothing in the automated chain ever calls this. Only you, manually.

## Alert content (so you can act fast at 6am)
The failure alert tells you exactly:
- Which slot failed (Bodyweight / Equipment / Various)
- The cyprus date it was for
- The error message + the run ID in `wod_generation_runs`
- A direct link to the admin panel's library-publish action

## Files touched
- `supabase/functions/wod-generation-orchestrator/index.ts` — rewrite as the accountability layer (insert-first, sync call, verify, alert)
- `supabase/functions/generate-workout-of-day/index.ts` — remove background mode on cron path, return real result
- `supabase/functions/backup-wod-generation/index.ts` — switch to verify-only via orchestrator, no regeneration
- `supabase/functions/watchdog-wod-check/index.ts` — switch to verify-only via orchestrator, no regeneration
- One DB migration to unschedule old cron rows and schedule new ones pointing at the orchestrator

## What I am NOT doing
- Not generating any WODs
- Not adding any automatic library fallback
- Not changing the 150s split
- Not touching UI, design, or any unrelated function

## Why this won't fail again the same way
Today's failure was caused by **"accepted = done"**. After this fix, "done" means a verified database row exists, recorded by an insert that happened **before** the AI call. There is no path where a failure goes silent — either the orchestrator confirms success, or you get an alert. Those are the only two outcomes.

**Approve to execute.**
