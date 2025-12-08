-- Fix RLS policies to allow admins to delete and update rituals

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Only service role can delete rituals" ON public.daily_smarty_rituals;
DROP POLICY IF EXISTS "Only service role can update rituals" ON public.daily_smarty_rituals;

-- Create new policies allowing admins to manage rituals
CREATE POLICY "Admins can delete rituals" 
ON public.daily_smarty_rituals 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update rituals" 
ON public.daily_smarty_rituals 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));