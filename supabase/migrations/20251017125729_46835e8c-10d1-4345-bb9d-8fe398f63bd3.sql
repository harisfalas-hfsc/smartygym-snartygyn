-- Update profiles RLS policy to allow users to view all profiles
-- This is needed for community features like direct messaging and viewing subscribed members

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (true);
