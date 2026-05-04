
# WOD Generation: Retry Chain + Alerting + Watchdog UI

## Goal
Use the wide pre-build window (08:30 Cyprus generation → 00:00 Cyprus rollover) to retry up to 5 times with 30-min spacing if generation fails, and notify admin (you) on BOTH success and failure so you always know the state.

---

## 1. Retry chain — pre-build day (Cyprus times)

The bodyweight slot kicks at 08:30 and equipment at 08:50. If either fails, we add scheduled retry crons that re-fire ONLY for missing slots:

| Cron name | Cyprus time | UTC | Purpose |
|---|---|---|---|
| `generate-wod-bodyweight-daily` | 08:30 | 06:30 | Attempt 1 — bodyweight |
| `generate-wod-equipment-daily` | 08:50 | 06:50 | Attempt 1 — equipment |
| `wod-retry-pass-1` (NEW) | 09:20 | 07:20 | Retry any missing slot for tomorrow |
| `wod-retry-pass-2` (NEW) | 09:50 | 07:50 | Retry any missing slot for tomorrow |
| `wod-retry-pass-3` (NEW) | 10:20 | 08:20 | Retry any missing slot for tomorrow |
| `wod-retry-pass-4` (NEW) | 10:50 | 08:50 | Final retry pass |

Each retry pass calls `wod-generation-orchestrator` with `{ mode: "generate", retryMissing: true, targetDate: "<tomorrow Cyprus>" }`. The orchestrator already short-circuits if the target date is fully populated, so once tomorrow's WODs are complete the rest of the passes become silent no-ops.

Internal orchestrator retries stay at the existing 3 attempts × 45 s for transient AI hiccups within a single run.

---

## 2. Success + Failure admin notifications

Currently the orchestrator only emails on failure. We add a "post-run admin ping" path:

- On **successful build** of a slot, send a one-line admin email + dashboard message: "WOD generated for <date> — slot <BW/EQ>".
- On **failure after all retries**, send the existing failure email plus an explicit "Action required" badge.
- Use `getAdminNotificationEmail()` (already present) and the existing `MESSAGE_TYPES.SYSTEM_NOTIFICATION` channel for the dashboard ping.
- Dedupe: store a `wod_generation_run_log` row keyed by `(target_date, slot, status)` so the same outcome is not announced twice across the 4 retry passes.

New tiny table:
```
wod_generation_run_log (
  id uuid pk,
  target_date date,
  slot text,            -- BODYWEIGHT | EQUIPMENT
  status text,          -- success | failure
  attempt_source text,  -- cron-bodyweight | wod-retry-pass-1 | ...
  notified_at timestamptz,
  created_at timestamptz default now(),
  unique(target_date, slot, status)
)
```

---

## 3. 09:30 Cyprus post-generation health alert

New cron: `wod-post-generation-audit`
- Schedule: `0 8 * * *` (08:00 UTC = 10:00 Cyprus summer / 09:00 Cyprus winter — consistent with how the other generation jobs are timed using fixed UTC anchors). Actually tied to **09:30 Cyprus** = `30 7 * * *` UTC.
- Calls `run-system-health-audit` with `{ sendEmail: true, focus: "tomorrow_wods" }`.
- Emails admin a clear status: ✅ both slots ready / ⚠️ partial / ❌ none.
- Runs AFTER the first generation pass (08:50) but BEFORE the first retry (09:20)? — placed at 09:30 so it sees one retry attempt already, then leaves room for 3 more retries before lunch.

Existing audit cron stays:
- `daily-system-health-audit-after-generation` at 17:00 Cyprus — keep as final long-window safety net.

---

## 4. Rename watchdog + admin UI button

- Rename `watchdog-wod-check` (the cron) → display label **"WOD Watchdog"** in `cron_job_metadata` (`display_name` column), schedule unchanged. The function name stays the same to avoid breaking the deployed edge function.
- In `src/components/admin/WODManager.tsx`, add a new button **"WOD Watchdog"** placed next to the existing **"Future Ready?"** button (around line 920).
- Button behavior: calls `watchdog-wod-check` edge function via `supabase.functions.invoke("watchdog-wod-check")`, shows a toast with the result (slots present / missing / asset re-kick triggered).

---

## 5. Cron metadata sync (admin panel Cron Jobs page)

Insert/update rows in `cron_job_metadata` for:
- `wod-retry-pass-1` … `wod-retry-pass-4` — category `content_generation`, human-readable labels showing both UTC and Cyprus times.
- `wod-post-generation-audit` — category `maintenance`, label "Daily 09:30 Cyprus — verifies tomorrow's WODs were built and emails admin".
- `watchdog-wod-check` — update `display_name` to **"WOD Watchdog"**.

After this the admin Cron Jobs page will show 33 jobs (was 29).

---

## 6. Files to change

### New
- `supabase/functions/wod-post-generation-audit/index.ts` — wraps `run-system-health-audit` with `sendEmail: true`.
- Migration: creates 4 retry crons + post-gen audit cron + `wod_generation_run_log` table + metadata rows + `display_name` rename.

### Edited
- `supabase/functions/wod-generation-orchestrator/index.ts` — after a successful publish, write a `success` row to `wod_generation_run_log` and send admin email/dashboard ping if no prior `success` row exists for `(target_date, slot)`. After final-attempt failure, write a `failure` row with the same dedupe.
- `src/components/admin/WODManager.tsx` — new "WOD Watchdog" button next to "Future Ready?".

### Untouched (verified safe)
- `archive-old-wods` (00:00 Cyprus silent rollover) — no change.
- `queue-wod-notifications-morning` (07:00 Cyprus) — no change.
- `backup-wod-generation` (02:00 UTC) — kept as final overnight verify-only safety net.
- All 28 existing crons — untouched.

---

## 7. Final daily timeline (Cyprus, winter — add +1h in summer)

| Cyprus time | What |
|---|---|
| 08:30 | Generate tomorrow's bodyweight WOD |
| 08:50 | Generate tomorrow's equipment WOD |
| 09:20 | Retry pass 1 (only if missing) |
| 09:30 | **Post-generation audit + admin email — success or failure** |
| 09:50 | Retry pass 2 |
| 10:20 | Retry pass 3 |
| 10:50 | Retry pass 4 (final) |
| 17:00 | Long-window safety audit + admin email |
| 23:00 | Today's WODs archived |
| 00:00 | Pre-built WODs become "today" — silent rollover |
| 07:00 | Users get dashboard ping + email about new WODs |

Result: if any generation fails, you receive notification within 1 hour and have ~14 hours and 4 retry passes to fix it before midnight rollover. On success, you get a single confirmation email per slot — no spam.

Approve to execute.
