-- Fix Cron Jobs Manager admin UI red status.
-- 1) Allow authenticated admins to call pg_cron_enabled() from the browser.
-- 2) Allow get_cron_jobs() to return data when called by service_role
--    (manage-cron-jobs edge function uses service_role and currently sees
--    an exception because auth.uid() is null in that context, making every
--    job look like an orphan in the admin UI).

GRANT EXECUTE ON FUNCTION public.pg_cron_enabled() TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_cron_jobs()
RETURNS TABLE(jobname text, schedule text, active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow when called by service_role (edge functions) OR by an authenticated admin.
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can view cron jobs';
  END IF;

  RETURN QUERY
  SELECT j.jobname::text, j.schedule::text, j.active::boolean
  FROM cron.job j;
EXCEPTION
  WHEN undefined_table THEN RETURN;
  WHEN insufficient_privilege THEN RETURN;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_cron_jobs() TO authenticated, service_role;