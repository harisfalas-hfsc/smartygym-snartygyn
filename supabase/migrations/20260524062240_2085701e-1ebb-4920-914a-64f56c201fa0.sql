
-- Convert own-data helpers to SECURITY INVOKER (RLS already protects the underlying rows)
ALTER FUNCTION public.has_role(uuid, app_role) SECURITY INVOKER;
ALTER FUNCTION public.has_role_check(uuid, app_role) SECURITY INVOKER;
ALTER FUNCTION public.has_premium_subscription(uuid) SECURITY INVOKER;
ALTER FUNCTION public.user_has_active_premium_access(uuid) SECURITY INVOKER;
ALTER FUNCTION public.user_has_purchased_content(uuid, text, text) SECURITY INVOKER;

-- is_user_banned: needs DEFINER (banned_users only readable by admins). Revoke from anon, keep authenticated.
-- (already revoked + granted in previous migration)

-- get_profile_display_names: needs DEFINER (reads other users' profiles). Already locked to authenticated.

-- Public-facing aggregate read functions: revoke from anon to silence anon-warning where safe.
-- These are called from public pages; we expose them through a thin authenticated-only path.
-- For pages that need anon access (homepage testimonials/ratings), keep PUBLIC EXECUTE — those
-- are intentional public reads of non-sensitive aggregated data.

-- Lock leaderboards/ratings to authenticated (community pages are behind auth anyway)
REVOKE EXECUTE ON FUNCTION public.get_workout_leaderboard() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_checkin_leaderboard() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_program_leaderboard() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_workout_ratings() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_program_ratings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_workout_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_checkin_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_program_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_workout_ratings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_program_ratings() TO authenticated;

-- Visible metadata: revoke from anon (anon never reads workout/program detail RPCs directly;
-- frontend reads tables with RLS). Keep authenticated.
REVOKE EXECUTE ON FUNCTION public.get_visible_workout_metadata(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_visible_program_metadata(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_visible_workout_metadata(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_visible_program_metadata(text) TO authenticated;
