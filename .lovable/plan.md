
## Incident explanation (based on current data)

1. **Why Manos never got Welcome #1 originally**
   - The welcome pipeline depends on a profile-insert trigger that checks whether email is already confirmed **at insert time**.
   - For Manos, profile was created at `2026-03-05 15:10:20 UTC`, but email was confirmed at `15:10:35 UTC` (15 seconds later).
   - Because confirmation happened after profile insert, the trigger path was skipped and there was no retry at that time.
   - There are also **two profile insert triggers** calling the same welcome function, which is risky and should be cleaned up.

2. **Did he get it now? Which inbox?**
   - **Dashboard inbox:** Yes. `user_system_messages` has a `welcome` message for his user at `2026-03-28 07:42:43 UTC`.
   - **Email:** System audit shows `email_sent: true` for that same send event at `2026-03-28 07:42:44 UTC` to his account email (`manos_christofi@yahoo.com`).
   - This means the provider accepted the email send; final mailbox placement (inbox/spam) depends on recipient mailbox filtering.

3. **When will he get Welcome #2 with current logic**
   - Current automation sends only to users whose premium subscription was created **exactly 5 days ago**.
   - Manos subscription started `2026-03-09`, so he is outside that window and will not get it automatically now.
   - Cron for Welcome #2 exists and is active (`0 10 * * *`), but no run yet because it was created recently and next run is at scheduled time.

4. **Are cron jobs currently running**
   - Core jobs checked are active and recently succeeding (morning notifications, scheduled notifications, renewal reminders).
   - Welcome #2 cron is active; pending first eligible execution window.

---

## Implementation plan (next execution pass)

1. **Immediate user recovery**
   - Trigger **Welcome #2 immediately for Manos** (dashboard + email), then verify:
     - dashboard row exists in `user_system_messages`
     - audit row exists with send metadata
     - no duplicate welcome_onboarding message

2. **Fix the root cause for Welcome #1**
   - Replace fragile “insert-time confirmed email” dependency with a robust fallback:
     - keep first-login send path
     - add a backend retry/backfill job for users with `welcome_sent = false` and confirmed email
   - Remove duplicate profile trigger wiring (single trigger only).

3. **Guarantee no future misses**
   - Add idempotent enforcement for welcome flow:
     - only one `welcome` per user
     - safe retry behavior if first attempt is skipped/fails

4. **Cron reliability hardening**
   - Add cron health watchdog:
     - monitor `cron.job_run_details` for failures/stale jobs
     - alert admin via dashboard notification if any critical job misses expected runtime
   - Extend system health audit to include “last successful run” and failure streaks per critical job.

5. **Verification checklist after changes**
   - New premium test user with delayed email confirm still gets Welcome #1.
   - Manos has Welcome #2 in dashboard and email audit.
   - Critical cron jobs show green status and last-run timestamps in admin monitoring.
