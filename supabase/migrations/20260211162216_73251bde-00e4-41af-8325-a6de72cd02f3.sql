
CREATE OR REPLACE FUNCTION public.queue_workout_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only queue if workout is visible, not a WOD, and not a welcome/complimentary workout
  IF NEW.is_visible = true 
     AND (NEW.is_workout_of_day IS NULL OR NEW.is_workout_of_day = false)
     AND (NEW.type IS NULL OR NEW.type != 'welcome') THEN
    INSERT INTO public.pending_content_notifications (content_id, content_name, content_type, content_category)
    VALUES (NEW.id, NEW.name, 'workout', NEW.category)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;
