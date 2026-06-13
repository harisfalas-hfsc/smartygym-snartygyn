CREATE OR REPLACE FUNCTION public.get_cron_heartbeat_snapshot()
 RETURNS TABLE(job_name text, display_name text, registered_schedule text, live_schedule text, edge_function_name text, is_critical boolean, is_active boolean, metadata_last_run_at timestamp with time zone, metadata_last_run_status text, consecutive_failures integer, created_at timestamp with time zone, live_job_exists boolean, live_job_active boolean, scheduler_last_run_at timestamp with time zone, scheduler_last_status text, scheduler_last_message text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'cron'
 SET statement_timeout TO '25s'
AS $$
  WITH active_meta AS (
    SELECT * FROM public.cron_job_metadata WHERE is_active = true
  ),
  live_jobs AS (
    SELECT j.jobid, j.jobname, j.schedule, j.active
    FROM cron.job j
    JOIN active_meta m ON m.job_name = j.jobname
  ),
  recent_runs AS (
    SELECT DISTINCT ON (d.jobid)
      d.jobid,
      d.start_time,
      d.status,
      d.return_message
    FROM cron.job_run_details d
    JOIN live_jobs j ON j.jobid = d.jobid
    WHERE d.start_time > now() - interval '21 days'
    ORDER BY d.jobid, d.start_time DESC
  )
  SELECT
    m.job_name::text,
    m.display_name::text,
    m.schedule::text AS registered_schedule,
    j.schedule::text AS live_schedule,
    m.edge_function_name::text,
    m.is_critical::boolean,
    m.is_active::boolean,
    m.last_run_at AS metadata_last_run_at,
    m.last_run_status::text AS metadata_last_run_status,
    m.consecutive_failures::integer,
    m.created_at,
    (j.jobid IS NOT NULL) AS live_job_exists,
    COALESCE(j.active, false) AS live_job_active,
    r.start_time AS scheduler_last_run_at,
    r.status::text AS scheduler_last_status,
    r.return_message::text AS scheduler_last_message
  FROM active_meta m
  LEFT JOIN live_jobs j ON j.jobname = m.job_name
  LEFT JOIN recent_runs r ON r.jobid = j.jobid;
$$;

CREATE OR REPLACE FUNCTION public.sync_cron_metadata_from_live_scheduler()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'cron'
AS $$
DECLARE
  updated_count integer := 0;
BEGIN
  WITH live_jobs AS (
    SELECT j.jobid, j.jobname, j.schedule, j.active
    FROM cron.job j
    JOIN public.cron_job_metadata m ON m.job_name = j.jobname
    WHERE m.is_active = true
  ), latest_runs AS (
    SELECT DISTINCT ON (j.jobname)
      j.jobname,
      j.schedule,
      j.active,
      d.start_time,
      d.end_time,
      d.status
    FROM live_jobs j
    LEFT JOIN cron.job_run_details d ON d.jobid = j.jobid AND d.start_time > now() - interval '21 days'
    ORDER BY j.jobname, d.start_time DESC NULLS LAST
  ), updated AS (
    UPDATE public.cron_job_metadata m
    SET
      schedule = COALESCE(l.schedule, m.schedule),
      is_active = COALESCE(l.active, m.is_active),
      last_run_at = COALESCE(l.start_time, m.last_run_at),
      last_run_status = CASE
        WHEN l.status IS NULL THEN m.last_run_status
        WHEN lower(l.status::text) IN ('success', 'succeeded') THEN 'scheduler-succeeded'
        ELSE l.status::text
      END,
      last_run_duration_ms = CASE
        WHEN l.start_time IS NOT NULL AND l.end_time IS NOT NULL
          THEN GREATEST(0, EXTRACT(EPOCH FROM (l.end_time - l.start_time)) * 1000)::integer
        ELSE m.last_run_duration_ms
      END,
      consecutive_failures = CASE
        WHEN lower(COALESCE(l.status::text, '')) IN ('success', 'succeeded') THEN 0
        ELSE m.consecutive_failures
      END,
      updated_at = now()
    FROM latest_runs l
    WHERE m.job_name = l.jobname
      AND m.is_active = true
      AND (
        m.schedule IS DISTINCT FROM l.schedule
        OR m.is_active IS DISTINCT FROM l.active
        OR (l.start_time IS NOT NULL AND m.last_run_at IS DISTINCT FROM l.start_time)
        OR (l.status IS NOT NULL AND m.last_run_status IS DISTINCT FROM CASE WHEN lower(l.status::text) IN ('success', 'succeeded') THEN 'scheduler-succeeded' ELSE l.status::text END)
      )
    RETURNING 1
  )
  SELECT count(*) INTO updated_count FROM updated;

  RETURN updated_count;
END;
$$;

REVOKE ALL ON FUNCTION public.get_cron_heartbeat_snapshot() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.sync_cron_metadata_from_live_scheduler() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_cron_heartbeat_snapshot() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sync_cron_metadata_from_live_scheduler() TO authenticated, service_role;