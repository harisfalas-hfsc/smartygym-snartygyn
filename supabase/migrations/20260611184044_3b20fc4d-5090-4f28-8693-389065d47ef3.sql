DO $$
DECLARE
  svc_key text;
  blog_jobid bigint;
BEGIN
  -- Extract the service-role key already used by the secured expire-admin-subscriptions cron job
  SELECT substring(command from 'Bearer ([A-Za-z0-9_\-\.]+)')
    INTO svc_key
  FROM cron.job
  WHERE jobname = 'expire-admin-subscriptions'
  LIMIT 1;

  IF svc_key IS NULL OR position('InNlcnZpY2Vfcm9sZSI' in svc_key) = 0 THEN
    RAISE EXCEPTION 'Could not locate service role key from existing cron job; aborting safely';
  END IF;

  -- 1) Re-point the weekly blog cron job to authenticate with the service-role key
  SELECT jobid INTO blog_jobid FROM cron.job WHERE jobname = 'generate-weekly-blog-articles' LIMIT 1;
  IF blog_jobid IS NOT NULL THEN
    PERFORM cron.alter_job(
      blog_jobid,
      command := format($cmd$
  SELECT net.http_post(
    url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/generate-weekly-blog-articles',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer %s'),
    body := '{}'::jsonb
  );
$cmd$, svc_key)
    );
  END IF;

  -- 2) Recreate the two image-repair trigger functions to authenticate with the service-role key
  EXECUTE format($fn$
CREATE OR REPLACE FUNCTION public.queue_image_repair_if_needed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $body$
BEGIN
  IF NEW.image_url IS NULL OR NEW.image_url = '' THEN
    PERFORM net.http_post(
      url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/auto-generate-workout-image',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer %s'
      ),
      body := jsonb_build_object('workout_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$body$
$fn$, svc_key);

  EXECUTE format($fn$
CREATE OR REPLACE FUNCTION public.trigger_auto_generate_workout_image()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $body$
BEGIN
  IF NEW.image_url IS NULL AND (NEW.is_workout_of_day IS NULL OR NEW.is_workout_of_day = false) THEN
    PERFORM net.http_post(
      url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/auto-generate-workout-image',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer %s'
      ),
      body := jsonb_build_object('workout_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$body$
$fn$, svc_key);
END $$;