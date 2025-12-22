-- Drop existing premium-only policy for daily_smarty_rituals
DROP POLICY IF EXISTS "Premium users can view visible rituals" ON public.daily_smarty_rituals;

-- Create new policy for all authenticated users
CREATE POLICY "Authenticated users can view visible rituals"
ON public.daily_smarty_rituals FOR SELECT
USING (
  is_visible = true 
  AND auth.uid() IS NOT NULL
);