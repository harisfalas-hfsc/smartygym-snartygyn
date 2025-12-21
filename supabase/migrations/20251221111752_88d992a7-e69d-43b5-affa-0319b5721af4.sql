-- =====================================================
-- FIX: Convert views to SECURITY INVOKER (not DEFINER)
-- This ensures RLS policies are enforced for the querying user
-- =====================================================

-- Recreate leaderboard_stats with security_invoker
DROP VIEW IF EXISTS public.leaderboard_stats;
CREATE VIEW public.leaderboard_stats 
WITH (security_invoker = true) AS
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
HAVING COUNT(sc.id) >= 3
ORDER BY avg_score DESC
LIMIT 50;

GRANT SELECT ON public.leaderboard_stats TO authenticated;

-- Recreate workout_activity_summary with security_invoker
DROP VIEW IF EXISTS public.workout_activity_summary;
CREATE VIEW public.workout_activity_summary 
WITH (security_invoker = true) AS
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

GRANT SELECT ON public.workout_activity_summary TO authenticated;

-- Recreate program_activity_summary with security_invoker
DROP VIEW IF EXISTS public.program_activity_summary;
CREATE VIEW public.program_activity_summary 
WITH (security_invoker = true) AS
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

GRANT SELECT ON public.program_activity_summary TO authenticated;