-- Create trigger for new workouts (excluding WODs which have their own notification system)
CREATE TRIGGER trigger_notify_new_workout
  AFTER INSERT ON public.admin_workouts
  FOR EACH ROW
  WHEN (NEW.is_workout_of_day IS NOT TRUE AND NEW.is_visible IS TRUE)
  EXECUTE FUNCTION public.notify_new_workout();

-- Create trigger for new training programs
CREATE TRIGGER trigger_notify_new_program
  AFTER INSERT ON public.admin_training_programs
  FOR EACH ROW
  WHEN (NEW.is_visible IS TRUE)
  EXECUTE FUNCTION public.notify_new_program();