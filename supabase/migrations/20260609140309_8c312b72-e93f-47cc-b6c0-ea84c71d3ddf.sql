
CREATE POLICY "Users can reply to their own contact threads"
ON public.contact_message_history
FOR INSERT
TO authenticated
WITH CHECK (
  sender = 'customer'
  AND message_type = 'customer_reply'
  AND EXISTS (
    SELECT 1 FROM public.contact_messages cm
    WHERE cm.id = contact_message_history.contact_message_id
      AND cm.user_id = auth.uid()
  )
);
