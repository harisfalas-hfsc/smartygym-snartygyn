

# Phase C: WOD Monitoring & Diagnostics — Implementation Plan

## My honest assessment first

Your existing protection layers are **already strong**:
- Orchestrator has `try/finally` ensuring no zombie runs ✅
- Backup generation runs at 03:00 Cyprus ✅  
- Health audit detects and auto-closes zombie runs ✅
- Validator now includes exercise density check ✅
- Cron timeout increased to 15 min ✅

Phase C adds **3 targeted additions** that don't touch any existing generation code. They are purely monitoring/detection — read-only observers. Zero risk of breaking what works.

## What to build

### 1. Watchdog Function (03:05 Cyprus / 01:05 UTC)
A tiny edge function `watchdog-wod-check` that runs 5 minutes after the backup. All it does:
- Count today's active WODs
- If count < expected → trigger `generate-workout-of-day` with `retryMissing: true` + send critical email
- If count = expected → do nothing (silent success)

This is the **last safety net** before users wake up. It's a 50-line function, no complex logic.

### 2. Scheduler Reconciliation (inside health audit)
Add a check to the existing health audit that compares `cron.job` vs `cron_job_metadata`:

Current drift I already found:
- `cron_job_metadata` has `verify-wod-generation`, `cleanup-expired-sessions`, `send-workout-reminders-job`, `sync-stripe-subscriptions-job` — **none of these exist in `cron.job`**
- `archive-old-wods` metadata says schedule `0 4 * * *` but actual cron is `0 22 * * *`

This check flags orphaned metadata and schedule mismatches in the daily audit email. Read-only, no modifications.

### 3. WOD Status Widget in Admin
A small card added to the existing admin content section showing:
```
Today's WODs: 2/2 ✅  (or 1/2 ❌ BODYWEIGHT missing)
Last run: success at 00:35 UTC
Backup: not needed
```

Simple database read, no logic changes.

## Files to create/modify

1. **Create** `supabase/functions/watchdog-wod-check/index.ts` — ~60 lines, checks WOD count, triggers recovery if needed
2. **Add cron job** for `watchdog-wod-check` at `5 1 * * *` (01:05 UTC = 03:05 Cyprus)
3. **Modify** `supabase/functions/run-system-health-audit/index.ts` — add ~40 lines for scheduler reconciliation check (compares `cron.job` vs `cron_job_metadata`)
4. **Create** `src/components/admin/WODStatusWidget.tsx` — small status card component
5. **Modify** existing admin content area to show the widget
6. **Clean up** stale `cron_job_metadata` entries that reference non-existent jobs

## What I will NOT touch
- `wod-generation-orchestrator` — already hardened, no changes
- `generate-workout-of-day` — core generation logic, no changes
- `backup-wod-generation` — already deployed, no changes
- `section-validator.ts` — already fixed, no changes
- Any Stripe, pricing, or checkout code — completely separate

