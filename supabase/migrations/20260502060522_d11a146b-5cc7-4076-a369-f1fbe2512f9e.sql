
-- ═══════════════════════════════════════════════════════════════════════════════
-- PLAN 2 — Two-Cron Split WOD Generation
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Restore wod_mode to fresh generation (no automatic library fallback at cron level)
UPDATE public.wod_auto_generation_config
SET wod_mode = 'generate',
    updated_at = now();

-- 2. Unschedule the old single-WOD cron jobs (if present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-workout-of-day') THEN
    PERFORM cron.unschedule('generate-workout-of-day');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-wod-daily') THEN
    PERFORM cron.unschedule('generate-wod-daily');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'backup-wod-generation') THEN
    PERFORM cron.unschedule('backup-wod-generation');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'watchdog-wod-check') THEN
    PERFORM cron.unschedule('watchdog-wod-check');
  END IF;
  -- Remove any earlier slot-named jobs in case this migration is re-run
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-wod-bodyweight-daily') THEN
    PERFORM cron.unschedule('generate-wod-bodyweight-daily');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-wod-equipment-daily') THEN
    PERFORM cron.unschedule('generate-wod-equipment-daily');
  END IF;
END $$;

-- 3. Schedule the two slot-specific WOD generation jobs
--    Each call posts {slot, triggerSource} so generate-workout-of-day produces only ONE variant.
--    Background mode is the default in the function, returning 202 immediately and continuing
--    via EdgeRuntime.waitUntil — but the slot scope keeps end-to-end work well under 150s.
SELECT cron.schedule(
  'generate-wod-bodyweight-daily',
  '5 21 * * *',  -- 21:05 UTC daily ≈ 00:05 Cyprus (summer) / 23:05 (winter)
  $$
  SELECT net.http_post(
    url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/generate-workout-of-day',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body := '{"slot":"BODYWEIGHT","triggerSource":"cron-bodyweight","background":true}'::jsonb
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'generate-wod-equipment-daily',
  '25 21 * * *',  -- 21:25 UTC daily, 20-minute gap after bodyweight
  $$
  SELECT net.http_post(
    url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/generate-workout-of-day',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body := '{"slot":"EQUIPMENT","triggerSource":"cron-equipment","background":true}'::jsonb
  ) AS request_id;
  $$
);

-- 4. Reschedule safety nets after both slot crons should have completed.
--    Backup at 02:00 UTC, Watchdog at 02:15 UTC. Both are slot-aware now and only
--    regenerate the missing variant; they do NOT switch to library mode automatically.
SELECT cron.schedule(
  'backup-wod-generation',
  '0 2 * * *',  -- 02:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/backup-wod-generation',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'watchdog-wod-check',
  '15 2 * * *',  -- 02:15 UTC
  $$
  SELECT net.http_post(
    url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/watchdog-wod-check',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- 5. Refresh cron_job_metadata so the admin Cron Manager shows the new schedule
DELETE FROM public.cron_job_metadata
WHERE job_name IN (
  'generate-workout-of-day',
  'generate-wod-daily',
  'generate-wod-bodyweight-daily',
  'generate-wod-equipment-daily',
  'backup-wod-generation',
  'watchdog-wod-check'
);

INSERT INTO public.cron_job_metadata
  (job_name, display_name, description, category, edge_function_name, request_body, is_critical, schedule, schedule_human_readable, is_active, timezone)
VALUES
  (
    'generate-wod-bodyweight-daily',
    'Generate WOD — Bodyweight',
    'Generates ONLY the Bodyweight Workout of the Day. Split from the equipment job to keep each Edge Function call well under the 150s timeout.',
    'content_generation',
    'generate-workout-of-day',
    '{"slot":"BODYWEIGHT","triggerSource":"cron-bodyweight","background":true}',
    true,
    '5 21 * * *',
    'Daily at 21:05 UTC (≈ 00:05 Cyprus summer / 23:05 winter) — Bodyweight slot',
    true,
    'UTC'
  ),
  (
    'generate-wod-equipment-daily',
    'Generate WOD — Equipment',
    'Generates ONLY the Equipment Workout of the Day, 20 minutes after the bodyweight job. Independent execution so a failure of one slot never blocks the other.',
    'content_generation',
    'generate-workout-of-day',
    '{"slot":"EQUIPMENT","triggerSource":"cron-equipment","background":true}',
    true,
    '25 21 * * *',
    'Daily at 21:25 UTC (≈ 00:25 Cyprus summer / 23:25 winter) — Equipment slot',
    true,
    'UTC'
  ),
  (
    'backup-wod-generation',
    'Backup WOD Generation',
    'Slot-aware safety net. Detects which of today''s WOD slots are missing and triggers fresh AI regeneration only for those. Does NOT switch to library mode.',
    'content_generation',
    'backup-wod-generation',
    '{}',
    true,
    '0 2 * * *',
    'Daily at 02:00 UTC (≈ 05:00 Cyprus summer / 04:00 winter)',
    true,
    'UTC'
  ),
  (
    'watchdog-wod-check',
    'WOD Watchdog Check',
    'Final slot-aware safety net, 15 minutes after backup. Re-checks today''s slots and triggers fresh regeneration of any still missing.',
    'WOD Generation',
    'watchdog-wod-check',
    '{}',
    true,
    '15 2 * * *',
    'Daily at 02:15 UTC (≈ 05:15 Cyprus summer / 04:15 winter)',
    true,
    'UTC'
  );
