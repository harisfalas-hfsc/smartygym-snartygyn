## Findings (the honest report you asked for)

### 1. How long without a system-health email
- Last system-health audit recorded in the database: **May 24, 2026 at 07:12 UTC** (5 days ago).
- Last cron-driven audit (the one that auto-emails): **May 22, 2026 at 07:31 UTC** (7 days ago).
- Everything after May 22 was a manual click from the admin UI, not a scheduled run.

### 2. Why it stopped
The intended scheduled job is `wod-post-generation-audit` (07:30 UTC daily, posts to `run-system-health-audit` with `sendEmail: true`). It was created on May 4 (migration `20260504132209`) and worked daily until May 22.

Two problems together killed it:
- The row for `wod-post-generation-audit` is **missing from `cron_job_metadata`**. It existed; it's gone now. Most likely cause: the admin "Sync" action in `manage-cron-jobs` unscheduled jobs whose metadata had been edited/removed, and the cron-management UI removed it.
- The pg_cron entry was either unscheduled together with it or is stale (we don't have direct read access to `cron.job` to confirm — Postgres role lacks the grant), but the absence of any run after May 22 strongly indicates the schedule itself is dead.
- A secondary issue: the audit takes **~107 seconds**, dangerously close to the 150 s Edge timeout. This is fragile and violates the project memory rule "Health audit 60 s limit protections."

### 3. Are other automated emails broken?
Checked `notification_audit_log` for the last 30 days — **everything else is firing correctly**:
- Morning WOD push notifications: last sent today 05:01 UTC ✅
- Daily ritual push: today 05:01 UTC ✅
- New-content announcements: today 13:15 UTC ✅
- Monday motivation: May 25 ✅
- Renewal reminders, holiday notifications: on schedule ✅

So this is **one broken cron job**, not a systemic email failure. But the way it broke (silent metadata drift) is systemic — that's what we have to fix permanently.

### 4. Other cron jobs at risk
Cross-checking `cron_job_metadata` (32 jobs) against jobs referenced in migrations and code, these are **defined in code/migrations but missing from metadata** (same failure mode as the health audit):
- `wod-post-generation-audit` (the health-email cron) — confirmed dead
- `wod-retry-pass-1`, `wod-retry-pass-2`, `wod-retry-pass-3`, `wod-retry-pass-4` — WOD safety-net retries; likely dead too
- `refresh-sitemap-ping-daily`, `daily-sitemap-ping` — SEO pings (we tested these run manually, but are they actually scheduled?)
- `send-automated-messages-job` — referenced in `ensure_cron_jobs()` but not in metadata

These need a verification sweep before we trust them.

### 5. Will this stop happening?
Yes — but only if we fix it at the **system level**, not by re-creating one job. The root cause is that the project has **two independent sources of truth** for cron jobs:
- `cron_job_metadata` (what the admin UI shows and syncs)
- The real `cron.job` table (what actually runs)
- Plus migrations that schedule jobs directly via `cron.schedule(...)`

When any of those three drift, jobs silently disappear and there is **no alerting** because the very system that would notice (the health audit) is the one that died.

---

## Permanent solution — the plan

### Step A — Stop the bleeding (immediate fix)
1. **Recreate the missing scheduled jobs** via a single new migration that:
   - Inserts `wod-post-generation-audit` (08:00 UTC, not 07:30 — let the WOD retry passes finish first), `wod-retry-pass-1..4`, `refresh-sitemap-ping-daily`, `daily-sitemap-ping`, `send-automated-messages-job` back into `cron_job_metadata`.
   - Calls `cron.schedule(...)` for each one so `cron.job` and metadata are aligned again.
   - Uses `ON CONFLICT (job_name) DO UPDATE` so it's idempotent.
2. **Manually trigger the health audit once** with `sendEmail: true` so you get the missing report in your inbox today.

### Step B — Make health audit safe to run (it's at the 150 s edge timeout)
3. Split `run-system-health-audit` into:
   - `run-system-health-audit` (orchestrator, < 10 s) — writes a `pending` row, kicks off N small worker functions, returns immediately.
   - 4–5 lightweight worker functions, one per check category (WOD, Stripe, Email, Notifications, Database). Each finishes well under 60 s.
   - A finalizer that aggregates results, writes the audit row, and sends the email.
4. Strip the inline `Resend` send from inside the 100-second function — emails should go through `send-system-message` (which already exists and is logged) so every audit email is captured in a delivery log.

### Step C — Self-healing cron (the real fix)
5. Add a `cron_job_runs` table (`job_name`, `started_at`, `finished_at`, `status`, `error`) and a `last_run_at` / `last_run_status` column on `cron_job_metadata`. Every cron-fired call updates it via a tiny edge wrapper `cron-dispatcher` that all jobs call through.
6. Add a new **critical cron heartbeat** job (`cron-heartbeat`, runs hourly):
   - Reads `cron_job_metadata` where `is_active = true`.
   - For each job, computes "expected to have run by now" from its schedule.
   - If `last_run_at` is older than `expected + 2× interval`, emails admin **"Cron job X has not run since Y"**.
   - This is the watchdog that would have caught the broken health audit on day 1.
7. Add a database constraint/trigger so removing a row from `cron_job_metadata` automatically calls `cron.unschedule(job_name)` — no more orphans, no more drift.

### Step D — Observability for you (the human)
8. Extend the existing Admin → Cron Jobs panel to show, for each job: last run, status, duration, next expected run, and a red badge if it missed its window. So you can glance at it and immediately see what's broken — instead of finding out by missing email reports.

### Step E — Verify and document
9. Run the heartbeat manually against today's state; confirm it correctly flags the 5–7 day gap.
10. Save a new memory **"Cron job lifecycle"** that codifies: never delete from `cron_job_metadata` without unscheduling; every new cron must go through the `cron-dispatcher`; heartbeat is critical and must never be disabled.

---

## What you'll get
- A health-audit email back in your inbox today, and automatically every morning from tomorrow on.
- A self-healing cron registry that can't silently lose jobs.
- An hourly heartbeat that emails you the moment any critical cron stops running — so you find out in 1 hour, not 7 days.
- All other automated emails confirmed working today and instrumented going forward.

## Scope
This is a multi-step backend project. I will do it in this exact order to avoid breaking what's currently working:
1. Step A (restore missing jobs, send today's audit) — small migration + manual invoke
2. Step C steps 5–7 (heartbeat + lifecycle trigger) — new table, new edge function, new cron
3. Step B (split audit into workers) — refactor of `run-system-health-audit`
4. Step D (admin panel surfacing) — UI change in `CronJobsManager.tsx`
5. Step E (verification + memory)

No payment, content, or visual surfaces are touched. Pure operations/reliability work.
