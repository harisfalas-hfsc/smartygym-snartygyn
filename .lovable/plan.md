

# Full Messaging & Notifications System Report

## ✅ TL;DR
Your system has **19 automation rules** + **23 message templates** managed via 35 edge functions and **26 cron jobs**. Most automations are **healthy**; I found a few real issues worth fixing. User toggle settings are mostly complete but **2 toggles are missing**. Admin can fully edit everything via Communications Center + Email Campaigns.

---

## 1. AUTOMATED MESSAGES & EMAILS — what runs, when, status

### 🟢 Working perfectly (verified in audit log)

| # | Automation | When | Channels | Last 14 days |
|---|---|---|---|---|
| 1 | **Morning WOD Notification** | Daily 07:00 Cyprus | Dashboard + Email | ✅ 104–105 users, 100% success every day |
| 2 | **Morning Daily Ritual** | Daily 07:00 Cyprus (same job) | Dashboard + Email | ✅ 100% success every day |
| 3 | **Monday Motivation** | Mondays 11:00 Cyprus | Dashboard + Email | ✅ 53/54 sent (1 opted out) |
| 4 | **Morning Check-in Reminder** | Daily 09:00 Cyprus | Dashboard + Email | 🟢 Cron active |
| 5 | **Evening Check-in Reminder** | Daily 21:00 Cyprus | Dashboard + Email | 🟢 Cron active |
| 6 | **Welcome Onboarding (Day 5)** | 5 days post-premium signup | Dashboard + Email | ✅ Last fired Apr 11 |
| 7 | **Welcome Message (signup)** | Immediately on signup | Dashboard + Email | ✅ 25 total sends |
| 8 | **New Content Notification** (workouts/programs/articles) | Every 10 min batch | Dashboard + Email | ✅ Apr 20: 53/54 success on 10 new free workouts |
| 9 | **Subscription Expiration Reminder** | Daily 11:00 Cyprus | Dashboard + Email | 🟢 Cron active |
| 10 | **Subscription Expired Notification** | Daily 11:00 Cyprus | Dashboard + Email | 🟢 Cron active |
| 11 | **Renewal Reminders** (3-day & 1-day trial) | Daily 12:00 Cyprus | Email | 🟢 Cron active |
| 12 | **Holiday — Christmas / New Year** | Dec 25 / Jan 1 at 14:00 Cyprus | Dashboard + Email | 🟢 Scheduled |
| 13 | **Subscription Renewal Confirmation** | Event: on renewal webhook | Dashboard + Email | 🟢 Live, 0 fires (no renewals yet) |
| 14 | **First Purchase Welcome** | Event: on first purchase | Dashboard + Email | 🟢 Live, 0 fires yet |
| 15 | **Plan Change Notification** | Event: subscription plan change | Dashboard + Email | 🟢 Live, 0 fires yet |
| 16 | **Payment Failed Notification** | Event: payment fails | Dashboard + Email | 🟢 Live, 0 fires yet |
| 17 | **New Addition Notification** | Event-based (admin trigger) | Dashboard + Email | 🟢 Live |

### 🟡 Issues found

| Issue | Detail | Fix |
|---|---|---|
| **A. `announcement_update` failures** | On Apr 20 (04:10) two batches failed all 53/53 deliveries. Same on Apr 2. | I'll inspect the function and fix the failing path. |
| **B. Weekly Activity Report never runs** | Cron exists (Mon 10:00 Cyprus) but **only 1 send ever** (Dec 22, 2025). Hasn't fired since. | Cron likely silently failing — needs investigation. |
| **C. Reengagement Emails** | `send-reengagement-emails` function exists but **no cron job** scheduled. | Either schedule it or remove it. |
| **D. Direct Coach Email** | `send-direct-coach-email` function exists, no cron (event-based, OK) — but no automation_rule entry, so it isn't surfaced in the admin UI. | Register it in the Automation Rules manager. |

### 🔵 Legacy / archived (correctly disabled, no action needed)
- `morning_wod_notification` (legacy — replaced by Morning Daily Digest)
- `morning_ritual_notification` (legacy)
- `morning_wod_recovery_notification` (legacy)
- `daily_ritual` (legacy)
- `workout_of_day` event rule (legacy)

