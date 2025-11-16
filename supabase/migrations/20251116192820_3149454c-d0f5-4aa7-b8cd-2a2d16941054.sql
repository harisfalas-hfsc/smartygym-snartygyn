-- Add admin access policy to user_purchases table
CREATE POLICY "Admins can view all purchases"
ON public.user_purchases
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);