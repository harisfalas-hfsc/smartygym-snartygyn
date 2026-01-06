-- Add RLS policy for admins to read all users' system messages
CREATE POLICY "Admins can view all user system messages"
ON public.user_system_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));