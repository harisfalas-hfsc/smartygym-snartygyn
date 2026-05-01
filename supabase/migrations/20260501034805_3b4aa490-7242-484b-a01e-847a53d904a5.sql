
UPDATE public.wod_generation_runs
SET status = 'recovered',
    completed_at = now(),
    found_count = 2,
    wods_created = '["BODYWEIGHT","EQUIPMENT"]'::jsonb,
    error_message = COALESCE(error_message, '') || ' | Auto-closed: WODs restored via library-selection fallback after orchestrator/backup timeouts.'
WHERE cyprus_date = '2026-05-01'
  AND status = 'running';

SELECT cron.unschedule('backup-wod-generation')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'backup-wod-generation');

SELECT cron.schedule(
  'backup-wod-generation',
  '0 1 * * *',
  $cron$
  SELECT net.http_post(
    url:='https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/backup-wod-generation',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body:='{}'::jsonb,
    timeout_milliseconds:=840000
  ) as request_id;
  $cron$
);

SELECT cron.unschedule('watchdog-wod-check')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'watchdog-wod-check');

SELECT cron.schedule(
  'watchdog-wod-check',
  '5 1 * * *',
  $cron$
  SELECT net.http_post(
    url:='https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/watchdog-wod-check',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body:='{}'::jsonb,
    timeout_milliseconds:=840000
  ) as request_id;
  $cron$
);
