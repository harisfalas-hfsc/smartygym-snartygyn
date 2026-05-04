---
name: WOD Future Ready Audit
description: Comprehensive WOD pipeline audit button with persistent recurrence memory
type: feature
---
The "Future Ready?" button in WODManager runs a full-pipeline audit covering 7 sections: Cron (Plan C+D split jobs incl. generate-wod-bodyweight-daily 21:05 UTC and generate-wod-equipment-daily 21:25 UTC), History (last 7 days of wod_generation_runs), Today (count/image/Stripe integrity), Future (next 7-day periodization from 84-day cycle), Library (exercise inventory), Pipelines (week-wide image/Stripe), and Config (wod_auto_generation_config).

Every run is persisted to `wod_readiness_audits` with stable `failed_check_keys` so subsequent runs auto-detect 🔁 RECURRING issues and ✅ RESOLVED ones by comparing against the previous 7 audits.

Replaces the old "Tomorrow Ready?" button which checked the obsolete `generate-workout-of-day` cron name and produced false ❌ alarms.
