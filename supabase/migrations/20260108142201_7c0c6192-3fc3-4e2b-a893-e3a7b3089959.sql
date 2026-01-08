
-- Unschedule the old job with wrong email
SELECT cron.unschedule('daily-system-health-audit-after-generation');

-- Recreate with correct body (no adminEmail - function will resolve from system_settings)
SELECT cron.schedule(
  'daily-system-health-audit-after-generation',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url:='https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/run-system-health-audit',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body:='{"sendEmail": true}'::jsonb
  ) as request_id;
  $$
);
