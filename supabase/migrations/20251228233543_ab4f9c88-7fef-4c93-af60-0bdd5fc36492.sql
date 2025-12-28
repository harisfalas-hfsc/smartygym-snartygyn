-- Drop the database triggers that bypass admin UI control
-- This gives the admin full control via the toggle in the edit dialogs

DROP TRIGGER IF EXISTS trigger_notify_new_workout ON admin_workouts;
DROP TRIGGER IF EXISTS trigger_notify_new_program ON admin_training_programs;

-- Also drop the trigger functions since they're no longer needed
DROP FUNCTION IF EXISTS public.notify_new_workout();
DROP FUNCTION IF EXISTS public.notify_new_program();