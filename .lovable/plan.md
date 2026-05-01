I found the concrete failure: today’s WOD generation started, but the backend request hit the 150-second idle timeout and left the run stuck as `running`. The backup and watchdog jobs also triggered, but their requests used the default 5-second database HTTP timeout, so they timed out before recovery could finish. Result: no active WOD rows exist for today.

Plan to fix it now:

1. Restore today’s Workout of the Day immediately
   - Manually trigger generation for today using the deployed WOD generator with `retryMissing: true`.
   - If the normal generator still times out, switch WOD mode to library selection for today and select two existing validated workouts as today’s WODs so users have workouts now.
   - Verify the database has exactly the expected active WODs for today: `BODYWEIGHT` and `EQUIPMENT` for 2026-05-01.
   - Verify they are visible through the same metadata function the homepage uses.

2. Fix the stuck run records
   - Mark today’s orphaned `running` records as `failed` or `recovered` based on the final result, so the admin status widget does not show a fake in-progress state.
   - Record the real reason: timeout / recovery job timeout.

3. Make cron recovery actually wait long enough
   - Update the `backup-wod-generation` and `watchdog-wod-check` cron definitions so their `net.http_post` calls include a long timeout, matching the orchestrator (`timeout_milliseconds := 900000`).
   - This fixes the exact 5-second timeout seen at 01:00 and 01:05 UTC.

4. Remove slow nested function calls from the critical path where possible
   - The generator currently calls image generation inside WOD creation. That can push total generation over the gateway timeout.
   - Change WOD generation so the workout text/content is published first, then image generation runs asynchronously or as a non-blocking follow-up.
   - The WOD must never fail to appear just because image generation is slow.

5. Add hard timeout handling inside the generator/orchestrator
   - Add a time budget guard so if generation approaches the platform timeout, it stops cleanly, updates `wod_generation_runs`, and returns a useful failure response instead of leaving `running` forever.
   - Make the orchestrator finalize stuck attempts even when the nested generator times out.

6. Add a fast emergency fallback for future mornings
   - If generated WOD creation fails after the normal attempts, automatically select validated library workouts for that date instead of publishing nothing.
   - For non-recovery days, fallback must publish one `BODYWEIGHT` and one `EQUIPMENT` workout.
   - For recovery days, fallback must publish one `VARIOUS` workout.
   - This follows the non-destructive policy: duplicate/select existing valid content as WOD, never permanently delete paid content.

7. Validate the final state
   - Check today’s `admin_workouts` rows.
   - Check `wod_generation_runs` no longer has stuck `running` records for today.
   - Check the homepage-facing WOD metadata query returns today’s WODs.
   - Check recent backend response logs show recovery success rather than timeout.