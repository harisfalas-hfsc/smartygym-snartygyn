DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.workout_comments;

CREATE POLICY "Anyone can view comments"
ON public.workout_comments
FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT ON public.workout_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_comments TO authenticated;