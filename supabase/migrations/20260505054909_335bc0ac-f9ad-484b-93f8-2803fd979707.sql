CREATE OR REPLACE FUNCTION public.heal_wod_crons()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_url text := 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno';
  rec record;
  healed text[] := ARRAY[]::text[];
  job_def jsonb := jsonb_build_object(
    'generate-wod-bodyweight-daily', jsonb_build_object(
      'schedule','30 6 * * *',
      'function','wod-generation-orchestrator',
      'body', jsonb_build_object('triggerSource','cron-bodyweight','slot','BODYWEIGHT')
    ),
    'generate-wod-equipment-daily', jsonb_build_object(
      'schedule','50 6 * * *',
      'function','wod-generation-orchestrator',
      'body', jsonb_build_object('triggerSource','cron-equipment','slot','EQUIPMENT')
    ),
    'wod-retry-pass-1', jsonb_build_object(
      'schedule','20 7 * * *','function','wod-generation-orchestrator',
      'body', jsonb_build_object('triggerSource','cron-retry-1','retryMissing',true)
    ),
    'wod-retry-pass-2', jsonb_build_object(
      'schedule','50 7 * * *','function','wod-generation-orchestrator',
      'body', jsonb_build_object('triggerSource','cron-retry-2','retryMissing',true)
    ),
    'wod-retry-pass-3', jsonb_build_object(
      'schedule','20 8 * * *','function','wod-generation-orchestrator',
      'body', jsonb_build_object('triggerSource','cron-retry-3','retryMissing',true)
    ),
    'wod-retry-pass-4', jsonb_build_object(
      'schedule','50 8 * * *','function','wod-generation-orchestrator',
      'body', jsonb_build_object('triggerSource','cron-retry-4','retryMissing',true,'finalAttempt',true)
    ),
    'wod-post-generation-audit', jsonb_build_object(
      'schedule','30 7 * * *','function','run-system-health-audit',
      'body', jsonb_build_object('sendEmail',true,'triggerSource','cron-post-gen-audit')
    )
  );
  body_with_date jsonb;
  cron_sql text;
BEGIN
  FOR rec IN
    SELECT j.jobname
    FROM cron.job j
    WHERE j.jobname = ANY (ARRAY[
      'generate-wod-bodyweight-daily','generate-wod-equipment-daily',
      'wod-retry-pass-1','wod-retry-pass-2','wod-retry-pass-3','wod-retry-pass-4',
      'wod-post-generation-audit'
    ])
    AND NOT EXISTS (
      SELECT 1 FROM cron.job_run_details d
      WHERE d.jobid = j.jobid
        AND d.start_time > now() - interval '24 hours'
    )
  LOOP
    -- drop the dead one
    PERFORM cron.unschedule(rec.jobname);

    -- re-register with the canonical definition
    body_with_date := (job_def -> rec.jobname -> 'body')
      || jsonb_build_object('targetDate', to_char((now() AT TIME ZONE 'Europe/Nicosia')::date + 1, 'YYYY-MM-DD'));

    cron_sql := format(
      $f$SELECT net.http_post(
          url:=%L,
          headers:=%L::jsonb,
          body:=%L::jsonb
        ) as request_id;$f$,
      project_url || '/functions/v1/' || (job_def -> rec.jobname ->> 'function'),
      jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || anon_key)::text,
      body_with_date::text
    );

    PERFORM cron.schedule(rec.jobname, job_def -> rec.jobname ->> 'schedule', cron_sql);
    healed := healed || rec.jobname;
  END LOOP;

  RETURN jsonb_build_object('healed_count', array_length(healed, 1), 'healed_jobs', to_jsonb(healed));
END;
$$;