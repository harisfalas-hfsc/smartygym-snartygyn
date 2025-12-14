-- Add RLS policy to allow admins to view WOD state
CREATE POLICY "Admins can view WOD state" 
ON workout_of_day_state 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy to allow admins to update WOD state
CREATE POLICY "Admins can update WOD state" 
ON workout_of_day_state 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));