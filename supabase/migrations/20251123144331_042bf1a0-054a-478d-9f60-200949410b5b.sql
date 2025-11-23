-- Create function to check if pg_cron extension is enabled
CREATE OR REPLACE FUNCTION public.pg_cron_enabled()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'pg_cron'
  ) AND EXISTS (
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'pg_net'
  );
$$;