-- Drop the existing restrictive update policies that are causing the AND logic issue
DROP POLICY IF EXISTS "Admins can update all contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users can mark their own messages as read" ON public.contact_messages;

-- Create new PERMISSIVE policies that use OR logic
-- This allows EITHER admins OR message owners to update
CREATE POLICY "Admins or owners can update contact messages"
ON public.contact_messages
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id
);