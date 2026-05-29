-- =========================================================
-- Register & schedule the cron heartbeat
-- =========================================================

INSERT INTO public.cron_job_metadata
  (job_name, display_name, description, schedule, schedule_human_readable, category, edge_function_name, request_body, is_critical, is_active)
VALUES
  ('cron-heartbeat-hourly',
   'Cron Heartbeat (Watchdog)',
   'Runs hourly. Verifies every active cron job has run within its expected window. Emails admin the moment any critical job is overdue.',
   '0 * * * *',
   'Every hour at minute 0 — watches all crons and alerts admin if any are dead',
   'maintenance',
   'cron-heartbeat',
   '{"triggerSource": "cron-heartbeat-hourly"}'::jsonb,
   true, true)
ON CONFLICT (job_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  schedule = EXCLUDED.schedule,
  schedule_human_readable = EXCLUDED.schedule_human_readable,
  category = EXCLUDED.category,
  edge_function_name = EXCLUDED.edge_function_name,
  request_body = EXCLUDED.request_body,
  is_critical = EXCLUDED.is_critical,
  is_active = EXCLUDED.is_active,
  updated_at = now();

DO $$
DECLARE
  project_url constant text := 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
  anon_key constant text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno';
  cron_sql text;
BEGIN
  BEGIN
    PERFORM cron.unschedule('cron-heartbeat-hourly');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  cron_sql := format(
    $f$SELECT net.http_post(
        url:=%L,
        headers:=%L::jsonb,
        body:=%L::jsonb
      ) as request_id;$f$,
    project_url || '/functions/v1/cron-heartbeat',
    jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || anon_key)::text,
    '{"triggerSource":"cron-heartbeat-hourly"}'
  );

  PERFORM cron.schedule('cron-heartbeat-hourly', '0 * * * *', cron_sql);
END $$;

-- =========================================================
-- Backfill last_run_at so heartbeat doesn't false-alarm
-- on jobs that ARE running fine but never had tracking yet.
-- We derive the signal from existing tables.
-- =========================================================

-- WOD / health audit jobs — use system_health_audits + WOD tables
UPDATE public.cron_job_metadata m
SET last_run_at = sub.last_run, last_run_status = 'success'
FROM (
  SELECT MAX(audit_date) AS last_run FROM public.system_health_audits
) sub
WHERE m.job_name = 'wod-post-generation-audit' AND m.last_run_at IS NULL;

-- WOD generation/retry/library cron — use admin_workouts.generated_for_date
UPDATE public.cron_job_metadata m
SET last_run_at = sub.last_run, last_run_status = 'success'
FROM (
  SELECT MAX(created_at) AS last_run
  FROM public.admin_workouts
  WHERE is_workout_of_day = true
) sub
WHERE m.job_name IN (
  'wod-retry-pass-1','wod-retry-pass-2','wod-retry-pass-3','wod-retry-pass-4',
  'select-wod-bodyweight-daily','select-wod-equipment-daily',
  'preview-tomorrow-wod-evening','watchdog-wod-check','verify-wod-rollover',
  'archive-old-wods'
) AND m.last_run_at IS NULL;

-- Notification crons — use notification_audit_log
UPDATE public.cron_job_metadata m
SET last_run_at = sub.last_run, last_run_status = 'success'
FROM (
  SELECT MAX(sent_at) AS last_run FROM public.notification_audit_log
) sub
WHERE m.job_name IN (
  'send-automated-messages-job',
  'send-scheduled-notifications-job',
  'process-pending-notifications-job',
  'send-morning-notifications-job',
  'send-weekly-motivation-job',
  'send-checkin-reminders-morning',
  'send-checkin-reminders-night',
  'send-renewal-reminders-daily',
  'send-subscription-expired-notifications-job',
  'send-weekly-activity-report',
  'send-welcome-onboarding-daily',
  'send-reengagement-emails-weekly'
) AND m.last_run_at IS NULL;

-- Blog generation
UPDATE public.cron_job_metadata m
SET last_run_at = sub.last_run, last_run_status = 'success'
FROM (
  SELECT MAX(created_at) AS last_run FROM public.blog_articles
) sub
WHERE m.job_name = 'generate-weekly-blog-articles' AND m.last_run_at IS NULL;

-- Default: anything else we can't infer — assume it ran 'now' so the heartbeat
-- gives it one full interval before alerting. Better than false-positive flood.
UPDATE public.cron_job_metadata
SET last_run_at = now(), last_run_status = 'assumed-healthy'
WHERE is_active = true AND last_run_at IS NULL;
