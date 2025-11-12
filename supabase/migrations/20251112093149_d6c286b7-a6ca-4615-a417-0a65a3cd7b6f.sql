-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view workouts" ON admin_workouts;

-- Create a new permissive policy that allows everyone to view workouts
CREATE POLICY "Public can view all workouts"
ON admin_workouts
FOR SELECT
TO public
USING (true);

-- Same fix for training programs
DROP POLICY IF EXISTS "Anyone can view programs" ON admin_training_programs;

CREATE POLICY "Public can view all programs"
ON admin_training_programs
FOR SELECT
TO public
USING (true);