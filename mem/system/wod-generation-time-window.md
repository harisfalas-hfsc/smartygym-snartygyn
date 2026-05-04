---
name: WOD generation time window
description: Daily WOD generation runs 06:30/06:50 UTC and pre-builds tomorrow; archive at 21:00 UTC rolls tomorrow into today
type: feature
---

# WOD Generation Time Window (LIVE since 2026-05-04)

## Schedule (UTC)
- 06:30 UTC — `generate-wod-bodyweight-daily` → builds **tomorrow's** bodyweight WOD
- 06:50 UTC — `generate-wod-equipment-daily` → builds **tomorrow's** equipment WOD
- 21:00 UTC (00:00 Cyprus) — `archive-old-wods` archives yesterday; tomorrow's pre-built WODs become "today" via `generated_for_date` filter

## Rationale
06:30/06:50 UTC is the calmest window on the AI gateway (US asleep, Asia winding down, EU not yet awake). The previous 21:05/21:25 UTC slot collided with the global peak and caused intermittent generation failures.

## Cron payload contract
Both morning jobs POST to `wod-generation-orchestrator` with:
```json
{ "triggerSource": "cron-bodyweight" | "cron-equipment",
  "slot": "BODYWEIGHT" | "EQUIPMENT",
  "targetDate": "<tomorrow Cyprus YYYY-MM-DD>" }
```
Orchestrator validates `targetDate` (regex `^\d{4}-\d{2}-\d{2}$`) and falls back to today (Cyprus) if missing.

## Admin "change time" RPC
`update_wod_cron_schedule(hour, minute)` reschedules **both** split jobs: bodyweight at chosen time, equipment at chosen + 20 min (carries hour). Also syncs `cron_job_metadata` and `wod_auto_generation_config`.

## Health-audit guard
`run-system-health-audit` adds a "Tomorrow's WODs Pre-Generated" check. After 12:00 UTC it fails if tomorrow's WODs are missing (warning before noon, when crons may not have run yet).

## Safety nets unchanged
- 02:00 UTC `backup-wod-generation` (verify-only retry for today)
- 02:15 UTC `watchdog-wod-check` (admin alert if today missing)
- Manual "Generate New WOD" button always available
