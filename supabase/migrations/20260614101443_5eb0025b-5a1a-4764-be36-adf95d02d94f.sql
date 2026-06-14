CREATE OR REPLACE FUNCTION public.enforce_micro_workout_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mins int;
BEGIN
  IF NEW.category = 'MICRO-WORKOUTS' THEN
    -- Forbid finisher block on micros
    IF NEW.finisher IS NOT NULL AND length(btrim(NEW.finisher)) > 0 THEN
      RAISE EXCEPTION 'Micro-workouts cannot have a finisher (must be 5 minutes total).';
    END IF;

    -- Cap duration at 5 minutes
    mins := COALESCE((regexp_match(NEW.duration, '([0-9]+)'))[1]::int, 0);
    IF mins > 5 THEN
      RAISE EXCEPTION 'Micro-workouts must be 5 minutes or less (got % minutes).', mins;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;