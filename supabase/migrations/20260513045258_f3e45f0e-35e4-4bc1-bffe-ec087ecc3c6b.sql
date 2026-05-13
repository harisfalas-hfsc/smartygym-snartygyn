-- Allow everyone (including anonymous guests) to view workout comments
-- This makes the community page comments visible without login

DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.workout_comments;

CREATE POLICY "Anyone can view comments"
ON public.workout_comments
FOR SELECT
TO public
USING (true);
