CREATE OR REPLACE FUNCTION public.validate_public_workout_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_workout_of_day IS TRUE THEN
    IF NEW.name ~ '[0-9]' THEN
      RAISE EXCEPTION 'Workout of the Day public name cannot contain numbers: %', NEW.name;
    END IF;

    IF NEW.name ~* '(\m(v[0-9]+|#[0-9]+|[0-9]{4}(BW|EQ|V)|II|III|IV|V|VI|VII|VIII|IX|X)\M)$' THEN
      RAISE EXCEPTION 'Workout of the Day public name cannot contain internal suffixes: %', NEW.name;
    END IF;
  END IF;

  IF NEW.is_standalone_purchase IS TRUE AND COALESCE(NEW.price, 0) > 0 THEN
    IF (NEW.stripe_product_id IS NULL) <> (NEW.stripe_price_id IS NULL) THEN
      RAISE EXCEPTION 'Standalone paid workouts must have both payment product and price links together';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_public_workout_integrity_trigger ON public.admin_workouts;
CREATE TRIGGER validate_public_workout_integrity_trigger
BEFORE INSERT OR UPDATE ON public.admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.validate_public_workout_integrity();

CREATE OR REPLACE FUNCTION public.validate_public_program_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_standalone_purchase IS TRUE AND COALESCE(NEW.price, 0) > 0 THEN
    IF (NEW.stripe_product_id IS NULL) <> (NEW.stripe_price_id IS NULL) THEN
      RAISE EXCEPTION 'Standalone paid programs must have both payment product and price links together';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_public_program_integrity_trigger ON public.admin_training_programs;
CREATE TRIGGER validate_public_program_integrity_trigger
BEFORE INSERT OR UPDATE ON public.admin_training_programs
FOR EACH ROW
EXECUTE FUNCTION public.validate_public_program_integrity();