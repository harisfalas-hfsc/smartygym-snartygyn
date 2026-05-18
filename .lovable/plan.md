
## What I found

### Cron Jobs section in admin panel
The admin panel reads from `cron_job_metadata`. I compared it to the live `cron.job` table (the actual scheduler).

**35 live cron jobs running. Metadata is 99% in sync, but there are 6 discrepancies:**

#### A) Live in scheduler but MISSING from admin panel (2)
| job_name | schedule | what it does |
|---|---|---|
| `auto-finalize-draft-invoices-hourly` | `0 * * * *` (hourly) | Hourly safety net for stuck Stripe draft invoices (companion to the 4-hour one already shown) |
| `stripe-orphan-cleanup-daily` | `0 4 * * *` (daily 04:00 UTC) | Calls `stripe-orphan-cleanup` to clean general Stripe orphans (distinct from `cleanup-wod-stripe-orphans-daily` at 09:00) |

#### B) Shown in admin panel but NO LONGER in scheduler (4 stale rows)
| job_name | status |
|---|---|
| `cleanup-old-rate-limits` | not in pg_cron |
| `daily-system-health-audit-after-generation` | not in pg_cron (replaced by `wod-post-generation-audit`) |
| `send-automated-messages-job` | not in pg_cron |
| `send-new-content-notifications-job` | not in pg_cron (folded into `process-pending-notifications-job`) |

#### C) One outdated description
- `generate-weekly-blog-articles` description says "saved as drafts for admin review" — but the function actually **auto-publishes**. Fix the wording.

### Communications Center (Messaging System Monitor)
All 8 tabs are wired correctly to live components:

| Tab | Component | Status |
|---|---|---|
| Monitor | `MessagingMonitoringDashboard` (Automation Rules / Recent Activity / System Health) | wired ✅ |
| Mobile Push | `MobileAppPushManager` | wired ✅ |
| Auto Messages | `AutomationRulesManager` | wired ✅ |
| Templates | `AutomatedMessagesManager` | wired ✅ |
| Scheduled | `ScheduledNotificationsManager` | wired ✅ |
| Mass | `MassNotificationManager` | wired ✅ |
| Announce | `UnifiedAnnouncementSender` | wired ✅ |
| Test | `TestMessageSender` | wired ✅ |

No tabs are missing or pointing to the wrong component. I'll do a runtime check of each tab's data fetch during execution to make sure each one actually shows the right rows (no empty states from a broken query).

---

## Plan

### Step 1 — Add 2 missing cron jobs to admin panel
Insert metadata rows for `auto-finalize-draft-invoices-hourly` (category `billing`) and `stripe-orphan-cleanup-daily` (category `maintenance`), so they show up alongside the others in CronJobsManager.

### Step 2 — Remove 4 stale rows from admin panel
Delete the 4 `cron_job_metadata` rows that no longer have a matching live cron job. This prevents the UI from showing dead jobs.

### Step 3 — Fix blog generator description
Update `generate-weekly-blog-articles` metadata text from "saved as drafts" → "auto-published Monday 06:00 Cyprus".

### Step 4 — Runtime check of Communications Center
Open the deployed admin route and verify each tab loads:
- Monitor → counts/rows render in all 3 sub-tabs
- Mobile Push, Auto Messages, Templates, Scheduled, Mass, Announce, Test → list/form renders without console errors
Fix anything that returns 0 rows or throws.

### Step 5 — Verify
Re-run the diff query → both lists must be empty (live = metadata). Reload `/admin` Cron Jobs tab and visually confirm both new jobs show in the right category and the 4 stale ones are gone. Confirm 8 Communications tabs all render.

---

## Technical details

- Step 1+2+3 are **data-only changes** to `public.cron_job_metadata` — no schema changes, no code changes.
- No live `cron.job` entries will be modified — the scheduler is already correct, only the admin display layer is being synced to it.
- Step 4 is read-only inspection; any fixes will be isolated patches to the specific tab component.
- Zero impact on user-facing site, content, billing, or scheduled execution.
