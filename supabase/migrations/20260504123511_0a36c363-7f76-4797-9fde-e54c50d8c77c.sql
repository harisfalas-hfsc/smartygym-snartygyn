
-- 1. Reschedule the 3 cron jobs to new times, building TOMORROW's WODs
DO $$
DECLARE
  project_url text := 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno';
BEGIN
  -- Unschedule existing jobs if present
  PERFORM cron.unschedule('generate-wod-bodyweight-daily')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-wod-bodyweight-daily');
  PERFORM cron.unschedule('generate-wod-equipment-daily')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-wod-equipment-daily');
  PERFORM cron.unschedule('archive-old-wods')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'archive-old-wods');

  -- Bodyweight: 06:30 UTC, generates TOMORROW (Cyprus)
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

  -- Equipment: 06:50 UTC, generates TOMORROW (Cyprus)
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

  -- Archive: 21:00 UTC = 00:00 Cyprus
  PERFORM cron.schedule(
    'archive-old-wods',
    '0 21 * * *',
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/archive-old-wods',
      headers:='{"Content-Type":"application/json","Authorization":"Bearer %s"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
    $cron$, project_url, anon_key)
  );
END $$;

-- 2. Sync cron_job_metadata
UPDATE public.cron_job_metadata SET
  schedule = '30 6 * * *',
  schedule_human_readable = 'Daily at 06:30 UTC (≈ 09:30 Cyprus summer / 08:30 winter) — Bodyweight slot, builds TOMORROW',
  updated_at = now()
WHERE job_name = 'generate-wod-bodyweight-daily';

UPDATE public.cron_job_metadata SET
  schedule = '50 6 * * *',
  schedule_human_readable = 'Daily at 06:50 UTC (≈ 09:50 Cyprus summer / 08:50 winter) — Equipment slot, builds TOMORROW',
  updated_at = now()
WHERE job_name = 'generate-wod-equipment-daily';

UPDATE public.cron_job_metadata SET
  schedule = '0 21 * * *',
  schedule_human_readable = 'Daily at 21:00 UTC (00:00 Cyprus) — archives yesterday at midnight, tomorrow''s pre-built WODs become today',
  updated_at = now()
WHERE job_name = 'archive-old-wods';

-- 3. Sync wod_auto_generation_config
UPDATE public.wod_auto_generation_config
SET generation_hour_utc = 6,
    generation_minute_utc = 30,
    updated_at = now();

-- 4. Rewrite update_wod_cron_schedule RPC to manage BOTH split jobs (bodyweight + equipment 20 min later)
CREATE OR REPLACE FUNCTION public.update_wod_cron_schedule(new_hour integer, new_minute integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
DECLARE
  result jsonb;
  bw_minute int;
  eq_minute int;
  bw_hour int;
  eq_hour int;
  bw_expr text;
  eq_expr text;
  project_url text := 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno';
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can update cron schedule';
  END IF;
  IF new_hour < 0 OR new_hour > 23 THEN RAISE EXCEPTION 'Hour must be 0-23'; END IF;
  IF new_minute < 0 OR new_minute > 59 THEN RAISE EXCEPTION 'Minute must be 0-59'; END IF;

  -- Bodyweight at chosen time, equipment 20 minutes later (carry hour if needed)
  bw_hour := new_hour;
  bw_minute := new_minute;
  eq_minute := (new_minute + 20) % 60;
  eq_hour := (new_hour + ((new_minute + 20) / 60)) % 24;

  bw_expr := bw_minute || ' ' || bw_hour || ' * * *';
  eq_expr := eq_minute || ' ' || eq_hour || ' * * *';

  -- Reschedule bodyweight
  PERFORM cron.unschedule('generate-wod-bodyweight-daily')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-wod-bodyweight-daily');
  PERFORM cron.schedule(
    'generate-wod-bodyweight-daily',
    bw_expr,
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

  -- Reschedule equipment
  PERFORM cron.unschedule('generate-wod-equipment-daily')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-wod-equipment-daily');
  PERFORM cron.schedule(
    'generate-wod-equipment-daily',
    eq_expr,
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

  -- Sync metadata
  UPDATE cron_job_metadata SET
    schedule = bw_expr,
    schedule_human_readable = 'Daily at ' || lpad(bw_hour::text,2,'0') || ':' || lpad(bw_minute::text,2,'0') || ' UTC — Bodyweight slot, builds TOMORROW',
    updated_at = now()
  WHERE job_name = 'generate-wod-bodyweight-daily';

  UPDATE cron_job_metadata SET
    schedule = eq_expr,
    schedule_human_readable = 'Daily at ' || lpad(eq_hour::text,2,'0') || ':' || lpad(eq_minute::text,2,'0') || ' UTC — Equipment slot, builds TOMORROW',
    updated_at = now()
  WHERE job_name = 'generate-wod-equipment-daily';

  -- Sync config to bodyweight time
  UPDATE wod_auto_generation_config
  SET generation_hour_utc = bw_hour,
      generation_minute_utc = bw_minute,
      updated_at = now();

  result := jsonb_build_object(
    'success', true,
    'bodyweight', bw_expr,
    'equipment', eq_expr,
    'message', 'WOD generation rescheduled: BW ' || bw_expr || ' / EQ ' || eq_expr || ' (UTC, builds tomorrow)'
  );
  RETURN result;
END;
$func$;
