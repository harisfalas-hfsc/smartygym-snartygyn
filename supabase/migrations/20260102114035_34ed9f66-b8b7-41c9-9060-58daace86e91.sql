-- Create a function to automatically queue image repair for new content without valid images
CREATE OR REPLACE FUNCTION public.queue_image_repair_if_needed()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if image_url is null or empty
  IF NEW.image_url IS NULL OR NEW.image_url = '' THEN
    -- Call the auto-generate function asynchronously via pg_net
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for workouts (on INSERT when no image)
DROP TRIGGER IF EXISTS auto_generate_workout_image_on_insert ON public.admin_workouts;
CREATE TRIGGER auto_generate_workout_image_on_insert
  AFTER INSERT ON public.admin_workouts
  FOR EACH ROW
  WHEN (NEW.image_url IS NULL OR NEW.image_url = '')
  EXECUTE FUNCTION public.queue_image_repair_if_needed();

-- Create a function to auto-generate program images
CREATE OR REPLACE FUNCTION public.queue_program_image_repair_if_needed()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if image_url is null or empty
  IF NEW.image_url IS NULL OR NEW.image_url = '' THEN
    -- Call the generate-program-image function asynchronously via pg_net
    PERFORM net.http_post(
      url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/generate-program-image',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno'
      ),
      body := jsonb_build_object(
        'programId', NEW.id,
        'programName', NEW.name,
        'category', NEW.category,
        'difficulty', NEW.difficulty,
        'weeks', NEW.weeks
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for programs (on INSERT when no image)
DROP TRIGGER IF EXISTS auto_generate_program_image_on_insert ON public.admin_training_programs;
CREATE TRIGGER auto_generate_program_image_on_insert
  AFTER INSERT ON public.admin_training_programs
  FOR EACH ROW
  WHEN (NEW.image_url IS NULL OR NEW.image_url = '')
  EXECUTE FUNCTION public.queue_program_image_repair_if_needed();