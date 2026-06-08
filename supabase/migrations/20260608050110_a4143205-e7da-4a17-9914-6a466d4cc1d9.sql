-- Fix 1: Storage policy bug - reference 'name' (storage.objects column) not 'cm.name'
DROP POLICY IF EXISTS "Users can view their own message attachments" ON storage.objects;
CREATE POLICY "Users can view their own message attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.contact_messages cm
      WHERE cm.id::text = (storage.foldername(storage.objects.name))[1]
        AND cm.user_id = auth.uid()
    )
  )
);

-- Fix 2: Restrict workout_comments SELECT to authenticated users to avoid exposing user UUIDs publicly
DROP POLICY IF EXISTS "Anyone can view comments" ON public.workout_comments;
CREATE POLICY "Authenticated users can view comments"
ON public.workout_comments
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.workout_comments FROM anon;