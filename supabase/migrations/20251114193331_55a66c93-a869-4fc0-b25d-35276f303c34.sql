-- Add constraint to admin_training_programs to prevent free content from being standalone purchase
ALTER TABLE admin_training_programs
ADD CONSTRAINT check_training_program_standalone_requires_premium 
CHECK (NOT (is_premium = false AND is_standalone_purchase = true));

-- Add constraint to admin_workouts to prevent free content from being standalone purchase
ALTER TABLE admin_workouts
ADD CONSTRAINT check_workout_standalone_requires_premium 
CHECK (NOT (is_premium = false AND is_standalone_purchase = true));

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT check_training_program_standalone_requires_premium ON admin_training_programs IS 
'Ensures that free content (is_premium = false) cannot be marked as standalone purchase';

COMMENT ON CONSTRAINT check_workout_standalone_requires_premium ON admin_workouts IS 
'Ensures that free content (is_premium = false) cannot be marked as standalone purchase';