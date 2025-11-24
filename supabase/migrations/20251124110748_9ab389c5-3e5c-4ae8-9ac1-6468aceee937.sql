-- Phase 1: Add motivational_weekly message type
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'motivational_weekly';

-- Phase 2: Update renewal reminder cron job to 10 AM UTC
-- Delete old cron job and recreate with new schedule
SELECT cron.unschedule('send-renewal-reminders-daily');

SELECT cron.schedule(
  'send-renewal-reminders-daily',
  '0 10 * * *', -- 10 AM UTC instead of 9 AM
  $$
  SELECT net.http_post(
    url:='https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-renewal-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Phase 3: Create weekly motivation cron job (every Monday at 10 AM UTC)
SELECT cron.schedule(
  'send-weekly-motivation-job',
  '0 10 * * 1', -- Every Monday at 10 AM UTC
  $$
  SELECT net.http_post(
    url:='https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-weekly-motivation',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);