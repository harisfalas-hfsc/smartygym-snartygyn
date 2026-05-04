
# Post-Rescue Cleanup Plan

The morning generation + archival schedule are working correctly. Three small follow-ups remain — none are urgent, but they polish the system after the rescue.

## Issue 1 — Auto-trigger dashboard notification when cron generates a WOD ⚠️ **Important**

**Today**: `wod-generation-orchestrator` finishes building tomorrow's WODs but never calls `send-wod-notifications`. Users only get the 07:00 Cyprus email from `send-morning-notifications-job`. The dashboard "new content" bell does **not** light up when the cron publishes a new WOD.

**Fix**: After successful generation **and** all-or-none publishing passes, the orchestrator schedules a notification for the WOD's `generated_for_date` morning (07:00 Cyprus on the day it becomes active). Two clean options:

- **Option A (recommended, no extra cron)**: Insert a row into `pending_content_notifications` with `content_type='wod'` and `scheduled_for = generated_for_date 05:00 UTC`. The existing `send-new-content-notifications-job` (every 10 min) already drains that table → users see the dashboard bell exactly when the WOD becomes active at midnight Cyprus, without duplicating the 07:00 email.
- **Option B**: Same idea but call `send-wod-notifications` directly with a `targetDate` parameter at orchestrator success. Requires `send-wod-notifications` to accept `targetDate` (currently always uses today).

I'll go with Option A — no new edge function calls between functions, fully aligned with existing notification queue architecture.

**Files touched**:
- `supabase/functions/wod-generation-orchestrator/index.ts` — on success path, INSERT into `pending_content_notifications`.
- `supabase/functions/send-new-content-notifications/index.ts` — verify it handles `content_type='wod'` (likely already does for manual publishes; if not, add a small WOD branch).

## Issue 2 — Daily ritual cron label is summer-only

`generate-daily-ritual-midnight` runs at `5 22 * * *` UTC. The metadata label says "01:05 Cyprus (22:05 UTC)" which is **only correct in summer**; in winter it's 00:05 Cyprus.

**Fix**: Update `cron_job_metadata` description to "Daily at 22:05 UTC (≈ 00:05 Cyprus winter / 01:05 summer)" — same pattern as the WOD jobs.

## Issue 3 — Watchdog mis-categorized

`watchdog-wod-check` is in category `'WOD Generation'` while its sibling `backup-wod-generation` is in `'maintenance'`. They serve the same purpose (safety nets that verify today's WOD).

**Fix**: Single UPDATE setting `category = 'maintenance'` for `watchdog-wod-check`.

## Execution order

1. SQL update for issues 2 + 3 (single migration / data update — `cron_job_metadata` only, no schema change).
2. Edge function edit for issue 1 (`wod-generation-orchestrator` insert into `pending_content_notifications`), then deploy.
3. Verify in Admin → Cron Jobs that labels look right and watchdog sits under Maintenance.
4. Verify in `pending_content_notifications` table that next cron run inserts a row.

## What's NOT needed
- ✅ System Health Audit already knows the new schedule (both hardcoded references and the new "Tomorrow's WODs Pre-Generated" check were updated).
- ✅ Archive runs exactly at 00:00 Cyprus with **zero gap** (next-day pre-built WODs become "today" at the same instant).
- ✅ All 28 cron jobs are synchronized between `cron.job` and `cron_job_metadata`.
- ✅ 07:00 Cyprus morning email keeps working with the new schedule.

Approve to execute the 3 fixes.
