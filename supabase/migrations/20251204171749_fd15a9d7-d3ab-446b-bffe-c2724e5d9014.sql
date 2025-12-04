-- Create pending_content_notifications table for buffering new content
CREATE TABLE public.pending_content_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content_name TEXT NOT NULL,
  content_category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_content_notifications ENABLE ROW LEVEL SECURITY;

-- Only service role can manage (edge function uses service role)
CREATE POLICY "Only service role can manage pending notifications"
ON public.pending_content_notifications
FOR ALL USING (false) WITH CHECK (false);

-- Create trigger function for new workouts (excluding WODs)
CREATE OR REPLACE FUNCTION public.notify_new_workout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip if it's a WOD (WODs have their own notification system)
  IF NEW.is_workout_of_day = true THEN
    RETURN NEW;
  END IF;
  
  -- Insert into pending notifications
  INSERT INTO pending_content_notifications (content_type, content_id, content_name, content_category)
  VALUES ('workout', NEW.id, NEW.name, NEW.category);
  
  RETURN NEW;
END;
$$;

-- Create trigger function for new programs
CREATE OR REPLACE FUNCTION public.notify_new_program()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO pending_content_notifications (content_type, content_id, content_name, content_category)
  VALUES ('program', NEW.id, NEW.name, NEW.category);
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_new_workout_notification
AFTER INSERT ON admin_workouts
FOR EACH ROW EXECUTE FUNCTION notify_new_workout();

CREATE TRIGGER trigger_new_program_notification
AFTER INSERT ON admin_training_programs
FOR EACH ROW EXECUTE FUNCTION notify_new_program();