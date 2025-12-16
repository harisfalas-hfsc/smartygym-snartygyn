-- Allow anyone to read check-in data for community leaderboard
CREATE POLICY "Anyone can view checkins for leaderboard" 
ON smarty_checkins 
FOR SELECT 
USING (true);