First, answers to your questions

1. What is going wrong with WOD generation?

- Today's WODs are actually present in the database and linked to Stripe:
  - BODYWEIGHT: Granite Coil Press, generated for 2026-05-15, image present, Stripe product/price present.
  - EQUIPMENT: Arcane Descent Test, generated for 2026-05-15, image present, Stripe product/price present.
- The real failure is for tomorrow's WODs, 2026-05-16. The scheduled WOD generator started but did not complete:
  - 06:30 UTC bodyweight run: stuck in running, later auto-closed as failed.
  - 06:50 UTC equipment run: stuck in running, later auto-closed as failed.
  - Retry runs at 07:20, 07:50, and 08:20 UTC are also stuck in running.
- The cron scheduler itself is firing. The database shows the cron jobs ran. The problem is that the cron uses the default database HTTP call timeout, about 5 seconds, while the WOD orchestrator/generator is a long-running operation. So the database cron records “request sent”, but the HTTP call times out before the WOD generation finishes. That leaves `wod_generation_runs` stuck as `running` and no tomorrow WOD rows get created.
- This is why the admin panel content and Stripe do not show the expected new WODs for tomorrow: the generator never reached the successful publish/linking stage for 2026-05-16.

2. Why did the health system check say no critical issues?

- The full system health audit currently checks today's WODs, not tomorrow's pre-built WODs.
- Because today's WODs are valid, it can honestly show “No critical issues” for the active public state.
- But that is not enough for your business rule, because your system now pre-builds tomorrow's WODs at 06:30/06:50 UTC. A health audit after those times must also check tomorrow readiness.
- The audit did detect zombie/stuck runs earlier, but after it auto-closed old stuck runs, the latest run had no critical issues because it was still judging mainly today's live WOD state.

3. Why did WOD Health Check pass all seven checks?

- The WOD Health Check button in `WODManager` is a “today is live” check. It queries `generated_for_date = today` and verifies count/images/Stripe for today's WODs.
- Since today's two WODs exist and are complete, it passes.
- It is not currently a “tomorrow pre-generation pipeline” check, so it misses the exact failure you care about.

4. Why did Future Ready show fails, but the other checks looked fine?

- Future Ready is closer to the truth. It found recurring `history_failed_runs` and missing/failed generation history.
- However, its wording is confusing because it reports cron jobs as active when they are registered and enabled, even if their HTTP calls are timing out and not completing WOD creation.
- So “bodyweight WOD generation active” means “the scheduler row exists and is enabled”, not “a real WOD was successfully produced.” That distinction needs to be made explicit.

5. Why did WOD Watchdog say everything is okay?

- WOD Watchdog currently verifies today's WODs only, in verify-only mode.
- Since today's WODs are okay, it says healthy.
- It does not verify tomorrow's pre-built WODs unless we change it to do so, or add a separate tomorrow watchdog.

Plan

1. Fix the scheduled WOD generation timeout problem

- Update the WOD cron registration so long-running WOD calls do not use the default 5-second `net.http_post` timeout.
- Add a proper timeout override to these scheduled calls:
  - `generate-wod-bodyweight-daily`
  - `generate-wod-equipment-daily`
  - `wod-retry-pass-1`
  - `wod-retry-pass-2`
  - `wod-retry-pass-3`
  - `wod-retry-pass-4`
  - `wod-post-generation-audit` if needed
- Update the `heal_wod_crons()` self-healing function so it re-registers jobs with the same timeout-safe definition. Otherwise the watchdog could “heal” the crons back into the broken 5-second version.

2. Make the WOD orchestrator safe against stuck `running` rows

- Keep the existing finalization logic, but strengthen it so that if a run is terminated or times out, the database status becomes `failed` with a clear error instead of staying `running`.
- Ensure retry runs are visible as completed/failed, not ambiguous zombie records.
- Preserve the existing rule: automatic jobs must not silently pull paid/library content unless explicitly allowed by the admin flow.

3. Make the health audit check tomorrow readiness after generation time

- Extend `run-system-health-audit` with a dedicated “Tomorrow WOD Readiness” critical check.
- After the pre-generation window starts, the audit must fail if tomorrow's expected WODs are missing, incomplete, missing image, or missing Stripe link.
- Before the generation window, the check should be informational, not a false alarm.
- Include stuck `running` rows for tomorrow as a critical issue, not just a cleanup detail.

4. Fix WOD Health Check and WOD Watchdog semantics in the admin panel

- Update the WOD Health Check button text/result so it clearly says it checks today's live WODs.
- Add or adjust a separate tomorrow/pre-generation check in the same admin area so you can see whether tomorrow is ready.
- Update WOD Watchdog behavior or copy so it does not claim “all healthy” when only today's WODs are healthy and tomorrow generation has failed.

5. Improve Future Ready so it cannot be fooled by “cron active”

- Keep the cron active checks, but add completion checks:
  - Did each scheduled WOD job create/finish a run row today?
  - Did that run produce the expected BODYWEIGHT/EQUIPMENT rows for tomorrow?
  - Did the retry passes actually resolve missing slots?
- Change wording from “generator active” to “scheduler active” where appropriate.
- Surface the real failure plainly: scheduler fired, HTTP request timed out, generation did not complete.

6. Backfill/repair the current failed date after code changes

- After the timeout and checks are fixed, run the WOD generation flow for 2026-05-16.
- Verify database rows exist for tomorrow with:
  - correct `generated_for_date`
  - `is_workout_of_day = true`
  - expected equipment slots
  - image present
  - Stripe product and price IDs present
- Verify Stripe records exist for both WODs.

7. Final verification before saying done

I will not say it is done until I recheck all of these:

- Lovable Cloud backend is healthy.
- Today's WODs still exist and remain valid.
- Tomorrow's WODs exist and are complete.
- No WOD generation run is stuck in `running`.
- The cron jobs are registered with timeout-safe calls.
- WOD Health Check no longer gives a misleading “all healthy” for future generation failures.
- Future Ready shows the correct result after repair.
- WOD Watchdog/admin wording no longer hides the difference between today live and tomorrow ready.
- System health audit reports a critical issue when tomorrow WODs are missing after the expected generation window.