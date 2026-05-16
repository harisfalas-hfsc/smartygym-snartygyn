## Confirmed from your screenshots

- Email #1 ("🏆 Today's Workouts (STRENGTH) are Live", arrives ~08:10 Cyprus) — the WOD-only one. Source: cron `queue-wod-notifications-morning` (05:00 UTC) → `send-new-content-notifications` drainer every 10 min. **Delete this.**
- Email #2 ("🌅 Good Morning, Smarty!" with both Workouts of the Day and Daily Smarty Ritual, arrives 08:00 Cyprus) — the combined one. Source: cron `send-morning-notifications-job` (05:00 UTC) → `send-morning-notifications`. **Keep this.**

The same applies to the dashboard notifications — the duplicate WOD-only dashboard message comes from the same WOD-only path.

## Permanent fix

### 1. Delete the WOD-only cron job

Remove `queue-wod-notifications-morning` from the live `cron.job` table. No more daily 08:00 Cyprus queueing of WOD-only items.

### 2. Delete the cron metadata row

Remove `queue-wod-notifications-morning` from `cron_job_metadata` so it disappears from the admin cron monitor and stops being treated as expected infrastructure.

### 3. Purge any pending WOD-only queue items

Delete all rows in `pending_content_notifications` where `content_type = 'wod'`. This ensures the every-10-min drainer cannot send any leftover queued WOD-only emails after the cron is removed.

### 4. Strip WOD handling from the content-notification drainer

Edit `send-new-content-notifications/index.ts` and remove the entire `content_type = 'wod'` branch (lines that build "🏆 Today's Workouts ... are Live" emails and dashboard messages). Even if a stale WOD row ever lands in the queue, no WOD-only message can be produced again.

### 5. Delete the legacy edge functions (code + deployment)

Delete from the codebase and from the deployed functions:

- `supabase/functions/queue-wod-notifications-morning`
- `supabase/functions/send-wod-notifications` (the older direct WOD-only sender, still callable today)

### 6. Remove the manual admin trigger

In `src/components/admin/WODManager.tsx`, remove the "Send WOD Notifications" button and its `supabase.functions.invoke("send-wod-notifications")` handler. The combined morning notification can still be re-sent if needed via the existing morning notification controls.

### 7. Stop `select-wod-from-library` from calling the old sender

In `supabase/functions/select-wod-from-library/index.ts`, remove the fallback `fetch(...send-wod-notifications)` block. WOD selection should never trigger WOD-only notifications — only the combined morning job sends user notifications.

### 8. Clean up notification-type registry

In `supabase/functions/_shared/notification-types.ts`, mark `WOD_NOTIFICATION` as historical-only (kept for old DB records and the existing combined-job audit log) and remove the legacy alias mappings that encourage future WOD-only use. The combined morning job continues to use it internally to log the WOD half of the combined message — that is fine and not user-facing as a separate message.

### 9. Verification after implementation

- `cron.job` no longer contains `queue-wod-notifications-morning`.
- `cron_job_metadata` no longer contains `queue-wod-notifications-morning`.
- `pending_content_notifications` has zero rows with `content_type = 'wod'`.
- Project source code has zero references to `send-wod-notifications` or `queue-wod-notifications-morning`.
- Only `send-morning-notifications-job` remains as the daily WOD/Ritual sender.

## Result

You will receive only one daily message — email and dashboard — at 08:00 Cyprus, containing both the Workout of the Day and the Daily Smarty Ritual. The 08:10 WOD-only email and its dashboard duplicate disappear permanently and cannot resurrect from any path.