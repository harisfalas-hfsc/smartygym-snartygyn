# Fix Stale WOD Failure Email Template

## Why

You received a failure email this morning with **outdated wording** that still references the old backup logic (03:00 / 04:00 Cyprus). The detection logic itself is **working correctly** — it really did find missing WODs and alert you — but the HTML body is out of sync with the new schedule we deployed yesterday.

The new safety chain (which is actually what runs) is:
- 04:00 Cyprus — backup-wod-generation (verify)
- 04:15 Cyprus — watchdog-wod-check (verify)
- 08:30 / 08:50 Cyprus — primary generation
- 09:20 / 09:50 / 10:20 / 10:50 Cyprus — 4 retry passes
- 09:30 Cyprus — post-generation audit email (✅ success or ❌ failure summary)

## What to change

**File:** `supabase/functions/wod-generation-orchestrator/index.ts`

Rewrite the failure-email HTML block (lines ~235–290) to:

1. **Headline alert box** — replace "backup attempt is scheduled at 03:00 Cyprus" with the new retry chain wording. New copy:
   > All ${MAX_ATTEMPTS} primary attempts have failed for this run. The system will automatically retry at **04:00, 04:15, 08:30, 08:50, 09:20, 09:50, 10:20, and 10:50 Cyprus time**. You will receive a ✅ confirmation or ❌ final failure summary by **09:30 Cyprus** (post-generation audit email). Only take manual action if you receive a ❌ audit email at 09:30, OR no email at all by 11:00 Cyprus.

2. **Details table — "Backup Scheduled" row** — rename to **"Next Auto-Retry"** and show the next scheduled retry slot (computed from current UTC time vs. the cron schedule list), not a hardcoded "01:00 UTC / 03:00 Cyprus".

3. **"Backup System Active" info box** — rewrite to describe the 4-retry chain + 09:30 audit email instead of the obsolete single 03:00 backup.

4. **"Manual Fallback" box** — keep it (still valid), but update the wording to say "if the 09:30 audit email is ❌" instead of "if backup also fails".

5. **Comment on line 482** — update the inline comment that says "backup (03:00) and watchdog (03:05) wrappers" to reflect the new times (04:00 backup / 04:15 watchdog).

## What NOT to change

- Detection / dedup logic (it's correct).
- `wod_generation_notifications` table.
- Cron schedules.
- The post-generation audit email template (already correct from yesterday's migration).

## After deploying

The email you got this morning was a **real signal** — yesterday's manual catch-up didn't successfully fill May 5. Confirm via a quick query whether May 5's two WODs now exist (the 04:00 / 04:15 / 08:30 / 08:50 Cyprus chain should have filled them by now). If still missing, fire one manual retry from the admin panel.

## Memory update

Update `mem/system/wod-generation-time-window.md` to note: "Failure email body lists the full retry chain (04:00 / 04:15 / 08:30 / 08:50 / 09:20 / 09:50 / 10:20 / 10:50 Cyprus) and points to the 09:30 Cyprus audit email as the final verdict."

---

**Approve this plan and I'll implement it in default mode, then verify May 5's WODs actually exist.**
