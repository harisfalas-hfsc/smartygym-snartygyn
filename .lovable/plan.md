
# Reliability Fix Plan (Immediate + 2-Week Hardening)

## What I confirmed in your backend
- For **2026-03-18**, only **1 WOD** exists (`EQUIPMENT`, “Lower Body Pillar”).
- `wod_generation_runs` has a stuck run:  
  `id=77803639-94c6-4f72-867e-be4ffc59da37`, `status='running'`, `expected_count=2`, `found_count=0`, no `completed_at`.
- Cron is calling `wod-generation-orchestrator` at `22:30 UTC`, but the run never closed as success/fail.
- `section-validator.ts` currently has:
  - `isComplete: missingIcons.length === 0` (does **not** include exercise-density failure)
- Health audit does **not** check `wod_generation_runs` for zombie/running-too-long failures.
- There is stale scheduler config drift (example: metadata references `verify-wod-generation`, but no such function exists).

## Why this happened
- Generation partially succeeded (one variant created), then orchestration did not complete its retry/failure path, leaving the run stuck.
- Because the run never reached “failed”, failure email logic did not fire.
- Daily health audit runs later in the day, so you won’t get immediate warning at generation time.

## Fix to implement now (hotfix)
1. **Restore today’s missing WOD immediately**
   - Trigger `generate-workout-of-day` with `retryMissing: true` for today’s Cyprus date.
2. **Close zombie run**
   - Mark the stuck run as `failed` with explicit reason and timestamp (or `recovered` if retry succeeds in same flow).
3. **Immediate incident visibility**
   - Insert explicit failure/recovery records into `notification_audit_log` and `email_delivery_log` so this is traceable.

## Week 1 (stability fixes)
1. **Validator correctness**
   - Update `_shared/section-validator.ts`:
     - `isComplete = missingIcons.length === 0 && hasMinimumExercises`
2. **Orchestrator reliability**
   - Refactor `wod-generation-orchestrator` so status is always finalized in `finally` (`success`/`failed`) and never left `running`.
   - Replace long in-function retry sleeps with deterministic retry strategy that survives execution limits.
3. **Backup generation path**
   - Reintroduce a real backup verification/generation function + cron (01:00 UTC / 03:00 Cyprus), aligned with your intended failover design.
4. **Health audit upgrade**
   - Add explicit checks:
     - stale `running` run > 30 min = **fail**
     - expected vs actual WOD count mismatch after generation window = **fail**

## Week 2 (hardening + observability)
1. **Cron/scheduler reconciliation**
   - Auto-check metadata vs actual scheduler jobs and flag/remove orphaned jobs/functions.
2. **Operational alerts**
   - Add dedicated “partial generation” alert (1/2 variants) with exact missing variant in subject/body.
3. **Runbook-safe behavior**
   - Add idempotent retry lock per `cyprus_date` to prevent race/double-generation while allowing safe recovery re-runs.
4. **Admin diagnostics**
   - Add lightweight status endpoint/report: `today expected`, `today found`, `run status`, `last error`, `next retry`.

## Technical implementation scope
- `supabase/functions/_shared/section-validator.ts`
- `supabase/functions/wod-generation-orchestrator/index.ts`
- `supabase/functions/run-system-health-audit/index.ts`
- Add/restore backup verification function (and schedule it)
- Scheduler SQL updates for cron consistency and timeout/retry behavior

## Done criteria
- Today shows **2/2 WODs** (or 1/1 on recovery day).
- No `wod_generation_runs` row remains `running` past 30 minutes.
- On partial failure, admin gets deterministic alert + automatic backup attempt.
- Health audit reports partial/zombie runs as failures the same day.
