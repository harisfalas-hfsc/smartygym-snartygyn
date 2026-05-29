CREATE OR REPLACE FUNCTION public.get_cron_heartbeat_snapshot()
RETURNS TABLE (
  job_name text,
  display_name text,
  registered_schedule text,
  live_schedule text,
  edge_function_name text,
  is_critical boolean,
  is_active boolean,
  metadata_last_run_at timestamptz,
  metadata_last_run_status text,
  consecutive_failures integer,
  created_at timestamptz,
  live_job_exists boolean,
  live_job_active boolean,
  scheduler_last_run_at timestamptz,
  scheduler_last_status text,
  scheduler_last_message text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, cron
AS $$
  SELECT
    m.job_name,
    m.display_name,
    m.schedule AS registered_schedule,
    j.schedule AS live_schedule,
    m.edge_function_name,
    m.is_critical,
    m.is_active,
    m.last_run_at AS metadata_last_run_at,
    m.last_run_status AS metadata_last_run_status,
    m.consecutive_failures,
    m.created_at,
    (j.jobid IS NOT NULL) AS live_job_exists,
    COALESCE(j.active, false) AS live_job_active,
    d.start_time AS scheduler_last_run_at,
    d.status AS scheduler_last_status,
    d.return_message AS scheduler_last_message
  FROM public.cron_job_metadata m
  LEFT JOIN cron.job j
    ON j.jobname = m.job_name
  LEFT JOIN LATERAL (
    SELECT start_time, status, return_message
    FROM cron.job_run_details
    WHERE jobid = j.jobid
    ORDER BY start_time DESC
    LIMIT 1
  ) d ON true
  WHERE m.is_active = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_cron_heartbeat_snapshot() TO service_role;

CREATE OR REPLACE FUNCTION public.sync_cron_metadata_from_live_scheduler()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.cron_job_metadata m
  SET
    schedule = COALESCE(j.schedule, m.schedule),
    last_run_at = COALESCE(d.start_time, m.last_run_at),
    last_run_status = CASE
      WHEN d.status = 'succeeded' THEN 'scheduler-succeeded'
      WHEN d.status IS NOT NULL THEN d.status
      ELSE m.last_run_status
    END,
    consecutive_failures = CASE
      WHEN d.status = 'succeeded' THEN 0
      WHEN d.status IS NOT NULL AND d.status <> 'succeeded' THEN m.consecutive_failures + 1
      ELSE m.consecutive_failures
    END,
    updated_at = now()
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT start_time, status
    FROM cron.job_run_details
    WHERE jobid = j.jobid
    ORDER BY start_time DESC
    LIMIT 1
  ) d ON true
  WHERE j.jobname = m.job_name
    AND m.is_active = true
    AND (
      m.schedule IS DISTINCT FROM j.schedule
      OR (d.start_time IS NOT NULL AND (m.last_run_at IS NULL OR d.start_time > m.last_run_at))
      OR (d.status IS NOT NULL AND m.last_run_status IS DISTINCT FROM CASE WHEN d.status = 'succeeded' THEN 'scheduler-succeeded' ELSE d.status END)
    );

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_cron_metadata_from_live_scheduler() TO service_role;