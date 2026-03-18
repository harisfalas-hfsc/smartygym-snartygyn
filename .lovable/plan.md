
# WOD Generation Reliability Fix - Implementation Status

## ✅ Phase A — Immediate Production Recovery (March 18, 2026)

### 1. Missing BODYWEIGHT WOD Restored
- Triggered `generate-workout-of-day` with `retryMissing: true`
- Confirmed 2/2 WODs now active for 2026-03-18: EQUIPMENT + BODYWEIGHT

### 2. Zombie Run Closed
- Run `77803639-94c6-4f72-867e-be4ffc59da37` marked as `failed` with explicit error message

### 3. Incident Logged
- notification_audit_log entry created for traceability

## ✅ Phase B — Stop Recurrence (Same-Day Hardening)

### 1. Cron Timeout Fixed
- `generate-workout-of-day` cron now uses `timeout_milliseconds:=900000` (15 min, was 300000/5 min)
- This allows the orchestrator's 2 retry attempts + 30s delays to complete within the timeout

### 2. Section Validator Fixed (`_shared/section-validator.ts`)
- `isComplete` now includes exercise density check: `missingIcons.length === 0 && exerciseContentIssues.length === 0`
- Orchestrator will now correctly retry when WODs have missing exercises

### 3. Orchestrator Hardened (`wod-generation-orchestrator/index.ts`)
- `try/finally` block ensures run log is NEVER left as "running"
- Reduced retry attempts from 3→2 and delay from 120s→30s to fit within execution limits
- Added **partial-failure** detection: distinguishes between "no WODs" and "1 of 2 WODs" failures
- Run log now always gets explicit `failed` status with detailed error on any failure path

### 4. Zombie Run Detection (`run-system-health-audit/index.ts`)
- Health audit checks for `wod_generation_runs` stuck in "running" for >30 minutes
- Auto-closes zombie runs and reports them as `fail` in the audit

### 5. Backup WOD Generation (`backup-wod-generation/index.ts`)
- Function runs at 01:00 UTC (03:00 Cyprus) daily via cron
- Checks if today's WODs exist and are complete
- If missing, triggers `generate-workout-of-day` with `retryMissing: true`
- Sends recovery ✅ or final failure 🚨 email to admin

## ✅ Phase C — Monitoring You Can Trust (March 18, 2026)

### 1. Watchdog Function (`watchdog-wod-check/index.ts`)
- Runs at 01:05 UTC (03:05 Cyprus) — 5 minutes after backup
- Counts active, validated WODs for today
- If count < expected → triggers recovery + sends critical 🐕 watchdog email
- If all good → silent exit, no noise
- Cron job scheduled: `5 1 * * *`

### 2. Scheduler Reconciliation (inside `run-system-health-audit`)
- Compares `cron.job` vs `cron_job_metadata` automatically in daily audit
- Flags orphaned metadata, schedule mismatches, and untracked cron jobs
- Cleaned 4 stale metadata entries: `verify-wod-generation`, `cleanup-expired-sessions`, `send-workout-reminders-job`, `sync-stripe-subscriptions-job`
- Fixed `archive-old-wods` metadata schedule: was `0 4 * * *`, corrected to actual `0 22 * * *`

### 3. WOD Status Widget (`WODStatusWidget.tsx`)
- Added to admin Content section (top of ContentManager)
- Shows: "Today's WODs: 2/2 ✅" or "1/2 ❌ BODYWEIGHT missing"
- Displays last run status, source (primary/backup), and time
- Green border when healthy, red border when missing
