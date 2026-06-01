-- 1. Harden email_delivery_log: explicit deny-by-default for non-admin writes/reads via authenticated role.
-- Service role bypasses RLS, so edge functions can still insert.
DROP POLICY IF EXISTS "Block authenticated insert email logs" ON public.email_delivery_log;
DROP POLICY IF EXISTS "Block authenticated update email logs" ON public.email_delivery_log;
DROP POLICY IF EXISTS "Block authenticated delete email logs" ON public.email_delivery_log;

CREATE POLICY "Block authenticated insert email logs"
  ON public.email_delivery_log
  FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Block authenticated update email logs"
  ON public.email_delivery_log
  FOR UPDATE TO authenticated, anon
  USING (false);

CREATE POLICY "Block authenticated delete email logs"
  ON public.email_delivery_log
  FOR DELETE TO authenticated, anon
  USING (false);

-- 2. Fix message-attachments SELECT policy: validate the first folder segment
-- corresponds to a contact_messages row owned by the requesting user.
DROP POLICY IF EXISTS "Users can view their own message attachments" ON storage.objects;

CREATE POLICY "Users can view their own message attachments"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'message-attachments'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.contact_messages cm
        WHERE cm.id::text = (storage.foldername(name))[1]
          AND cm.user_id = auth.uid()
      )
    )
  );
