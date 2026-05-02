## Goal

Fix two issues found in the audit, leaving the WOD orchestrator (issue a) untouched until tomorrow's verification:

- **(b)** Welcome emails never fire because the trigger checks `email_confirmed_at` at the wrong moment.
- **(c)** 14 email-sending Edge Functions don't write to `email_delivery_log`, so we have zero visibility into delivery success/failure.

No changes to the WOD orchestrator. No structural changes to UI. No new tables.

---

## Issue (b) — Welcome Email Trigger Gap

### Root cause

The current trigger `trigger_welcome_email()` runs on `profiles` INSERT. But the order of operations during signup is:
1. User signs up → `auth.users` row created with `email_confirmed_at = NULL`
2. `handle_new_user()` immediately creates a `profiles` row → trigger fires → sees `user_confirmed = false` → **skips sending**
3. User clicks confirmation link → `auth.users.email_confirmed_at` is set → **nothing fires**

Net result: welcome email is never sent for any user who confirms their email after signup (i.e., everyone).

### Fix

Add a second trigger on `auth.users` that fires on UPDATE when `email_confirmed_at` transitions from NULL → NOT NULL. It calls the same `send-welcome-email` Edge Function and marks `profiles.welcome_sent = true`.

```text
auth.users (UPDATE)
   └─ trigger_welcome_email_on_confirm()
        ├─ if OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL
        ├─ if profiles.welcome_sent = false (idempotency)
        └─ POST /send-welcome-email + mark welcome_sent = true
```

Keep the existing profile-INSERT trigger as-is (covers admin-created users that are already confirmed). The new trigger covers the normal signup flow.

### Backfill

Run a one-time UPDATE that fires the welcome email for users who:
- Have `email_confirmed_at IS NOT NULL` (confirmed)
- Have `profiles.welcome_sent = false` (never received it)
- Created in the last 30 days (avoid spamming year-old accounts)

This catches recent signups stuck in the gap.

---

## Issue (c) — Missing logEmailDelivery Instrumentation

### Root cause

The helper `supabase/functions/_shared/email-log.ts` exists and writes to `email_delivery_log`. But 14 of the email-sending Edge Functions never import or call it. So every email send is invisible — we cannot tell if Resend bounced, succeeded, or was rate-limited.

### Functions to instrument (14 total)

```
send-checkin-reminders
send-contact-email
send-contact-response-notification
send-direct-coach-email
send-holiday-notifications
send-mass-notification
send-new-content-notifications
send-notification
send-renewal-reminders
send-subscription-expired-notifications
send-system-message
send-test-admin-email
send-weekly-motivation
send-welcome-onboarding
```

### Fix pattern (applied to each function)

After every `resend.emails.send(...)` call, log the outcome:

```text
import { logEmailDelivery } from "../_shared/email-log.ts";

const result = await resend.emails.send({ ... });

if (result.error) {
  await logEmailDelivery({
    userId, toEmail, messageType: "renewal-reminder",
    status: "failed", errorMessage: result.error.message,
  });
} else {
  await logEmailDelivery({
    userId, toEmail, messageType: "renewal-reminder",
    status: "sent", resendId: result.data?.id,
  });
}
```

`messageType` will be a stable string per function (e.g., `welcome-onboarding`, `renewal-reminder`, `weekly-motivation`) so we can filter the log later.

Wrap in try/catch so logging failures never break sends.

---

## What we're NOT touching

- ❌ WOD orchestrator (issue a) — waiting until tomorrow morning
- ❌ Library-fallback removal — same, blocked on (a)
- ❌ `send-welcome-email` Edge Function logic itself (already works when called)
- ❌ Existing profile-INSERT welcome trigger — kept as safety net for admin-created confirmed users
- ❌ Auth flow / signup UX

---

## Deliverables

1. One DB migration: new `trigger_welcome_email_on_confirm()` function + `AFTER UPDATE OF email_confirmed_at ON auth.users` trigger + 30-day backfill UPDATE.
2. 14 Edge Function edits, each adding `logEmailDelivery` calls after `resend.emails.send`.
3. Deploy all 14 modified Edge Functions.

---

## Verification (after deploy)

- (b) Create a test signup → confirm via email link → check `profiles.welcome_sent = true` and welcome email arrives.
- (c) Trigger any one of the 14 functions (e.g., send a test admin email) → confirm a row appears in `email_delivery_log` with status `sent` and a Resend ID.

Estimated time: ~15 min.