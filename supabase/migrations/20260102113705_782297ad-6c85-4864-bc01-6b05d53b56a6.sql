-- Create image_repair_jobs table for non-blocking repair processing
CREATE TABLE IF NOT EXISTS public.image_repair_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  repaired_items INTEGER DEFAULT 0,
  skipped_items INTEGER DEFAULT 0,
  stripe_synced INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.image_repair_jobs ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage repair jobs
CREATE POLICY "Admins can manage repair jobs" ON public.image_repair_jobs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create notification_queue_triggers function and triggers for auto-notifications
-- Trigger for programs
CREATE OR REPLACE FUNCTION public.queue_program_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if program is visible and not suppressed
  IF NEW.is_visible = true THEN
    INSERT INTO public.pending_content_notifications (content_id, content_name, content_type, content_category)
    VALUES (NEW.id, NEW.name, 'program', NEW.category)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for workouts
CREATE OR REPLACE FUNCTION public.queue_workout_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if workout is visible and not a WOD (WODs have their own notification system)
  IF NEW.is_visible = true AND (NEW.is_workout_of_day IS NULL OR NEW.is_workout_of_day = false) THEN
    INSERT INTO public.pending_content_notifications (content_id, content_name, content_type, content_category)
    VALUES (NEW.id, NEW.name, 'workout', NEW.category)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for blog articles
CREATE OR REPLACE FUNCTION public.queue_article_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if article is published
  IF NEW.is_published = true THEN
    INSERT INTO public.pending_content_notifications (content_id, content_name, content_type, content_category)
    VALUES (NEW.id, NEW.title, 'article', NEW.category)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the triggers
DROP TRIGGER IF EXISTS auto_queue_program_notification ON public.admin_training_programs;
CREATE TRIGGER auto_queue_program_notification
  AFTER INSERT ON public.admin_training_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_program_notification();

DROP TRIGGER IF EXISTS auto_queue_workout_notification ON public.admin_workouts;
CREATE TRIGGER auto_queue_workout_notification
  AFTER INSERT ON public.admin_workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_workout_notification();

DROP TRIGGER IF EXISTS auto_queue_article_notification ON public.blog_articles;
CREATE TRIGGER auto_queue_article_notification
  AFTER INSERT ON public.blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_article_notification();

-- Add unique constraint on pending_content_notifications to prevent duplicates
ALTER TABLE public.pending_content_notifications 
  DROP CONSTRAINT IF EXISTS pending_content_notifications_content_unique;
ALTER TABLE public.pending_content_notifications 
  ADD CONSTRAINT pending_content_notifications_content_unique 
  UNIQUE (content_id, content_type);