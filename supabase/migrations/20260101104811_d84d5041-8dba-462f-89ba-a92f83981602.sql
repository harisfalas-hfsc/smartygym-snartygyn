-- Phase 2: Add generation_minute_utc to wod_auto_generation_config
ALTER TABLE wod_auto_generation_config 
ADD COLUMN IF NOT EXISTS generation_minute_utc integer NOT NULL DEFAULT 30;

-- Backfill existing row to match actual cron schedule (22:30 UTC)
UPDATE wod_auto_generation_config SET generation_minute_utc = 30;

-- Phase 5: Ensure archive-old-wods job exists in cron_job_metadata
INSERT INTO cron_job_metadata (
  job_name,
  display_name,
  description,
  schedule,
  schedule_human_readable,
  edge_function_name,
  is_active,
  is_critical,
  category,
  timezone
) VALUES (
  'archive-old-wods',
  'Archive Old WODs',
  'Archives yesterday''s WODs by setting is_workout_of_day to false. Runs before the morning notifications.',
  '0 4 * * *',
  'Daily at 04:00 UTC (06:00 Cyprus)',
  'archive-old-wods',
  true,
  false,
  'maintenance',
  'UTC'
) ON CONFLICT (job_name) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- Update the RPC function to accept minute parameter
CREATE OR REPLACE FUNCTION public.update_wod_cron_schedule(new_hour integer, new_minute integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- Validate hour (0-23) and minute (0-59)
  IF new_hour < 0 OR new_hour > 23 THEN
    RAISE EXCEPTION 'Hour must be between 0 and 23';
  END IF;
  
  IF new_minute < 0 OR new_minute > 59 THEN
    RAISE EXCEPTION 'Minute must be between 0 and 59';
  END IF;

  -- Build cron expression (run at specified hour and minute, every day)
  cron_expression := new_minute || ' ' || new_hour || ' * * *';

  -- Unschedule existing job if it exists
  PERFORM cron.unschedule('generate-workout-of-day')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-workout-of-day');

  -- Schedule new job with updated time
  PERFORM cron.schedule(
    'generate-workout-of-day',
    cron_expression,
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/generate-workout-of-day',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer %s"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
    $cron$, project_url, anon_key)
  );

  -- Update cron_job_metadata with new schedule
  UPDATE cron_job_metadata 
  SET schedule = cron_expression,
      schedule_human_readable = 'Daily at ' || lpad(new_hour::text, 2, '0') || ':' || lpad(new_minute::text, 2, '0') || ' UTC',
      updated_at = now()
  WHERE job_name = 'generate-workout-of-day';

  -- Update wod_auto_generation_config to match
  UPDATE wod_auto_generation_config
  SET generation_hour_utc = new_hour,
      generation_minute_utc = new_minute,
      updated_at = now();

  result := jsonb_build_object(
    'success', true,
    'new_hour', new_hour,
    'new_minute', new_minute,
    'cron_expression', cron_expression,
    'message', 'WOD generation time updated to ' || lpad(new_hour::text, 2, '0') || ':' || lpad(new_minute::text, 2, '0') || ' UTC'
  );

  RETURN result;
END;
$function$;