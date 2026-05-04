
# WOD Notification Timing Fix — Full Synchronization Plan

## Problem
Currently no automatic notification fires when the WOD becomes "today's" at 00:00 Cyprus. Previous attempt queued at midnight while users were sleeping — unacceptable. Goal: users receive their dashboard ping + email at **07:00 Cyprus** (humane wake-up time), and every related admin panel surface reflects this.

## What changes (technical)

### 1. New edge function: `queue-wod-notifications-morning`
- Runs daily at **05:00 UTC (07:00 Cyprus)**.
- Reads today's active WODs (`is_workout_of_day=true`, `generated_for_date=today Cyprus`, `is_visible=true`).
- Inserts them into `pending_content_notifications` with `content_type='wod'`.
- Idempotent — checks for already-queued WODs, won't double-send if rerun manually.

### 2. New cron job entry
- Job name: `queue-wod-notifications-morning`
- Schedule: `0 5 * * *`
- Category: **notifications**
- Registered in both `cron.job` (live) and `cron_job_metadata` (admin panel).

### 3. `archive-old-wods` cleanup
- Removes the midnight notification-queueing block I added previously.
- Archive function reverts to its single job: rolling over WODs at 00:00 Cyprus, silently.

### 4. `send-new-content-notifications` already extended
- Already has the `wod` branch added (handles dashboard messages + emails using existing `dashboard_new_workout` and `email_new_workout` user preferences).
- No further changes needed.

## Synchronization across the admin panel

| Admin section | What gets updated | How |
|---|---|---|
| **Cron Jobs page** | New row "queue-wod-notifications-morning" appears under **Notifications** with schedule `0 5 * * *` and human-readable label "Daily at 05:00 UTC (07:00 Cyprus) — queues today's WODs so dashboard + email pings deliver at wake-up time, not midnight" | Migration inserts into `cron_job_metadata` |
| **System Health Audit** | Already aware. New cron joins the dashboard health checks automatically (it queries `cron_job_metadata` for active jobs). No code change needed; if the morning queue ever stops running, audit will flag it the same as any other notification job. | Existing `run-system-health-audit` reads cron metadata generically |
| **Auto Messages / Notifications Manager** | WOD notifications already use `MESSAGE_TYPES.WOD_NOTIFICATION` and respect existing user preferences `dashboard_new_workout` + `email_new_workout`. Users can already toggle them in their notification settings. | No change — preference plumbing already exists |
| **Email templates** | Uses inline template (matches the article/workout/program style already in `send-new-content-notifications`). No new template row required, no missing template warnings in admin. | Already wired |
| **Manual workout creation** | Unaffected. Admin-created standard workouts continue using the existing `queue_workout_notification` trigger (skips WODs). Manually published WODs via admin "Send WOD Notifications" button in WODManager continue to work via the existing `send-wod-notifications` function. | No change |
| **WODManager admin panel** | The manual "Send WOD Notifications" button still works for instant testing/resends. The new cron does not conflict (idempotency check prevents double-queueing). | No change |
| **Stripe / WOD purchase flow** | Unaffected. Notifications only ping users about content existence — purchase, pricing, and Stripe links untouched. | No change |
| **System Settings** | No new settings introduced. Schedule is editable later via a future `update_*` RPC if needed; for now, the standard cron management applies. | No change |
| **Health Audit "Tomorrow's WODs" check** | Continues to verify pre-built WODs at 12:00 UTC. Independent from this notification timing change. | No change |

## Risk audit — what does NOT break

- ✅ 07:00 Cyprus morning email (`send-morning-notifications-job`) keeps working — unrelated path.
- ✅ Archive at 00:00 Cyprus continues with **zero gap** to the new "today" WOD becoming live.
- ✅ Library-mode WOD selection (`select-wod-from-library` for today) still calls `send-wod-notifications` directly — instant notification when admin manually picks a today-WOD.
- ✅ Existing notification preferences honored (opt-out, dashboard toggle, email toggle).
- ✅ Idempotent: rerunning the new function won't duplicate notifications.
- ✅ All 28 existing cron jobs remain untouched.

## Execution order
1. Migration creates the cron schedule + `cron_job_metadata` row.
2. Deploy `queue-wod-notifications-morning` (already done in previous turn — code exists).
3. Confirm the cron is registered (`SELECT FROM cron.job WHERE jobname='queue-wod-notifications-morning'`).
4. Confirm admin panel Cron Jobs page now lists 29 jobs with the new one under **Notifications**.

## Memory update
Add a Core memory line: *"WOD notifications fire at 07:00 Cyprus (05:00 UTC) via `queue-wod-notifications-morning` cron — never at midnight."*

## Timeline
- After approval: migration runs, new cron is live.
- **Tomorrow at 07:00 Cyprus**: first automatic WOD notification batch (dashboard + email) reaches users.
- No notifications fire at midnight ever again.

Approve to execute.
