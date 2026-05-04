# End-to-End WOD Generation Test

Verify the recent fixes (slot-scoped verification + sanitizer auto-repair) hold up under a fresh, real run by archiving today's two WODs and re-generating them via the orchestrator.

## Steps

1. **Snapshot current state**
   - Query `admin_workouts` for today's `is_workout_of_day = true` rows (Cyprus date) and record their IDs, names, categories, image_url, stripe_product_id.

2. **Archive both active WODs**
   - Invoke `archive-old-wods` edge function directly (it archives ALL active WODs regardless of date — exactly what we need for a clean test).
   - Re-query to confirm `is_workout_of_day = false` and that they received serial numbers (AI-generated) or were cleared (library).

3. **Trigger BODYWEIGHT generation**
   - Call `wod-generation-orchestrator` with `{ slot: "BODYWEIGHT", force: true }`.
   - Stream `wod-generation-orchestrator` + `generate-workout-of-day` logs in real time, watching for:
     - Sanitizer auto-repair hits (`}}<text>` → `}} <text>`)
     - Slot-scoped verification ("requested slot: BODYWEIGHT, found: BODYWEIGHT")
     - Image generation trigger
     - Stripe product link
     - Final commit (no rollback)

4. **Trigger EQUIPMENT generation**
   - Same as above with `{ slot: "EQUIPMENT", force: true }`.

5. **Verify final state**
   - Run `scripts/wod-smoke-check.sql` equivalent: confirm `has_bodyweight_wod = true`, `has_equipment_wod = true` for today's Cyprus date.
   - Confirm both rows have: `image_url IS NOT NULL`, `stripe_product_id IS NOT NULL`, `is_visible = true`, valid 5-section `main_workout`.

6. **Report**
   - Per-slot summary: success/failure, time taken, any auto-repairs triggered, any retries.
   - If anything fails, surface the exact log line and root cause before any further fixes.

## Failure handling

- If a slot fails to commit, do NOT auto-retry blindly. Capture the failure reason from logs, present it, and wait for direction.
- If the watchdog or stripe-orphan-cleanup needs to run to clean partial state, mention it but don't run unprompted.

## Affected systems (read/invoke only — no code changes)

- `archive-old-wods` (invoke)
- `wod-generation-orchestrator` (invoke ×2)
- `generate-workout-of-day` (invoked downstream)
- `admin_workouts` table (read before/after)

No code edits in this plan — pure verification run.
