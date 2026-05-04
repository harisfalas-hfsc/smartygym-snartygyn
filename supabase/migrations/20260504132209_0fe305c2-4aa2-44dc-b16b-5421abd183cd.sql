
-- 1. Notification dedupe table for WOD generation success/failure pings
CREATE TABLE IF NOT EXISTS public.wod_generation_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_date date NOT NULL,
  slot text NOT NULL CHECK (slot IN ('BODYWEIGHT','EQUIPMENT','VARIOUS','ALL')),
  status text NOT NULL CHECK (status IN ('success','failure')),
  attempt_source text,
  notified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(target_date, slot, status)
);

ALTER TABLE public.wod_generation_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view wod generation notifications"
  ON public.wod_generation_notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage wod generation notifications"
  ON public.wod_generation_notifications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Schedule 4 retry-pass crons (07:20, 07:50, 08:20, 08:50 UTC = 09:20–10:50 Cyprus winter, +1h summer)
DO $$
DECLARE
  project_url constant text := 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
  anon_key constant text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno';
  pass record;
BEGIN
  FOR pass IN
    SELECT * FROM (VALUES
      ('wod-retry-pass-1','20 7 * * *'),
      ('wod-retry-pass-2','50 7 * * *'),
      ('wod-retry-pass-3','20 8 * * *'),
      ('wod-retry-pass-4','50 8 * * *')
    ) AS t(jobname, sched)
  LOOP
    PERFORM cron.unschedule(pass.jobname) WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = pass.jobname);
    PERFORM cron.schedule(
      pass.jobname,
      pass.sched,
      format($cron$
      SELECT net.http_post(
        url:='%s/functions/v1/wod-generation-orchestrator',
        headers:='{"Content-Type":"application/json","Authorization":"Bearer %s"}'::jsonb,
        body:=jsonb_build_object(
          'triggerSource', '%s',
          'mode','generate',
          'retryMissing', true,
          'targetDate', to_char((now() AT TIME ZONE 'Europe/Nicosia')::date + 1, 'YYYY-MM-DD')
        )
      ) as request_id;
      $cron$, project_url, anon_key, pass.jobname)
    );
  END LOOP;

  -- 3. Post-generation audit at 07:30 UTC (09:30 Cyprus winter / 10:30 Cyprus summer)
  PERFORM cron.unschedule('wod-post-generation-audit') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'wod-post-generation-audit');
  PERFORM cron.schedule(
    'wod-post-generation-audit',
    '30 7 * * *',
    format($cron$
    SELECT net.http_post(
      url:='%s/functions/v1/run-system-health-audit',
      headers:='{"Content-Type":"application/json","Authorization":"Bearer %s"}'::jsonb,
      body:='{"sendEmail": true}'::jsonb
    ) as request_id;
    $cron$, project_url, anon_key)
  );
END $$;

-- 4. Cron metadata rows for admin panel visibility
INSERT INTO public.cron_job_metadata (job_name, display_name, description, schedule, schedule_human_readable, category, edge_function_name, is_critical, is_active)
VALUES
  ('wod-retry-pass-1','WOD Retry Pass 1','Retries any missing WOD slot for tomorrow if the 08:30/08:50 generation failed.','20 7 * * *','Daily at 07:20 UTC (≈ 09:20 Cyprus winter / 10:20 summer) — retries missing WODs for tomorrow','content_generation','wod-generation-orchestrator',false,true),
  ('wod-retry-pass-2','WOD Retry Pass 2','Second retry pass for missing WOD slots.','50 7 * * *','Daily at 07:50 UTC (≈ 09:50 Cyprus winter / 10:50 summer) — retries missing WODs for tomorrow','content_generation','wod-generation-orchestrator',false,true),
  ('wod-retry-pass-3','WOD Retry Pass 3','Third retry pass for missing WOD slots.','20 8 * * *','Daily at 08:20 UTC (≈ 10:20 Cyprus winter / 11:20 summer) — retries missing WODs for tomorrow','content_generation','wod-generation-orchestrator',false,true),
  ('wod-retry-pass-4','WOD Retry Pass 4 (final)','Final retry pass for missing WOD slots before the long-window safety net.','50 8 * * *','Daily at 08:50 UTC (≈ 10:50 Cyprus winter / 11:50 summer) — final retry for tomorrow''s WODs','content_generation','wod-generation-orchestrator',false,true),
  ('wod-post-generation-audit','WOD Post-Generation Audit','Verifies tomorrow''s WODs are built after the morning generation passes and emails admin success or failure.','30 7 * * *','Daily at 07:30 UTC (≈ 09:30 Cyprus winter / 10:30 summer) — verifies tomorrow''s WODs and emails admin','maintenance','run-system-health-audit',true,true)
ON CONFLICT (job_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  schedule = EXCLUDED.schedule,
  schedule_human_readable = EXCLUDED.schedule_human_readable,
  category = EXCLUDED.category,
  edge_function_name = EXCLUDED.edge_function_name,
  is_critical = EXCLUDED.is_critical,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 5. Rename watchdog display name to "WOD Watchdog"
UPDATE public.cron_job_metadata
SET display_name = 'WOD Watchdog',
    description = 'Verify-only safety net that confirms today''s WODs exist; re-kicks Stripe linking and image generation if assets are missing.',
    updated_at = now()
WHERE job_name = 'watchdog-wod-check';
