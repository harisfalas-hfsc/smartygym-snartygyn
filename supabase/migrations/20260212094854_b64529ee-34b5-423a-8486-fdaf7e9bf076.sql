
-- Create secure function to get workout completion leaderboard
CREATE OR REPLACE FUNCTION public.get_workout_leaderboard()
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, completed_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    wi.user_id,
    COALESCE(p.full_name, 'Anonymous') as display_name,
    p.avatar_url,
    COUNT(*) as completed_count
  FROM workout_interactions wi
  LEFT JOIN profiles p ON p.user_id = wi.user_id
  WHERE wi.is_completed = true
  GROUP BY wi.user_id, p.full_name, p.avatar_url
  ORDER BY completed_count DESC
  LIMIT 10;
$$;

-- Create secure function to get program completion leaderboard
CREATE OR REPLACE FUNCTION public.get_program_leaderboard()
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, completed_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pi.user_id,
    COALESCE(p.full_name, 'Anonymous') as display_name,
    p.avatar_url,
    COUNT(*) as completed_count
  FROM program_interactions pi
  LEFT JOIN profiles p ON p.user_id = pi.user_id
  WHERE pi.is_completed = true
  GROUP BY pi.user_id, p.full_name, p.avatar_url
  ORDER BY completed_count DESC
  LIMIT 10;
$$;

-- Create secure function to get checkin consistency leaderboard
CREATE OR REPLACE FUNCTION public.get_checkin_leaderboard()
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, consistency_score bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    sc.user_id,
    COALESCE(p.full_name, 'Anonymous') as display_name,
    p.avatar_url,
    SUM(
      CASE 
        WHEN sc.morning_completed AND sc.night_completed THEN 3
        WHEN sc.morning_completed OR sc.night_completed THEN 1
        ELSE 0
      END
    ) as consistency_score
  FROM smarty_checkins sc
  LEFT JOIN profiles p ON p.user_id = sc.user_id
  GROUP BY sc.user_id, p.full_name, p.avatar_url
  ORDER BY consistency_score DESC
  LIMIT 10;
$$;

-- Grant execute to authenticated and anon
GRANT EXECUTE ON FUNCTION public.get_workout_leaderboard() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_program_leaderboard() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_checkin_leaderboard() TO authenticated, anon;
