-- =========================================================
-- Step A + foundation of Step C: restore missing crons,
-- add run-history tracking, lifecycle trigger.
-- =========================================================

-- 1. Add tracking columns to cron_job_metadata (idempotent)
ALTER TABLE public.cron_job_metadata
  ADD COLUMN IF NOT EXISTS last_run_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_run_status text,
  ADD COLUMN IF NOT EXISTS last_run_duration_ms integer,
  ADD COLUMN IF NOT EXISTS consecutive_failures integer NOT NULL DEFAULT 0;

-- 2. Create cron_job_runs history table
CREATE TABLE IF NOT EXISTS public.cron_job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  duration_ms integer,
  status text NOT NULL DEFAULT 'started',
  error_message text,
  http_status integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cron_job_runs TO authenticated;
GRANT ALL ON public.cron_job_runs TO service_role;

ALTER TABLE public.cron_job_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view cron job runs" ON public.cron_job_runs;
CREATE POLICY "Admins can view cron job runs"
  ON public.cron_job_runs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Service role can insert cron job runs" ON public.cron_job_runs;
CREATE POLICY "Service role can insert cron job runs"
  ON public.cron_job_runs FOR INSERT
  WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

CREATE INDEX IF NOT EXISTS idx_cron_job_runs_job_name_started_at
  ON public.cron_job_runs (job_name, started_at DESC);

-- 3. Lifecycle trigger: deleting a metadata row also unschedules the cron
CREATE OR REPLACE FUNCTION public.unschedule_cron_on_metadata_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  BEGIN
    PERFORM cron.unschedule(OLD.job_name);
  EXCEPTION WHEN OTHERS THEN
    -- ignore "job not found" errors; we just want to keep things in sync
    NULL;
  END;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS cron_metadata_delete_unschedule
  ON public.cron_job_metadata;
CREATE TRIGGER cron_metadata_delete_unschedule
  AFTER DELETE ON public.cron_job_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.unschedule_cron_on_metadata_delete();

-- 4. Restore missing cron metadata rows
INSERT INTO public.cron_job_metadata
  (job_name, display_name, description, schedule, schedule_human_readable, category, edge_function_name, request_body, is_critical, is_active)
VALUES
  ('wod-post-generation-audit',
   'System Health Audit (Daily)',
   'Runs the full system health audit and emails the admin a report. Fires after the WOD retry passes finish.',
   '0 9 * * *',
   'Daily at 09:00 UTC (≈ 11:00 Cyprus winter / 12:00 summer) — runs full audit and emails admin',
   'maintenance',
   'run-system-health-audit',
   '{"sendEmail": true, "triggerSource": "cron-daily-audit"}'::jsonb,
   true, true),

  ('wod-retry-pass-1',
   'WOD Retry Pass 1',
   'Retries any missing WOD slot for tomorrow.',
   '20 7 * * *',
   'Daily at 07:20 UTC — first retry for missing WODs',
   'content_generation',
   'wod-generation-orchestrator',
   '{"triggerSource": "cron-retry-1", "retryMissing": true}'::jsonb,
   false, true),

  ('wod-retry-pass-2',
   'WOD Retry Pass 2',
   'Second retry pass for missing WOD slots.',
   '50 7 * * *',
   'Daily at 07:50 UTC — second retry for missing WODs',
   'content_generation',
   'wod-generation-orchestrator',
   '{"triggerSource": "cron-retry-2", "retryMissing": true}'::jsonb,
   false, true),

  ('wod-retry-pass-3',
   'WOD Retry Pass 3',
   'Third retry pass for missing WOD slots.',
   '20 8 * * *',
   'Daily at 08:20 UTC — third retry for missing WODs',
   'content_generation',
   'wod-generation-orchestrator',
   '{"triggerSource": "cron-retry-3", "retryMissing": true}'::jsonb,
   false, true),

  ('wod-retry-pass-4',
   'WOD Retry Pass 4 (final)',
   'Final retry pass for missing WOD slots before the long-window safety net.',
   '50 8 * * *',
   'Daily at 08:50 UTC — final retry for missing WODs',
   'content_generation',
   'wod-generation-orchestrator',
   '{"triggerSource": "cron-retry-4", "retryMissing": true, "finalAttempt": true}'::jsonb,
   false, true),

  ('refresh-sitemap-ping-daily',
   'Refresh Sitemap & Ping Search Engines',
   'Resubmits the sitemap to Google (Search Console API) and notifies Bing/Yandex via IndexNow.',
   '15 2 * * *',
   'Daily at 02:15 UTC — resubmits sitemap to search engines',
   'seo',
   'refresh-sitemap-ping',
   '{"triggerSource": "cron-sitemap-daily"}'::jsonb,
   false, true),

  ('send-automated-messages-job',
   'Send Automated Messages',
   'Processes and sends scheduled automated messages (dashboard notifications and emails) to users.',
   '*/10 * * * *',
   'Every 10 minutes',
   'notifications',
   'send-automated-messages',
   '{}'::jsonb,
   true, true)

ON CONFLICT (job_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  schedule = EXCLUDED.schedule,
  schedule_human_readable = EXCLUDED.schedule_human_readable,
  category = EXCLUDED.category,
  edge_function_name = EXCLUDED.edge_function_name,
  request_body = EXCLUDED.request_body,
  is_critical = EXCLUDED.is_critical,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 5. Re-register the missing jobs in pg_cron
DO $$
DECLARE
  project_url constant text := 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
  anon_key constant text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno';
  rec record;
  cron_sql text;
BEGIN
  FOR rec IN
    SELECT job_name, schedule, edge_function_name, COALESCE(request_body, '{}'::jsonb) AS request_body
    FROM public.cron_job_metadata
    WHERE job_name IN (
      'wod-post-generation-audit',
      'wod-retry-pass-1','wod-retry-pass-2','wod-retry-pass-3','wod-retry-pass-4',
      'refresh-sitemap-ping-daily',
      'send-automated-messages-job'
    )
  LOOP
    -- drop any stale schedule (ignore errors)
    BEGIN
      PERFORM cron.unschedule(rec.job_name);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    cron_sql := format(
      $f$SELECT net.http_post(
          url:=%L,
          headers:=%L::jsonb,
          body:=%L::jsonb
        ) as request_id;$f$,
      project_url || '/functions/v1/' || rec.edge_function_name,
      jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || anon_key)::text,
      rec.request_body::text
    );

    PERFORM cron.schedule(rec.job_name, rec.schedule, cron_sql);
  END LOOP;
END $$;
