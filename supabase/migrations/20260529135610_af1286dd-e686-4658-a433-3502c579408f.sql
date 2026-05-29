DO $$ BEGIN
  PERFORM cron.unschedule('cron-heartbeat-hourly');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'cron-heartbeat-hourly',
  '0 12 * * *',
  $cron$
  SELECT net.http_post(
    url:='https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/cron-heartbeat',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno"}'::jsonb,
    body:='{}'::jsonb
  );
  $cron$
);

UPDATE public.cron_job_metadata
SET schedule = '0 12 * * *',
    display_name = 'Daily 24h Cron Report (12:00 UTC)',
    description = 'Sends one daily email at 12:00 UTC summarizing the last 24h of all cron jobs: healthy, failed, and overdue.'
WHERE job_name = 'cron-heartbeat-hourly';