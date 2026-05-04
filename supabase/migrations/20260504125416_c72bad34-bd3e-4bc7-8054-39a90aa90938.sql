-- Schedule the morning WOD notification queueing job
-- Runs daily at 05:00 UTC (07:00 Cyprus) so users get their WOD ping when they wake up,
-- NOT at 00:00 Cyprus when everyone is asleep.

-- Unschedule first if it exists (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'queue-wod-notifications-morning') THEN
    PERFORM cron.unschedule('queue-wod-notifications-morning');
  END IF;
END $$;

SELECT cron.schedule(
  'queue-wod-notifications-morning',
  '0 5 * * *',
  $cron$
  SELECT net.http_post(
    url:='https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/queue-wod-notifications-morning',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $cron$
);

-- Register in admin Cron Jobs panel
INSERT INTO public.cron_job_metadata (
  job_name, schedule, schedule_human_readable, category, description,
  edge_function_name, request_body, is_critical, is_active, timezone
) VALUES (
  'queue-wod-notifications-morning',
  '0 5 * * *',
  'Daily at 05:00 UTC (07:00 Cyprus) — queues today''s WODs so dashboard + email pings deliver at wake-up time, not midnight',
  'notifications',
  'Queues today''s active Workouts of the Day into pending_content_notifications. The every-10-min drainer (send-new-content-notifications-job) then sends dashboard messages and emails to users at a humane hour.',
  'queue-wod-notifications-morning',
  '{}'::jsonb,
  false,
  true,
  'UTC'
)
ON CONFLICT (job_name) DO UPDATE SET
  schedule = EXCLUDED.schedule,
  schedule_human_readable = EXCLUDED.schedule_human_readable,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  edge_function_name = EXCLUDED.edge_function_name,
  request_body = EXCLUDED.request_body,
  is_active = true,
  updated_at = now();
