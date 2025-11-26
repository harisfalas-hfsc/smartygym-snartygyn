-- Allow anyone to view basic public profile info for community features
CREATE POLICY "Anyone can view public profile info"
  ON public.profiles
  FOR SELECT
  USING (true);