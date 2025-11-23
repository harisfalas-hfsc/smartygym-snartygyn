-- Create function to ensure all critical cron jobs are properly configured
-- Using $func$ as outer delimiter and single quotes for inner SQL
CREATE OR REPLACE FUNCTION public.ensure_cron_jobs()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  result jsonb := '{"status": "success", "jobs_configured": []}'::jsonb;
  project_url text := 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno';
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can configure cron jobs';
  END IF;

  -- Job 1: send-scheduled-notifications (every 10 minutes)
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-scheduled-notifications-job') THEN
    PERFORM cron.schedule(
      'send-scheduled-notifications-job',
      '*/10 * * * *',
      format($cron$
      SELECT net.http_post(
        url:='%s/functions/v1/send-scheduled-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer %s"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
      $cron$, project_url, anon_key)
    );
    result := jsonb_set(result, '{jobs_configured}', result->'jobs_configured' || '"send-scheduled-notifications-job"'::jsonb);
  END IF;

  -- Job 2: send-renewal-reminders (daily at 9 AM)
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-renewal-reminders-daily') THEN
    PERFORM cron.schedule(
      'send-renewal-reminders-daily',
      '0 9 * * *',
      format($cron$
      SELECT net.http_post(
        url:='%s/functions/v1/send-renewal-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer %s"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
      $cron$, project_url, anon_key)
    );
    result := jsonb_set(result, '{jobs_configured}', result->'jobs_configured' || '"send-renewal-reminders-daily"'::jsonb);
  END IF;

  -- Job 3: send-automated-messages (every 10 minutes)
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-automated-messages-job') THEN
    PERFORM cron.schedule(
      'send-automated-messages-job',
      '*/10 * * * *',
      format($cron$
      SELECT net.http_post(
        url:='%s/functions/v1/send-automated-messages',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer %s"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
      $cron$, project_url, anon_key)
    );
    result := jsonb_set(result, '{jobs_configured}', result->'jobs_configured' || '"send-automated-messages-job"'::jsonb);
  END IF;

  RETURN result;
END;
$func$;