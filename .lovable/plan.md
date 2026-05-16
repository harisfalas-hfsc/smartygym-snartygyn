## Admin panel sync status — audit results

I checked every admin surface that could still expose the deleted WOD-only cron / function / notification. Here is the truth, panel by panel.

### 1. Cron Jobs Manager (`CronJobsManager.tsx`)
- Reads live data from `cron.job` and `cron_job_metadata`.
- `queue-wod-notifications-morning` is **gone from both tables**. It cannot be re-enabled with a click.
- No hardcoded reference to the old job in the component.
- **Result: already in sync. No action needed.**

### 2. Automated Messages Manager (`AutomatedMessagesManager.tsx`)
- Reads `automated_message_templates`.
- The templates `morning_wod`, `morning_wod_recovery`, `morning_ritual` are **still in the table on purpose** — the combined 08:00 Cyprus email (`send-morning-notifications`) reads them as the building blocks for the single combined message.
- No template named `wod_notification` / `send-wod-notifications` exists.
- **Result: already in sync. Leaving the morning_* templates as-is is correct.**

### 3. Automation Rules Manager (`AutomationRulesManager.tsx`)
- Reads `automation_rules`. Same story: morning_wod / morning_ritual / morning_wod_recovery rules still exist because the combined sender uses them. Standalone WOD-only rule does not exist.
- **Result: already in sync.**

### 4. Notification History Manager (`NotificationHistoryManager.tsx`)
- Shows past `user_system_messages` rows. There are 6,957 historical rows with `message_type = 'wod_notification'` — those are real history and must not be deleted.
- The combined morning sender continues to write the WOD dashboard card with `message_type = 'wod_notification'` (legitimate label for the WOD card on the user dashboard).
- **Result: in sync. The label is reused intentionally.**

### 5. Automation Rule Edit Dialog
- Has `wod_notification` / `morning_wod_notification` in its option lists. These map to message types that are still alive (the combined morning flow). Not stale.

### Orphan rows worth a separate cleanup (NOT WOD-related)
While auditing I found four rows in `cron_job_metadata` that no longer have a matching cron in `cron.job`:
- `send-automated-messages-job`
- `daily-system-health-audit-after-generation`
- `cleanup-old-rate-limits`
- `send-new-content-notifications-job`

None are related to WOD notifications, so they did not get cleaned up by yesterday's work. They will appear as "ghost" rows in CronJobsManager. I will flag these but **not delete them in this plan** — they predate today's request and may belong to other workflows you want kept.

### Optional cosmetic cleanup (safe, no behaviour change)
1. `supabase/functions/_shared/notification-types.ts`
   - Remove the legacy registry entry that still labels `WOD_NOTIFICATION` as `'send-wod-notifications (legacy)'` and the alias mapping `'wod' → WOD_NOTIFICATION` / `'workout_of_day' → WOD_NOTIFICATION`. Keep the `WOD_NOTIFICATION` constant itself (still used as a dashboard message_type).
2. `supabase/functions/select-wod-from-library/index.ts` and `supabase/functions/archive-old-wods/index.ts`
   - Remove stale comments that still reference `queue-wod-notifications-morning` / `send-wod-notifications`.
3. Redeploy the two edge functions after the comment edits.

These are pure documentation cleanups — they do not affect the admin panel or any user-facing behaviour.

### What the admin panel will show after this plan
- **Cron Jobs Manager:** no `queue-wod-notifications-morning` row, no way to re-enable it. ✓
- **Automated Messages / Automation Rules:** unchanged (combined morning flow keeps working). ✓
- **Notification History:** historical `wod_notification` rows preserved; new sends still write the dashboard WOD card under the same label as part of the combined 08:00 Cyprus message. ✓
- **No stale legacy strings** left in notification-types registry or function comments.

### Summary
The admin panel is already correctly synchronised with yesterday's deletion — the deleted cron job and function cannot be brought back from any admin click. The only remaining work is a small cosmetic pass on shared labels and comments, plus an optional follow-up on four unrelated orphan cron-metadata rows if you want them tidied separately.