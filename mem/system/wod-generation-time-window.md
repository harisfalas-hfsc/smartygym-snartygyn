---
name: WOD generation time window
description: Daily WOD generation runs 06:30/06:50 UTC pre-building TOMORROW with 4 retry passes (07:20–08:50 UTC); 09:30 Cyprus post-gen audit emails admin success or failure; archive 21:00 UTC
type: feature
---

# WOD Generation Time Window (LIVE)

## Schedule (UTC)
- 06:30 UTC — `generate-wod-bodyweight-daily` → builds **tomorrow's** bodyweight WOD
- 06:50 UTC — `generate-wod-equipment-daily` → builds **tomorrow's** equipment WOD
- 07:20 UTC — `wod-retry-pass-1` (retries missing slots for tomorrow only)
- 07:30 UTC — `wod-post-generation-audit` (calls `run-system-health-audit` with `sendEmail:true` → admin email success or failure)
- 07:50 UTC — `wod-retry-pass-2`
- 08:20 UTC — `wod-retry-pass-3`
- 08:50 UTC — `wod-retry-pass-4` (final)
- 21:00 UTC (00:00 Cyprus) — `archive-old-wods` archives yesterday; tomorrow's pre-built WODs become "today" via `generated_for_date` filter

## Cyprus times (winter / EET)
08:30 BW · 08:50 EQ · 09:20 retry1 · 09:30 audit+email · 09:50 retry2 · 10:20 retry3 · 10:50 retry4 · 23:00 archive · 00:00 silent rollover · 07:00 user notifications

## Admin notifications
- Orchestrator sends ONE email per (target_date, slot, status) tuple via `wod_generation_notifications` dedupe table.
- Success → ✅ confirmation email after first successful pass.
- Failure → ❌ alert after final attempt of any single orchestrator run.
- Multiple retry crons therefore cannot spam the inbox.
- Failure email body lists the full Cyprus auto-retry chain (04:00 / 04:15 / 08:30 / 08:50 / 09:20 / 09:50 / 10:20 / 10:50) and points to the 09:30 Cyprus post-generation audit email as the authoritative final verdict.

## Internal orchestrator retries
3 attempts × 45 s wait inside a single orchestrator invocation.
External retry chain (4 crons × 30-min spacing) re-fires the orchestrator with `retryMissing:true`.

## Admin UI
"WOD Watchdog" button in WODManager (next to "Future Ready?") manually invokes `watchdog-wod-check`.

## Safety nets unchanged
- 02:00 UTC `backup-wod-generation` (verify-only)
- 02:15 UTC `watchdog-wod-check` (display name "WOD Watchdog")
- 14:00 UTC `daily-system-health-audit-after-generation` (17:00 Cyprus long-window check)
- Manual "Generate New WOD" button always available
