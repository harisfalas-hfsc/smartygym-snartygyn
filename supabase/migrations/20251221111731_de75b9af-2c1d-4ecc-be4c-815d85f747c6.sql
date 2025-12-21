-- =====================================================
-- SECURITY FIX: Remove dangerous public SELECT policies
-- =====================================================

-- Drop the overly permissive leaderboard policy from smarty_checkins
DROP POLICY IF EXISTS "Anyone can view checkins for leaderboard" ON public.smarty_checkins;

-- =====================================================
-- Create aggregated leaderboard view (no user IDs exposed)
-- =====================================================

-- Create a secure leaderboard view that only shows aggregated stats
-- This view exposes NO user_id - only display_name from profiles
CREATE OR REPLACE VIEW public.leaderboard_stats AS
SELECT 
  p.full_name as display_name,
  p.avatar_url,
  COUNT(sc.id) as total_checkins,
  COALESCE(AVG(sc.daily_smarty_score), 0)::integer as avg_score,
  MAX(sc.daily_smarty_score) as best_score,
  COUNT(CASE WHEN sc.morning_completed = true AND sc.night_completed = true THEN 1 END) as complete_days,
  COUNT(DISTINCT sc.checkin_date) as streak_days
FROM public.profiles p
LEFT JOIN public.smarty_checkins sc ON p.user_id = sc.user_id
WHERE sc.daily_smarty_score IS NOT NULL
  AND sc.checkin_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.user_id, p.full_name, p.avatar_url
HAVING COUNT(sc.id) >= 3  -- Minimum 3 checkins to appear on leaderboard
ORDER BY avg_score DESC
LIMIT 50;

-- Grant access to authenticated users only
GRANT SELECT ON public.leaderboard_stats TO authenticated;

-- =====================================================
-- Create workout activity summary view (no user IDs)
-- =====================================================

CREATE OR REPLACE VIEW public.workout_activity_summary AS
SELECT 
  wi.workout_type,
  wi.workout_name,
  COUNT(*) as times_completed,
  AVG(wi.rating)::numeric(2,1) as avg_rating,
  COUNT(CASE WHEN wi.is_favorite = true THEN 1 END) as favorites_count
FROM public.workout_interactions wi
WHERE wi.is_completed = true
GROUP BY wi.workout_type, wi.workout_name
ORDER BY times_completed DESC;

-- Grant access to authenticated users only
GRANT SELECT ON public.workout_activity_summary TO authenticated;

-- =====================================================
-- Create program activity summary view (no user IDs)
-- =====================================================

CREATE OR REPLACE VIEW public.program_activity_summary AS
SELECT 
  pi.program_type,
  pi.program_name,
  COUNT(*) as times_started,
  COUNT(CASE WHEN pi.is_completed = true THEN 1 END) as times_completed,
  AVG(pi.rating)::numeric(2,1) as avg_rating,
  COUNT(CASE WHEN pi.is_favorite = true THEN 1 END) as favorites_count
FROM public.program_interactions pi
GROUP BY pi.program_type, pi.program_name
ORDER BY times_started DESC;

-- Grant access to authenticated users only
GRANT SELECT ON public.program_activity_summary TO authenticated;