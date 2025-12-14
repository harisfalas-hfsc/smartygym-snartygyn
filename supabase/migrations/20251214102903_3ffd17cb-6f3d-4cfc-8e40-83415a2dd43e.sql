-- Create function to update WOD cron schedule (admin only)
CREATE OR REPLACE FUNCTION public.update_wod_cron_schedule(new_hour integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  cron_expression text;
  project_url text := 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno';
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can update cron schedule';
  END IF;

  -- Validate hour (0-23)
  IF new_hour < 0 OR new_hour > 23 THEN
    RAISE EXCEPTION 'Hour must be between 0 and 23';
  END IF;

  -- Build cron expression (run at specified hour, minute 0, every day)
  cron_expression := '0 ' || new_hour || ' * * *';

  -- Unschedule existing job if it exists
  PERFORM cron.unschedule('generate-wod-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-wod-daily');

  -- Schedule new job with updated time
  PERFORM cron.schedule(
    'generate-wod-daily',
    cron_expression,
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/generate-workout-of-day',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer %s"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
    $cron$, project_url, anon_key)
  );

  result := jsonb_build_object(
    'success', true,
    'new_hour', new_hour,
    'cron_expression', cron_expression,
    'message', 'WOD generation time updated to ' || new_hour || ':00 UTC'
  );

  RETURN result;
END;
$$;