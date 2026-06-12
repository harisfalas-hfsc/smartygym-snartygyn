
# Tidy-Up Plan v2: Crons, Automations, Templates, User Preferences & Health (Aligned End-to-End)

Same goal as before: clean orphans, remove duplicates, fix mistyped rules, and make sure **everything visible to admin and to the end user matches what actually runs**. Non-destructive — nothing currently sending real mail is deleted.

New in this version: the user-facing **Settings → Notifications** page is brought into the same model, and a third channel (**mobile push**) is added to the parity matrix.

---

## 1. Three-channel parity (Email · Dashboard · Mobile Push)

Every user-controllable automation gets **three independent toggles** that all read from `profiles.notification_preferences`. The sender always tries all three channels; each channel is gated by its own toggle.

Single source of truth — flattened preference keys, one per automation:

```
preferences = {
  // user-controllable
  morning_daily_digest: { email: true, dashboard: true, push: true },   // ← was 2 keys, now 1
  monday_motivation:    { email: true, dashboard: true, push: true },
  new_workout:          { email: true, dashboard: true, push: true },
  new_program:          { email: true, dashboard: true, push: true },
  new_article:          { email: true, dashboard: true, push: true },
  weekly_activity_report:{ email: true, dashboard: true, push: true },
  checkin_reminder:     { email: true, dashboard: true, push: true },
  scheduled_workout_reminder: { email: true, dashboard: true, push: true },
  scheduled_program_reminder: { email: true, dashboard: true, push: true },
  goal_achievement:     { email: true, dashboard: true, push: true },
  welcome_onboarding:   { email: true, dashboard: true, push: true },

  // master kill-switch
  opt_out_all: false
}
```

Legacy keys (`email_wod` / `email_ritual` / `dashboard_wod` / `dashboard_ritual` etc.) are **migrated in place** to the new shape via a one-shot SQL update; the JSON default is rewritten. The old keys are no longer read anywhere.

**Always-on (NOT user-controllable, transactional/legal):**
- Welcome email (signup confirm)
- Any purchase confirmation — workout / program / lifetime plan / corporate
- Renewal & expiry notices
- Holiday greetings (Christmas, New Year)
- Direct coach replies / support responses
- Account/security mail (password reset etc.)

These are intentionally excluded from the preference UI.

---

## 2. WOD + Ritual = ONE digest (everywhere)

Today the system already sends **one** Morning Daily Digest (`send-morning-notifications-job` 05:00 UTC, template `morning_daily_digest`). The duplicate "WOD" and "Ritual" preference toggles and legacy templates remain only as leftovers.

