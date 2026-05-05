## Direct answer
The 06:30 / 06:50 UTC pre-build crons **did not fire** today. The 07:30 UTC audit job (which sends the success/failure email) **did not fire** either. That's why your inbox is empty.

The 7 jobs are listed as `active: true` in `cron.job`, but they have **zero execution rows in `cron.job_run_details`** for the last 30+ hours. They are silently dead. Other crons on the same database (`archive-old-wods`, `backup-wod-generation`, `watchdog-wod-check`, `queue-wod-notifications-morning`) are firing normally, so pg_cron itself is fine — only these 7 are broken.

## What to do

### Step 1 — Drop and recreate the 7 dead cron jobs
Use `cron.unschedule` + `cron.schedule` (same SQL pattern that the existing `update_wod_cron_schedule()` function already uses successfully). Re-register:

```text
generate-wod-bodyweight-daily   30 6 * * *  → wod-generation-orchestrator (slot=BODYWEIGHT, targetDate=tomorrow)
generate-wod-equipment-daily    50 6 * * *  → wod-generation-orchestrator (slot=EQUIPMENT,  targetDate=tomorrow)
wod-retry-pass-1                20 7 * * *  → wod-generation-orchestrator (retryMissing=true)
wod-retry-pass-2                50 7 * * *  → wod-generation-orchestrator (retryMissing=true)
wod-retry-pass-3                20 8 * * *  → wod-generation-orchestrator (retryMissing=true)
wod-retry-pass-4                50 8 * * *  → wod-generation-orchestrator (retryMissing=true, finalAttempt=true)
wod-post-generation-audit       30 7 * * *  → run-system-health-audit (sendEmail=true)
```

After re-registering, query `cron.job_run_details` to confirm new rows appear at the next scheduled minute.

### Step 2 — Fire one test audit now to prove the email path works
Manually invoke `wod-post-generation-audit` (or `run-system-health-audit` with `sendEmail:true`) so you receive **one email immediately** confirming the audit + Resend pipeline works end-to-end against today's already-generated WODs.

### Step 3 — Patch the watchdog so this can't happen silently again
Edit `watchdog-wod-check` (already runs 02:15 UTC daily) so that, in addition to checking that tomorrow's WODs exist, it also checks `cron.job_run_details` and confirms each of the 7 critical jobs ran in the previous 24h. If any didn't, it auto-re-registers the missing ones and emails admin a "cron self-heal" alert. This closes the silent-failure window that just bit us.

### Step 4 — Verification tomorrow morning
Tomorrow's chain (06:30 → 08:50 UTC May 6) will:
1. Build May 7's two WODs
2. Run audit at 07:30 UTC
3. Email you success or failure verdict at ~09:30 Cyprus

If the email lands tomorrow, the fix is confirmed and we move on.

## Out of scope
- No DB schema changes
- No edits to the orchestrator (it already works — yesterday's manual run proved it)
- Today's two manually-generated WODs stay exactly as they are
