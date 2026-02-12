
-- Create secure function to get workout ratings aggregated by workout
CREATE OR REPLACE FUNCTION public.get_workout_ratings()
RETURNS TABLE(workout_id text, workout_name text, workout_type text, average_rating numeric, rating_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    wi.workout_id,
    wi.workout_name,
    wi.workout_type,
    ROUND(AVG(wi.rating)::numeric, 1) as average_rating,
    COUNT(*) as rating_count
  FROM workout_interactions wi
  WHERE wi.rating IS NOT NULL
  GROUP BY wi.workout_id, wi.workout_name, wi.workout_type
  ORDER BY average_rating DESC, rating_count DESC
  LIMIT 10;
$$;

-- Create secure function to get program ratings aggregated by program
CREATE OR REPLACE FUNCTION public.get_program_ratings()
RETURNS TABLE(program_id text, program_name text, program_type text, average_rating numeric, rating_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pi.program_id,
    pi.program_name,
    pi.program_type,
    ROUND(AVG(pi.rating)::numeric, 1) as average_rating,
    COUNT(*) as rating_count
  FROM program_interactions pi
  WHERE pi.rating IS NOT NULL
  GROUP BY pi.program_id, pi.program_name, pi.program_type
  ORDER BY average_rating DESC, rating_count DESC
  LIMIT 10;
$$;

GRANT EXECUTE ON FUNCTION public.get_workout_ratings() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_program_ratings() TO authenticated, anon;
