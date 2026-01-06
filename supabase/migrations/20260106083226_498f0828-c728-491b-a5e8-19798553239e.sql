-- Fix the function search path for the new trigger function
CREATE OR REPLACE FUNCTION public.enforce_micro_workout_rules()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.category = 'MICRO-WORKOUTS' THEN
    NEW.equipment := 'BODYWEIGHT';
    NEW.difficulty := 'All Levels';
    NEW.difficulty_stars := NULL;
    NEW.duration := '5 min';
  END IF;
  RETURN NEW;
END;
$$;