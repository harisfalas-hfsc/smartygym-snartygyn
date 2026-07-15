
-- Shared cron secret value (matches the CRON_INVOKE_SECRET edge-function env var)
DO $mig$
DECLARE
  cron_secret CONSTANT text := 'b3ESRCgWF72xY9VgB-t3F7OARelhjP5kUZHoHS8A_qeNcRQ88j9gYhc6xM4gouoB';
  j record;
  new_cmd text;
BEGIN
  -- 1. Patch every existing cron.job that posts to an edge function so it sends x-cron-secret
  FOR j IN SELECT jobid, jobname, command FROM cron.job WHERE command ILIKE '%net.http_post%' LOOP
    new_cmd := j.command;

    -- Skip if already patched
    IF new_cmd ILIKE '%x-cron-secret%' THEN
      CONTINUE;
    END IF;

    -- Inject the header just after the Content-Type entry in the JSON headers object.
    new_cmd := regexp_replace(
      new_cmd,
      '("Content-Type"\s*:\s*"application/json")',
      '\1, "x-cron-secret": "' || cron_secret || '"',
      'g'
    );

    PERFORM cron.alter_job(job_id := j.jobid, command := new_cmd);
  END LOOP;
END
$mig$;

-- 2. Rewrite trigger_welcome_email to send x-cron-secret
CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_confirmed boolean;
BEGIN
  SELECT (email_confirmed_at IS NOT NULL) INTO user_confirmed
  FROM auth.users
  WHERE id = NEW.user_id;

  IF user_confirmed = true THEN
    PERFORM net.http_post(
      url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', 'b3ESRCgWF72xY9VgB-t3F7OARelhjP5kUZHoHS8A_qeNcRQ88j9gYhc6xM4gouoB'
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
    UPDATE public.profiles SET welcome_sent = true WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 3. Rewrite trigger_welcome_email_on_confirm to send x-cron-secret
CREATE OR REPLACE FUNCTION public.trigger_welcome_email_on_confirm()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  already_sent boolean;
  profile_record record;
BEGIN
  IF (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
     AND NEW.email_confirmed_at IS NOT NULL THEN

    SELECT welcome_sent INTO already_sent
    FROM public.profiles
    WHERE user_id = NEW.id;

    IF already_sent IS NOT TRUE THEN
      SELECT * INTO profile_record FROM public.profiles WHERE user_id = NEW.id;

      PERFORM net.http_post(
        url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-welcome-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', 'b3ESRCgWF72xY9VgB-t3F7OARelhjP5kUZHoHS8A_qeNcRQ88j9gYhc6xM4gouoB'
        ),
        body := jsonb_build_object(
          'record', jsonb_build_object(
            'user_id', NEW.id,
            'full_name', COALESCE(profile_record.full_name, ''),
            'email', NEW.email
          )
        )
      );

      UPDATE public.profiles SET welcome_sent = true WHERE user_id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. Update ensure_cron_jobs so any future (re)scheduling includes the header
CREATE OR REPLACE FUNCTION public.ensure_cron_jobs()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb := '{"status": "success", "jobs_configured": []}'::jsonb;
  project_url text := 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
  cron_secret text := 'b3ESRCgWF72xY9VgB-t3F7OARelhjP5kUZHoHS8A_qeNcRQ88j9gYhc6xM4gouoB';
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can configure cron jobs';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-scheduled-notifications-job') THEN
    PERFORM cron.schedule(
      'send-scheduled-notifications-job',
      '*/10 * * * *',
      format($cron$
      SELECT net.http_post(
        url:='%s/functions/v1/send-scheduled-notifications',
        headers:='{"Content-Type": "application/json", "x-cron-secret": "%s"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
      $cron$, project_url, cron_secret)
    );
    result := jsonb_set(result, '{jobs_configured}', result->'jobs_configured' || '"send-scheduled-notifications-job"'::jsonb);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-renewal-reminders-daily') THEN
    PERFORM cron.schedule(
      'send-renewal-reminders-daily',
      '0 9 * * *',
      format($cron$
      SELECT net.http_post(
        url:='%s/functions/v1/send-renewal-reminders',
        headers:='{"Content-Type": "application/json", "x-cron-secret": "%s"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
      $cron$, project_url, cron_secret)
    );
    result := jsonb_set(result, '{jobs_configured}', result->'jobs_configured' || '"send-renewal-reminders-daily"'::jsonb);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-automated-messages-job') THEN
    PERFORM cron.schedule(
      'send-automated-messages-job',
      '*/10 * * * *',
      format($cron$
      SELECT net.http_post(
        url:='%s/functions/v1/send-automated-messages',
        headers:='{"Content-Type": "application/json", "x-cron-secret": "%s"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
      $cron$, project_url, cron_secret)
    );
    result := jsonb_set(result, '{jobs_configured}', result->'jobs_configured' || '"send-automated-messages-job"'::jsonb);
  END IF;

  RETURN result;
END;
$function$;
