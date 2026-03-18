
Truth based on current backend data (not assumptions):

1) Why yesterday failed (2026-03-17 Cyprus)
- There is no orchestrator run record for cyprus_date=2026-03-17 in `wod_generation_runs`.
- Two WODs were created much later at `2026-03-17 05:14 UTC` (not at scheduled 22:30 UTC previous day), then archived at 22:00 UTC.
- This means automatic generation did not complete on schedule; recovery happened later/manual path.

2) Why today failed (2026-03-18 Cyprus)
- `wod_generation_runs` has run `77803639-94c6-4f72-867e-be4ffc59da37` marked failed for 2026-03-18.
- Current active WODs for today: only 1 (`EQUIPMENT`, “Lower Body Pillar”).
- BODYWEIGHT variant is missing.

3) What is still healthy
- Stripe integration is currently healthy in latest health audit (API key, products, prices = pass).
- Standalone/paid setup is intact: visible sellable workouts with Stripe IDs/prices are present.
- Image coverage is healthy: visible workouts have images; today’s WOD has image + Stripe product/price IDs.

4) What is actually wrong in system design
- Cron for `generate-workout-of-day` still uses `timeout_milliseconds:=300000` (5 min).
- Backup job exists, but has not executed yet (`backup-wod-generation` run history is empty) because it was scheduled after today’s 01:00 UTC window.
- Generation flow allows partial publish (one variant can become active before both are confirmed).
- Cron “job succeeded” only confirms `net.http_post` enqueue, not that function logic succeeded end-to-end.

Implementation plan (direct, no ambiguity):

Phase A — Immediate production recovery
1. Generate missing BODYWEIGHT for 2026-03-18 using controlled retry path (`retryMissing=true` for target date).
2. Verify exactly 2 active WODs for today (BODYWEIGHT + EQUIPMENT), both section-complete and exercise-density valid.
3. Mark run 77803639 as recovered (or close with explicit final status) and write an incident log entry.

Phase B — Stop recurrence (same day hardening)
1. Increase orchestrator cron HTTP timeout from 300000 to 900000 (15 min) so retries can finish.
2. Execute backup function once immediately after deploy (don’t wait for next 01:00 UTC).
3. Enforce all-or-none publish:
   - Generate both variants as non-active drafts first.
   - Only set `is_workout_of_day=true` / `generated_for_date=today` when both pass validation.
   - If either fails, publish none (prevents “only one WOD live” state).
4. Add deterministic partial-failure alert:
   - If expected=2 and found=1 at end of run, send immediate critical admin alert with missing variant.
5. Ensure every orchestrator path writes a run record (including library mode path) for traceability.

Phase C — Monitoring you can trust (week-2 completion)
1. Add a 03:05 Cyprus watchdog check:
   - If today’s active WOD count < expected, auto-trigger recovery and send critical alert.
2. Add scheduler reconciliation check:
   - Compare `cron.job` vs `cron_job_metadata` and flag drift/missing functions.
3. Add an admin diagnostics endpoint/report:
   - `today expected`, `today found`, `run status`, `last error`, `next retry/backup`.

Acceptance criteria (business-safe)
- By tomorrow morning: exactly expected WOD count (2 on training day / 1 on recovery day) before user peak traffic.
- No run remains “running” >30 min.
- Any partial generation triggers immediate alert and automatic repair.
- Stripe/standalone/image checks continue passing in daily health audit.
