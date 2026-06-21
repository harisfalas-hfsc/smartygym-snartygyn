CREATE OR REPLACE FUNCTION public.prevent_workout_content_wipe()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  old_body text := COALESCE(OLD.main_workout, '');
  new_body text := COALESCE(NEW.main_workout, '');
  old_len integer := LENGTH(COALESCE(OLD.main_workout, ''));
  new_len integer := LENGTH(COALESCE(NEW.main_workout, ''));
BEGIN
  IF TG_OP = 'UPDATE'
     AND COALESCE(NEW.is_visible, true) IS TRUE
     AND old_body ~ '\{\{exercise:[^}]+\}\}'
     AND old_len >= 1000
     AND (
       new_body !~ '\{\{exercise:[^}]+\}\}'
       OR new_len < GREATEST(600, old_len * 0.30)
     )
     AND NOT (
       COALESCE(NEW.id, '') ILIKE '%HFSC%'
       OR COALESCE(NEW.name, '') ILIKE '%HFSC%'
       OR COALESCE(NEW.description, '') ILIKE '%HFSC%'
     )
  THEN
    RAISE EXCEPTION 'Blocked unsafe workout content wipe for %. Existing visible workout content cannot be replaced by an empty or severely shortened body.', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_workout_content_wipe_trigger ON public.admin_workouts;
CREATE TRIGGER prevent_workout_content_wipe_trigger
BEFORE UPDATE OF main_workout, is_visible ON public.admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.prevent_workout_content_wipe();