---

## 2. USER DASHBOARD SETTINGS — toggle coverage

Located at: **My Messages → Settings tab** (`UserMessagesPanel.tsx`).
Two managers render there: `DashboardNotificationSubscriptionManager` (in-app) + `MobilePushNotificationManager` (push).

### Currently togglable (11 switches) ✅
1. Workout of the Day
2. Smarty Ritual
3. Monday Motivation
4. New Workouts
5. New Training Programs
6. New Blog Articles
7. Weekly Activity Report
8. Check-in Reminders
9. Scheduled Workout Reminders
10. Scheduled Program Reminders
11. Goal Achievements

### 🟡 Missing user toggles
| Missing | Why it matters |
|---|---|
| **Welcome Onboarding (Day 5 guide)** | Premium users can't opt out |
| **Subscription/Renewal/Payment emails** (renewal reminder, expired, payment failed, plan change) | Currently no opt-out — arguably correct for transactional, but no UI acknowledgement |
| **Email-channel parity** | The Settings tab only exposes `dashboard_*` toggles. The DB also stores `email_*` keys (email_wod, email_ritual, email_new_workout, etc.) but there's **no UI to toggle them separately**. So users can only mute dashboard, not email. |
| **Holiday notifications** | No toggle |

This violates your "Notification Parity" memory rule (Web ↔ Email ↔ Push must sync).

---

## 3. ADMIN PANEL CAPABILITIES — Communications Center + Email Campaigns

You **can** manage everything from these 2 admin sections:

### Communications Center (8 tabs)
- **Monitor** — live messaging dashboard
- **Mobile Push** — AppMySite manual push manager
- **Auto Messages** — edit `automation_rules` (toggle on/off, change message_type, channels)
- **Templates** — edit `automated_message_templates` (subject, content, dashboard vs. email versions)
- **Scheduled** — one-off scheduled notifications
- **Mass** — broadcast notification
- **Announce** — unified announcement sender
- **Test** — send test message to yourself

### Email Campaigns (5 tabs)
- **Templates** — `email_templates` table (currently **EMPTY — 0 rows**) 🟡
- **Automated Emails** — same automation rules
- **Scheduled** — `scheduled_emails` (every 5 min cron processes them)
- **Mass Email** — bulk composer
- **Test Email** — verify deliverability

✅ **Yes — you can edit subject, body, schedule, audience, channels, and toggle every automation from the admin UI.**

---

## 4. ISSUES TO FIX (proposed actions)

| # | Action | Priority |
|---|---|---|
| 1 | Investigate why `send-system-message` / announcement_update batches failed Apr 20 (53/53 failures, no error message logged) | 🔴 High |
| 2 | Fix Weekly Activity Report cron — hasn't sent since Dec 22 despite weekly schedule | 🔴 High |
| 3 | Add **email-channel toggles** in user Settings (parity with dashboard toggles) — required by your own parity standard | 🟡 Medium |
| 4 | Add user toggle for **Welcome Onboarding** | 🟡 Medium |
| 5 | Either schedule or remove orphan `send-reengagement-emails` function | 🟢 Low |
| 6 | Register `send-direct-coach-email` in Automation Rules table for admin visibility | 🟢 Low |
| 7 | Improve audit logging — capture actual error message on failure (currently `metadata.error` is null) | 🟢 Low |

---

## 5. PROPOSED VERIFICATION TESTS (admin panel, end-to-end)

I'll run these from your admin panel and report results:
1. **Test Message** tab → send to your account → verify dashboard inbox + email
2. **Test Email** tab → send to your account → verify Resend delivery
3. **Mass Notification** → dry-run with target=admin only
4. **Trigger** Weekly Activity Report manually via curl → diagnose failure
5. **Trigger** the failing announcement_update path → capture real error
6. **Verify** every active automation rule appears in admin Auto-Messages tab and is editable

---

## DELIVERABLE AFTER APPROVAL
1. Fix the 2 broken/silent crons (Weekly Activity, announcement_update failure root cause)
2. Add email-channel toggles + Welcome Onboarding toggle to user Settings
3. Improve error capture in audit log
4. Run the 6 verification tests and report green/red per item
5. Deliver a final "all green" report with screenshots/log proof

