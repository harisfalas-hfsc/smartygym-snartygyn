SELECT cron.unschedule('generate-workout-of-day')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-workout-of-day');

SELECT cron.schedule(
  'generate-workout-of-day',
  '30 22 * * *',
  $cron$
  SELECT net.http_post(
    url:='https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/generate-workout-of-day',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body:='{}'::jsonb,
    timeout_milliseconds:=900000
  ) as request_id;
  $cron$
);