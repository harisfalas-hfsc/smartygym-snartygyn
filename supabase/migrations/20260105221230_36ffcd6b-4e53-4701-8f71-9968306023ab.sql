-- Create a trigger function to enforce category/format rules
CREATE OR REPLACE FUNCTION public.enforce_workout_format_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  required_format TEXT;
BEGIN
  -- Determine required format based on category
  CASE NEW.category
    WHEN 'STRENGTH' THEN required_format := 'REPS & SETS';
    WHEN 'MOBILITY & STABILITY' THEN required_format := 'REPS & SETS';
    WHEN 'PILATES' THEN required_format := 'REPS & SETS';
    WHEN 'RECOVERY' THEN required_format := 'MIX';
    ELSE required_format := NULL; -- Flexible categories have no restriction
  END CASE;

  -- If this category has a required format, enforce it
  IF required_format IS NOT NULL AND NEW.format IS DISTINCT FROM required_format THEN
    -- Auto-correct the format instead of rejecting (more user-friendly)
    NEW.format := required_format;
    RAISE NOTICE 'Format auto-corrected to % for category %', required_format, NEW.category;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on admin_workouts table
DROP TRIGGER IF EXISTS enforce_workout_format_trigger ON public.admin_workouts;

CREATE TRIGGER enforce_workout_format_trigger
BEFORE INSERT OR UPDATE ON public.admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_workout_format_rules();