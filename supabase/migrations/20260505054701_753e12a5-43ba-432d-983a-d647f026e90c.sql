
-- Re-register the 7 silently-dead WOD cron jobs.
-- Pattern matches the proven update_wod_cron_schedule() function.

DO $$
DECLARE
  project_url text := 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno';
BEGIN
  -- Drop existing (silently-dead) jobs
  PERFORM cron.unschedule('generate-wod-bodyweight-daily') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-wod-bodyweight-daily');
  PERFORM cron.unschedule('generate-wod-equipment-daily')  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-wod-equipment-daily');
  PERFORM cron.unschedule('wod-retry-pass-1')              WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'wod-retry-pass-1');
  PERFORM cron.unschedule('wod-retry-pass-2')              WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'wod-retry-pass-2');
  PERFORM cron.unschedule('wod-retry-pass-3')              WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'wod-retry-pass-3');
  PERFORM cron.unschedule('wod-retry-pass-4')              WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'wod-retry-pass-4');
  PERFORM cron.unschedule('wod-post-generation-audit')     WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'wod-post-generation-audit');

  -- Bodyweight slot — 06:30 UTC
  PERFORM cron.schedule(
    'generate-wod-bodyweight-daily',
    '30 6 * * *',
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/wod-generation-orchestrator',
      headers:='{"Content-Type":"application/json","Authorization":"Bearer %s"}'::jsonb,
      body:=jsonb_build_object(
        'triggerSource','cron-bodyweight',
        'slot','BODYWEIGHT',
        'targetDate', to_char((now() AT TIME ZONE 'Europe/Nicosia')::date + 1, 'YYYY-MM-DD')
      )
    ) as request_id;
    $cron$, project_url, anon_key)
  );

  -- Equipment slot — 06:50 UTC
  PERFORM cron.schedule(
    'generate-wod-equipment-daily',
    '50 6 * * *',
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/wod-generation-orchestrator',
      headers:='{"Content-Type":"application/json","Authorization":"Bearer %s"}'::jsonb,
      body:=jsonb_build_object(
        'triggerSource','cron-equipment',
        'slot','EQUIPMENT',
        'targetDate', to_char((now() AT TIME ZONE 'Europe/Nicosia')::date + 1, 'YYYY-MM-DD')
      )
    ) as request_id;
    $cron$, project_url, anon_key)
  );

  -- Retry passes (re-fire orchestrator with retryMissing flag)
  PERFORM cron.schedule(
    'wod-retry-pass-1', '20 7 * * *',
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/wod-generation-orchestrator',
      headers:='{"Content-Type":"application/json","Authorization":"Bearer %s"}'::jsonb,
      body:=jsonb_build_object(
        'triggerSource','cron-retry-1',
        'retryMissing', true,
        'targetDate', to_char((now() AT TIME ZONE 'Europe/Nicosia')::date + 1, 'YYYY-MM-DD')
      )
    ) as request_id;
    $cron$, project_url, anon_key)
  );

  PERFORM cron.schedule(
    'wod-retry-pass-2', '50 7 * * *',
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/wod-generation-orchestrator',
      headers:='{"Content-Type":"application/json","Authorization":"Bearer %s"}'::jsonb,
      body:=jsonb_build_object(
        'triggerSource','cron-retry-2',
        'retryMissing', true,
        'targetDate', to_char((now() AT TIME ZONE 'Europe/Nicosia')::date + 1, 'YYYY-MM-DD')
      )
    ) as request_id;
    $cron$, project_url, anon_key)
  );

  PERFORM cron.schedule(
    'wod-retry-pass-3', '20 8 * * *',
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/wod-generation-orchestrator',
      headers:='{"Content-Type":"application/json","Authorization":"Bearer %s"}'::jsonb,
      body:=jsonb_build_object(
        'triggerSource','cron-retry-3',
        'retryMissing', true,
        'targetDate', to_char((now() AT TIME ZONE 'Europe/Nicosia')::date + 1, 'YYYY-MM-DD')
      )
    ) as request_id;
    $cron$, project_url, anon_key)
  );

  PERFORM cron.schedule(
    'wod-retry-pass-4', '50 8 * * *',
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/wod-generation-orchestrator',
      headers:='{"Content-Type":"application/json","Authorization":"Bearer %s"}'::jsonb,
      body:=jsonb_build_object(
        'triggerSource','cron-retry-4',
        'retryMissing', true,
        'finalAttempt', true,
        'targetDate', to_char((now() AT TIME ZONE 'Europe/Nicosia')::date + 1, 'YYYY-MM-DD')
      )
    ) as request_id;
    $cron$, project_url, anon_key)
  );

  -- Post-generation audit — 07:30 UTC (sends success/failure email)
  PERFORM cron.schedule(
    'wod-post-generation-audit', '30 7 * * *',
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/run-system-health-audit',
      headers:='{"Content-Type":"application/json","Authorization":"Bearer %s"}'::jsonb,
      body:=jsonb_build_object('sendEmail', true, 'triggerSource', 'cron-post-gen-audit')
    ) as request_id;
    $cron$, project_url, anon_key)
  );
END $$;
