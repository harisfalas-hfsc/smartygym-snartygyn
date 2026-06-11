-- Revoke public/anon/authenticated EXECUTE on the dangerous exec_sql helper.
-- This function runs arbitrary SQL and must only be callable by the service role
-- (used internally by edge functions / cron jobs).
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM anon;
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;