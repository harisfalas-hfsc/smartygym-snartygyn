

## Full Automated Messages & Notifications Audit

### ROOT CAUSE: Why Blog Articles Were Not Published

The `generate-weekly-blog-articles` edge function **always inserts articles as drafts** (`is_published: false`, line 318). This is by design — but there is **no automated step to publish them**. The weekly cron job generates content every Monday at 04:00 UTC, inserts drafts, and stops there. Someone must manually publish them (or a follow-up process should do it).

**This is the same issue with the three custom articles** — they were inserted as drafts and required a manual `UPDATE` to publish.

### ROOT CAUSE: Why No Notification Was Sent for New Articles

Two separate gaps in the pipeline:

1. **The `generate-weekly-blog-articles` function does NOT insert into `pending_content_notifications`** — it ends at line 329 with "Created as draft" and never queues a notification. The notification pipeline only works when content is added through the admin UI (`ArticleEditDialog.tsx`, line 370-380), which inserts into `pending_content_notifications`.

2. **The admin UI notification trigger only fires when `sendNotification` checkbox is enabled AND `is_published` is true** (line 370). So even if articles were added via admin UI, if they weren't published at creation time, no notification is queued.

3. **For the three custom articles** — they were inserted via a script directly into the database, completely bypassing both the admin UI and the edge function. No `pending_content_notifications` entry was ever created.

---

### COMPLETE INVENTORY OF ALL AUTOMATED MESSAGES

```text
CRON JOB                                    SCHEDULE              EDGE FUNCTION                         STATUS
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
send-morning-notifications-job              Daily 05:00 UTC       send-morning-notifications            ✅ OK
send-checkin-reminders-morning              Daily 06:00 UTC       send-checkin-reminders                ✅ OK
send-checkin-reminders-night                Daily 18:00 UTC       send-checkin-reminders                ✅ OK
send-weekly-motivation-job                  Mon 08:00 UTC         send-weekly-motivation                ✅ OK
send-weekly-activity-report                 Mon 07:00 UTC         send-weekly-activity-report           ✅ OK
send-renewal-reminders-daily                Daily 09:00 UTC       send-renewal-reminders                ✅ OK
send-subscription-expired-notifications-job Daily 08:00 UTC       send-subscription-expired-notif...    ✅ OK
send-welcome-onboarding-daily              Daily 10:00 UTC       send-welcome-onboarding               ✅ OK
generate-weekly-blog-articles               Mon 04:00 UTC         generate-weekly-blog-articles         ⚠️ BUG
process-pending-notifications-job           Every 5 min           process-pending-notifications         ✅ OK (pipeline works)
send-new-content-notifications-job          Every 10 min          send-new-content-notifications        ✅ OK (pipeline works)
send-scheduled-notifications-job            Every 10 min          send-scheduled-notifications          ✅ OK
send-scheduled-emails-job                   Every 5 min           send-scheduled-emails                 ✅ OK
daily-system-health-audit                   Daily 14:00 UTC       run-system-health-audit               ✅ OK
generate-workout-of-day                     Daily 22:30 UTC       wod-generation-orchestrator           ✅ OK
generate-daily-ritual-midnight              Daily 22:05 UTC       generate-daily-ritual                 ✅ OK
archive-old-wods                            Daily 22:00 UTC       archive-old-wods                      ✅ OK
backup-wod-generation                       Daily 01:00 UTC       backup-wod-generation                 ✅ OK
watchdog-wod-check                          Daily 01:05 UTC       watchdog-wod-check                    ✅ OK
expire-admin-subscriptions                  Daily 01:00 UTC       expire-subscriptions                  ✅ OK
send-christmas-notification                 Dec 25 12:00 UTC      send-holiday-notifications            ✅ OK
send-new-year-notification                  Jan 1 12:00 UTC       send-holiday-notifications            ✅ OK
refresh-seo-weekly                          Sun 02:00 UTC         refresh-seo-metadata                  ✅ OK
sync-stripe-images-weekly                   Sun 03:00 UTC         sync-stripe-images                    ✅ OK
cleanup-old-rate-limits                     Daily 02:00 UTC       cleanup-rate-limits                   ✅ OK
```

### EVENT-DRIVEN MESSAGES (triggered by user actions, not cron)

```text
TRIGGER                    FUNCTION                              STATUS
──────────────────────────────────────────────────────────────────────────
User signup                send-welcome-email                    ✅ OK
Stripe payment             stripe-webhook → send-system-message  ✅ OK
Contact form response      send-contact-response-notification    ✅ OK
Program delivery           send-program-notification             ✅ OK
Goal achievement           send-system-message                   ✅ OK
Admin bulk email           send-bulk-email                       ✅ OK
New workout (admin UI)     → pending_content_notifications       ✅ OK
New program (admin UI)     → pending_content_notifications       ✅ OK
New article (admin UI)     → pending_content_notifications       ✅ OK (only if published)
```

---

### BUGS FOUND

**BUG 1 — Blog articles generated as drafts, never auto-published, no notifications sent**
- `generate-weekly-blog-articles` inserts with `is_published: false` and does NOT insert into `pending_content_notifications`
- Every Monday, 3 articles are generated but sit invisible until manually published
- No user ever receives a "new article" notification for auto-generated blogs
- **Fix:** After inserting each article, the function should set `is_published: true`, set `published_at`, AND insert into `pending_content_notifications` so the existing pipeline picks them up

**BUG 2 — Template mismatch in `automated_message_templates`**
- The templates table has `morning_wod`, `morning_wod_recovery`, `morning_ritual`, `morning_daily_digest` — but the actual edge function uses `morning_notification` as the message type
- The templates table has `announcement_update` but is missing templates for `announcement_new_article`, `announcement_new_workout`, `announcement_new_program`
- This means the `send-new-content-notifications` function sends hardcoded HTML instead of using configurable templates — but this is working as designed (the function builds its own HTML). Not a critical bug, just a design inconsistency.

**No other critical bugs found.** All other cron jobs and event-driven notifications are wired correctly with proper cron schedules, edge functions, and audit logging.

---

### PLAN — Fixes Required

**1. Fix `generate-weekly-blog-articles` to auto-publish and notify** (edge function change)
- After successful article insert, update the article to `is_published: true, published_at: now()`
- Insert a row into `pending_content_notifications` with `content_type: 'article'`
- The existing `process-pending-notifications` → `send-new-content-notifications` pipeline will handle the rest (dashboard messages + emails to all users)

**2. Future-proof: Add the same pattern for any script-based content insertion**
- Document that any script inserting content must also insert into `pending_content_notifications` if notifications are desired

No database migrations needed. One edge function file to modify (`generate-weekly-blog-articles/index.ts`). Deploy after changes.

