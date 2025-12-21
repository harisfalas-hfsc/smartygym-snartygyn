-- Drop dangerous RLS policies that expose user data publicly
DROP POLICY IF EXISTS "Anyone can view workout completions for leaderboard" ON public.workout_interactions;
DROP POLICY IF EXISTS "Anyone can view program completions for leaderboard" ON public.program_interactions;