-- Fix linter WARN: Extension in Public
-- pg_net is currently installed in the public schema and does not support ALTER EXTENSION ... SET SCHEMA.
-- Safe fix: temporarily remove dependent triggers/functions, reinstall pg_net into the extensions schema, then recreate them.

BEGIN;

-- 1) Drop triggers that call the trigger function (we'll recreate them after reinstall)
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_created_welcome_email ON public.profiles;

-- 2) Drop functions that reference net.http_post so we can drop pg_net without CASCADE
DROP FUNCTION IF EXISTS public.trigger_welcome_email();
DROP FUNCTION IF EXISTS public.ensure_cron_jobs();
DROP FUNCTION IF EXISTS public.update_wod_cron_schedule(integer);

-- 3) Reinstall pg_net into the extensions schema
DROP EXTENSION IF EXISTS pg_net;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION pg_net WITH SCHEMA extensions;

-- 4) Recreate functions exactly as before
CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno'
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_cron_jobs()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_wod_cron_schedule(new_hour integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 5) Recreate triggers (as-is)
CREATE TRIGGER on_profile_created_send_welcome
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_welcome_email();

CREATE TRIGGER on_profile_created_welcome_email
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_welcome_email();

COMMIT;