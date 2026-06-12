-- Speed up get_cron_heartbeat_snapshot: it was scanning 8 days of cron.job_run_details
-- and timing out (statement_timeout). Narrow to 36 hours and cap the per-job lookup.

CREATE OR REPLACE FUNCTION public.get_cron_heartbeat_snapshot()
 RETURNS TABLE(job_name text, display_name text, registered_schedule text, live_schedule text, edge_function_name text, is_critical boolean, is_active boolean, metadata_last_run_at timestamp with time zone, metadata_last_run_status text, consecutive_failures integer, created_at timestamp with time zone, live_job_exists boolean, live_job_active boolean, scheduler_last_run_at timestamp with time zone, scheduler_last_status text, scheduler_last_message text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'cron'
 SET statement_timeout TO '25s'
AS $function$
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
    WHERE d.start_time > now() - interval '36 hours'
    ORDER BY d.jobid, d.start_time DESC
  )
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
    r.start_time AS scheduler_last_run_at,
    r.status AS scheduler_last_status,
    r.return_message AS scheduler_last_message
  FROM active_meta m
  LEFT JOIN live_jobs j ON j.jobname = m.job_name
  LEFT JOIN recent_runs r ON r.jobid = j.jobid;
$function$;