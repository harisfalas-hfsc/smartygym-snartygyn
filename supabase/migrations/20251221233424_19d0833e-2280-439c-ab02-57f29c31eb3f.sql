-- Create a function that triggers automatic image generation for new workouts
CREATE OR REPLACE FUNCTION public.trigger_auto_generate_workout_image()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger if image_url is NULL and it's not a WOD (WODs have their own system)
  IF NEW.image_url IS NULL AND (NEW.is_workout_of_day IS NULL OR NEW.is_workout_of_day = false) THEN
    -- Use pg_net to call the edge function asynchronously
    PERFORM net.http_post(
      url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/auto-generate-workout-image',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno'
      ),
      body := jsonb_build_object('workout_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on admin_workouts table
DROP TRIGGER IF EXISTS auto_generate_workout_image_trigger ON admin_workouts;

CREATE TRIGGER auto_generate_workout_image_trigger
AFTER INSERT ON admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.trigger_auto_generate_workout_image();

-- Add a comment explaining the trigger
COMMENT ON TRIGGER auto_generate_workout_image_trigger ON admin_workouts IS 
'Automatically generates a cover image for new workouts that do not have an image_url set';