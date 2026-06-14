CREATE OR REPLACE FUNCTION public.enforce_micro_workout_rules()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.category = 'MICRO-WORKOUTS' THEN
    NEW.equipment := 'BODYWEIGHT';
    NEW.difficulty := 'All Levels';
    NEW.difficulty_stars := NULL;
    IF NEW.duration IS NULL OR NEW.duration = '' OR NEW.duration = '5 min' THEN
      NEW.duration := '15 min';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;