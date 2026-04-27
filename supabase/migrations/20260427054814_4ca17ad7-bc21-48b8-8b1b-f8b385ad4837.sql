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

    IF NEW.name ~* '\m(axial|matrix|meridian|protocol|helix|arcus|synergy|conduit|integration|current|vector|quantum|algorithm|neural|system|module|phase|sequence)\M' THEN
      RAISE EXCEPTION 'Workout of the Day public name contains AI/debug-style terminology: %', NEW.name;
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