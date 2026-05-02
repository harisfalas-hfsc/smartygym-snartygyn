-- Cleanup of dead database objects (zero-risk pruning)

-- 1) Drop the dead 1-arg overload of update_wod_cron_schedule
--    (all callers in the app use the 2-arg version with hour + minute)
DROP FUNCTION IF EXISTS public.update_wod_cron_schedule(integer);

-- 2) Drop the orphan old welcome-email function
--    (no triggers reference it; replaced by trigger_welcome_email_on_confirm
--     on auth.users which was installed yesterday and is working)
DROP FUNCTION IF EXISTS public.trigger_welcome_email();

-- 3) Drop the redundant always-fire image generation trigger.
--    Two triggers were firing on every workout INSERT, both calling the
--    same auto-generate-workout-image edge function. We keep the smarter
--    conditional one (auto_generate_workout_image_on_insert) and drop the
--    blanket one along with its function.
DROP TRIGGER IF EXISTS auto_generate_workout_image_trigger ON public.admin_workouts;
DROP FUNCTION IF EXISTS public.trigger_auto_generate_workout_image();

-- 4) Unschedule the broken cleanup-old-rate-limits cron.
--    It pointed at an edge function (cleanup-rate-limits) that does not
--    exist, so it has been failing silently every night. Rate-limit
--    cleanup is already performed inline by check_rate_limit() on every
--    invocation, so no replacement is needed.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-rate-limits') THEN
    PERFORM cron.unschedule('cleanup-old-rate-limits');
  END IF;
END $$;
