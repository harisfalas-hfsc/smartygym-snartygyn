-- Remove Strava integration completely
-- Drop tables
DROP TABLE IF EXISTS public.strava_activities CASCADE;
DROP TABLE IF EXISTS public.strava_connections CASCADE;

-- Note: This removes all Strava-related data and resolves the security vulnerability
-- where API tokens were stored in plain text