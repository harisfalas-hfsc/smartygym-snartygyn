-- Allow anyone to view workout completions for leaderboard
CREATE POLICY "Anyone can view workout completions for leaderboard"
ON public.workout_interactions
FOR SELECT
USING (true);

-- Allow anyone to view program completions for leaderboard  
CREATE POLICY "Anyone can view program completions for leaderboard"
ON public.program_interactions
FOR SELECT
USING (true);