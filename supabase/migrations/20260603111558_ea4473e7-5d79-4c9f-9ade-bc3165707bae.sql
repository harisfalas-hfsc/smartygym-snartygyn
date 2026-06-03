GRANT EXECUTE ON FUNCTION public.get_workout_leaderboard() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_program_leaderboard() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_checkin_leaderboard() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_workout_ratings() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_program_ratings() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_display_names(uuid[]) TO anon, authenticated;