Cleanup:
- **Cron:** keep only `send-morning-notifications-job`. Remove the now-inactive metadata rows for `morning_wod_notification` / `morning_wod_recovery_notification` / `morning_ritual_notification` / `workout_of_day` / `daily_ritual` automation rules (these are NOT crons, they're rule rows — confirmed in audit).
- **Templates:** delete inactive duplicates (5 rows total: 2× "Daily WOD & Ritual", 1× "Plan Change", 1× "Morning WOD", 1× "Recovery Day", 1× "Morning Ritual"). Keep the single active "Morning Daily Digest Template".
- **User preferences:** collapse `email_wod` + `email_ritual` → `morning_daily_digest.email`; same for dashboard and push.

---

## 3. Database cleanup (one migration)

```text
A. Cron orphans
   DELETE FROM cron.job WHERE jobname IN (
     'process-strength-library-item-every-minute',
     'send-scheduled-notifications-job'
   )
   DELETE FROM cron_job_metadata WHERE job_name IN (same)
   UPDATE cron_job_metadata
     SET display_name='Daily System Health Audit',
         description='Runs run-system-health-audit at 09:00 UTC'
     WHERE job_name='wod-post-generation-audit'

B. Template duplicates (all inactive non-default rows)
   DELETE FROM automated_message_templates
   WHERE is_active=false AND is_default=false
     AND template_name IN (
       'Daily WOD & Ritual Notification',
       'Plan Change Notification',
       'Morning WOD Notification',
       'Recovery Day WOD Notification',
       'Morning Ritual Notification'
     )

C. Legacy automation rules (all inactive)
   DELETE FROM automation_rules
   WHERE is_active=false AND automation_key IN (
     'workout_of_day','daily_ritual',
     'morning_ritual_notification',
     'morning_wod_notification',
     'morning_wod_recovery_notification'
   )

D. Fix new_addition rule
   UPDATE automation_rules
     SET trigger_type='event', rule_type='event',
         description='Fires from pending_content_notifications when a new workout/program/article becomes visible'
   WHERE automation_key='new_addition'

E. Enforce parity on the only rule that violated it
   UPDATE automation_rules
     SET sends_dashboard_message=true
   WHERE automation_key='reengagement_email'

F. New editable templates for inline-only message types
   INSERT default templates for message_type 'reactivation' and 'support'
   (copy current inline subject/body from edge functions as starting content)

G. Notification preferences migration
   UPDATE profiles
   SET notification_preferences = jsonb_build_object(
     'opt_out_all', COALESCE(notification_preferences->>'opt_out_all','false')::bool,
     'morning_daily_digest', jsonb_build_object(
       'email',     COALESCE(notification_preferences->>'email_wod','true')::bool
                AND COALESCE(notification_preferences->>'email_ritual','true')::bool,
       'dashboard', COALESCE(notification_preferences->>'dashboard_wod','true')::bool
                AND COALESCE(notification_preferences->>'dashboard_ritual','true')::bool,
       'push',      COALESCE(notification_preferences->>'push','true')::bool
     ),
     'monday_motivation', jsonb_build_object('email', …, 'dashboard', …, 'push', …),
     'new_workout',        …,
     'new_program',        …,
     'new_article',        …,
     'weekly_activity_report', …,
     'checkin_reminder',   …,
     'scheduled_workout_reminder', jsonb_build_object('email',true,'dashboard',true,'push',true),
     'scheduled_program_reminder', jsonb_build_object('email',true,'dashboard',true,'push',true),
     'goal_achievement',   jsonb_build_object('email',true,'dashboard',true,'push',true),
     'welcome_onboarding', jsonb_build_object('email',true,'dashboard',true,'push',true)
   )

H. Rewrite the column default to the new shape
```

---

## 4. Edge function alignment

A tiny shared helper `_shared/notification-preferences.ts` exposes:

```ts
canSend(userPref, automationKey, channel)  // returns boolean
```

Every sender is patched to call it with `(automationKey, 'email' | 'dashboard' | 'push')` before each channel send. Concretely:

- `send-morning-notifications` → `morning_daily_digest`
- `send-weekly-motivation`      → `monday_motivation`
- `send-new-content-notifications` → `new_workout` / `new_program` / `new_article`
- `send-weekly-activity-report` → `weekly_activity_report`
- `send-checkin-reminders`      → `checkin_reminder`
- `send-welcome-onboarding`     → `welcome_onboarding`
- Scheduled workout/program reminders (already firing from `scheduled_workouts` flow) → `scheduled_workout_reminder` / `scheduled_program_reminder`
- Goal achievement → `goal_achievement`
- `send-reengagement-emails` → add the missing dashboard insert (per parity).
- `send-direct-coach-email`  → read subject/body from the new `support` template with inline fallback.

Push channel: every sender now also calls `send-notification` (the existing web-push function) when `push=true`. If no push subscription exists, it's a silent no-op — no error.

**Always-on senders** (welcome, purchase confirmations, renewal, expiry, holiday, support, security) skip the preference check entirely.

No edge function files are deleted.

---

## 5. Admin panel changes (so the UI mirrors reality)

- **`CronJobsDocumentation.tsx`** — rewritten to auto-render from `cron_job_metadata`, grouped: WOD · Daily Digest · Check-ins · Weekly · SEO · Stripe/Maintenance · Health · Holidays. Each row shows live schedule, cron-expression-in-plain-English, target edge function, last run, last status.
- **`AutomationRulesManager.tsx`** — add a 3-icon channel badge row (📧 · 🔔 · 📱) reading `sends_email` / `sends_dashboard_message` / `sends_push` (new column added in the migration, default true).
- **`AutomatedMessagesManager.tsx`** — duplicates disappear after migration, no code change.

---

## 6. User-facing Settings → Notifications

Existing `EmailSubscriptionManager.tsx` + `DashboardNotificationSubscriptionManager.tsx` are **merged** into one new component `NotificationPreferencesManager.tsx` with one row per automation and three toggles (📧 Email · 🔔 Dashboard · 📱 Push). Top of the page: "Receive nothing" master switch (`opt_out_all`).

Final list of rows (matches §1 exactly — eleven rows):

1. Morning Daily Digest (WOD + Smarty Ritual)
2. Monday Motivation
3. New Workouts
4. New Training Programs
5. New Blog Articles
6. Weekly Activity Report
7. Check-in Reminders (morning + evening)
8. Scheduled Workout Reminders
9. Scheduled Program Reminders
10. Goal Achievements
11. Welcome Onboarding Guide (5-day)

A small footnote: "Welcome, purchase confirmations, renewals, and holiday greetings are always delivered."

---

## 7. End-to-end matrix (post-cleanup, this is the contract)

| Automation | Cron | Rule | Template | User-controllable | E · D · P |
|---|---|---|---|---|---|
| Welcome (signup) | — | welcome_message | welcome | no | ✅✅✅ |
| 5-day onboarding | send-welcome-onboarding-daily 10:00 | welcome_onboarding_5day | welcome_onboarding | **yes** | ✅✅✅ |
| First purchase / any purchase | stripe webhook | first_purchase | purchase_subscription | no | ✅✅✅ |
| New workout/program/article | process-pending-notifications-job */5 | new_addition | announcement_update | **yes (3 toggles)** | ✅✅✅ |
| Morning Daily Digest (WOD+Ritual) | send-morning-notifications-job 05:00 | morning_daily_digest | morning_daily_digest | **yes** | ✅✅✅ |
| Morning check-in | send-checkin-reminders-morning 06:00 | checkin_reminder_morning | checkin_reminder_morning | **yes** | ✅✅✅ |
| Evening check-in | send-checkin-reminders-night 18:00 | checkin_reminder_evening | checkin_reminder_evening | **yes** | ✅✅✅ |
| Monday motivation | send-weekly-motivation-job Mon 08:00 | monday_motivation | motivational_weekly | **yes** | ✅✅✅ |
| Weekly activity report | send-weekly-activity-report Mon 07:00 | weekly_activity_report | announcement_update | **yes** | ✅✅✅ |
| Scheduled workout reminder | process-pending-notifications-job */5 | scheduled_workout_reminder *(new rule)* | announcement_update | **yes** | ✅✅✅ |
| Scheduled program reminder | process-pending-notifications-job */5 | scheduled_program_reminder *(new rule)* | announcement_update | **yes** | ✅✅✅ |
| Goal achievement | in-app | goal_achievement | goal_achievement | **yes** | ✅✅✅ |
| Reengagement | send-reengagement-emails-weekly Wed 08:00 | reengagement_email | reactivation (new) | no | ✅✅✅ |
| Christmas | send-christmas-notification Dec 25 12:00 | — | (inline) | no | ✅✅✅ |
| New Year | send-new-year-notification Jan 1 12:00 | — | (inline) | no | ✅✅✅ |
| Direct coach reply | — | direct_coach_email | support (new) | no | ✅✅✅ |
| Weekly blog generation | generate-weekly-blog-articles Mon 04:00 | — | — | system | — |
| Weekly SEO refresh | refresh-seo-weekly Sun 02:00 | — | — | system | — |
| Daily sitemap + IndexNow ping | refresh-sitemap-ping-daily 02:15, process-indexnow-queue-frequent */5 | — | — | system | — |
| Daily ritual assignment | assign-daily-ritual-midnight 22:05 | — | — | system | — |
| WOD pick + retries + archive + watchdog + audit | (existing schedule) | — | — | system | — |
| Stripe orphan cleanup / image sync | stripe-orphan-cleanup-daily, sync-stripe-images-weekly | — | — | system | — |
| Daily system health audit + hourly heartbeat | wod-post-generation-audit, cron-heartbeat-hourly | — | — | system | admin email |

---

## 8. Health system refresh

After migration:
1. Manually invoke `run-system-health-audit` once → fresh baseline.
2. Add an `IGNORED_LEGACY_JOBS = ['process-strength-library-item-every-minute','send-scheduled-notifications-job']` constant inside `run-system-health-audit` so a stale row never re-pages admin.
3. Extend the audit to also check **automation_rules ↔ template ↔ edge function ↔ user pref key** linkage so any future drift surfaces in the daily 09:00 UTC report rather than as a silent failure.
4. `cron-heartbeat-hourly` picks up the cleaned list automatically on its next run.

---

## 9. Files touched

- **New migration** — cron orphan removal + template dedupe + rule cleanup + `sends_push` column + `notification_preferences` reshape + new `reactivation`/`support` templates + new `scheduled_workout_reminder` / `scheduled_program_reminder` rules.
- **New** `supabase/functions/_shared/notification-preferences.ts` — `canSend(userPref, key, channel)`.
- **Patched senders** — every user-controllable sender listed in §4 (small one-line gates).
- `supabase/functions/send-reengagement-emails/index.ts` — also insert dashboard message.
- `supabase/functions/send-direct-coach-email/index.ts` — DB template with inline fallback.
- `supabase/functions/run-system-health-audit/index.ts` — `IGNORED_LEGACY_JOBS` + parity-drift check.
- `src/components/admin/CronJobsDocumentation.tsx` — auto from DB.
- `src/components/admin/AutomationRulesManager.tsx` — 3-channel badges.
- `src/components/NotificationPreferencesManager.tsx` — **new** unified user-settings UI (replaces `EmailSubscriptionManager.tsx` + `DashboardNotificationSubscriptionManager.tsx`; both old files kept for one release as thin re-exports to avoid breaking imports).
- `src/pages/UserDashboard.tsx` (or wherever the settings panel is mounted) — swap to the new component.

---

## 10. Out of scope (intentional)

- The Gold/Platinum → Lifetime plan migration (already done).
- Any final copywriting — admin can edit every template in the panel afterwards.
- Permanently deleting edge-function code files.
- Touching HFSC-related assets/data.
