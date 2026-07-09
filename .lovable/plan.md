# Plan: Test Messages + Full Communications Audit

## Part 1 — Trigger 3 test messages to hfsc.nicosia@gmail.com

Send one-time, real deliveries so you can verify content and layout in inbox + dashboard:

1. **Premium subscription welcome** — email + dashboard notification (template: `purchase_subscription` / welcome flow).
2. **Standalone workout purchase confirmation** — email + dashboard notification (template: `purchase_workout`).
3. **Standalone training program purchase confirmation** — email + dashboard notification (template: `purchase_program`).

For each: resolve the user's `user_id`, render the template with sample content values (e.g. sample workout/program name), insert a row into `user_system_messages` (dashboard), and invoke `send-automated-messages` / the direct email sender with the rendered template so a real email is delivered. Log each in `email_delivery_log` for traceability.

## Part 2 — Full Communications Center audit

Verify every tab in `CommunicationsManager` maps to a working backend and that every listed automation exists, is active, and is on cron.

### 2a. Registry audit (DB)
Query `automated_message_templates` and confirm each of these has an active row with `automation_key`, `dashboard_content`, `email_content`, and correct `target_audience`:
- first_purchase_welcome
- welcome_new_users
- welcome_onboarding_guide (day 1/3/7)
- morning_check_in_reminder
- evening_check_in_reminder
- morning_digest
- monday_motivational
- weekly_activity_report
- re_engagement
- scheduled_workout_reminder
- scheduled_program_reminder
- new_content_notification
- direct_coach_email
- renewal_thank_you / subscription_expired / cancellation (new premium lifecycle)
- purchase_workout / purchase_program / purchase_subscription

Report any missing/inactive templates and re-seed them.

### 2b. Cron audit
Query `cron_job_metadata` + live `cron.job` and confirm each of these is scheduled + last ran successfully:
- send-automated-messages-job (every 10 min)
- send-scheduled-notifications-job (every 10 min)
- send-renewal-reminders-daily (09:00)
- process-pending-notifications
- send-new-content-notifications
- send-scheduled-emails
- process-email-queue
- daily health audit + WOD crons (spot-check only)

Fix any missing entries via `ensure_cron_jobs()` and add missing schedules.

### 2c. Edge function audit
Confirm each function exists, deploys clean, and returns 200 on a dry ping:
- send-automated-messages
- send-welcome-email
- send-scheduled-notifications
- send-renewal-reminders
- send-new-content-notifications
- process-pending-notifications
- send-scheduled-emails
- verify-purchase (mandatory purchase confirmations)

### 2d. Admin UI sync
Confirm `AutomatedMessagesManager`, `AutomationRulesManager`, `MessagingMonitoringDashboard`, `MobileAppPushManager`, and Email tabs each read from the same `automated_message_templates` + `cron_job_metadata` tables so what you see in the admin panel matches what actually runs. Fix any tab reading from a stale/legacy source.

### 2e. Report
Produce a single audit table:

```text
Template | DB Active | Cron Scheduled | Last Run | Edge OK | Admin UI Visible
```

Anything red gets fixed in the same turn (re-seed template, re-schedule cron, or re-deploy function).

## Notes

- Part 1 sends real emails/notifications to hfsc.nicosia@gmail.com only.
- No structural UI changes; audit is backend + registry only.
- HFSC data is read-only (not modified) per project rule — only sends to that address.
