-- Create a secure exec_sql function that allows the service role to execute cron commands
-- This is needed for the manage-cron-jobs edge function to update pg_cron

CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Revoke access from public - only service role can use this
REVOKE ALL ON FUNCTION public.exec_sql(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exec_sql(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.exec_sql(TEXT) FROM authenticated;

-- Add a comment explaining the function's purpose
COMMENT ON FUNCTION public.exec_sql(TEXT) IS 'Executes dynamic SQL for cron job management. Only accessible via service role.';