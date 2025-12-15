-- Drop the duplicate trigger on admin_workouts that was causing double notifications
DROP TRIGGER IF EXISTS trigger_new_workout_notification ON admin_workouts;

-- Check and drop any duplicate trigger on admin_training_programs if it exists
DROP TRIGGER IF EXISTS trigger_new_program_notification ON admin_training_programs;