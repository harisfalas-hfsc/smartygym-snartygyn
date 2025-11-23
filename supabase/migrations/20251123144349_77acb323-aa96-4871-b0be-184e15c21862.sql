-- Schedule the send-automated-messages cron job to run every 10 minutes
-- First, unschedule if it already exists (idempotent)
SELECT cron.unschedule('send-automated-messages-job')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-automated-messages-job'
);

-- Schedule the job
SELECT cron.schedule(
  'send-automated-messages-job',
  '*/10 * * * *',  -- Every 10 minutes
  $$
  SELECT net.http_post(
    url:='https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-automated-messages',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);