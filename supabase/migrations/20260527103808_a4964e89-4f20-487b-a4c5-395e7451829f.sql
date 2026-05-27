
-- IndexNow auto-submission queue
CREATE TABLE IF NOT EXISTS public.indexnow_queue (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_indexnow_queue_unprocessed
  ON public.indexnow_queue (queued_at)
  WHERE processed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_indexnow_queue_url_unprocessed
  ON public.indexnow_queue (url)
  WHERE processed_at IS NULL;

GRANT ALL ON public.indexnow_queue TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.indexnow_queue_id_seq TO service_role;

ALTER TABLE public.indexnow_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read indexnow queue"
  ON public.indexnow_queue FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger functions
CREATE OR REPLACE FUNCTION public.queue_workout_for_indexnow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug TEXT;
  cat_upper TEXT;
BEGIN
  IF NEW.is_visible IS NOT TRUE THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.is_visible IS TRUE
     AND OLD.name IS NOT DISTINCT FROM NEW.name
     AND OLD.category IS NOT DISTINCT FROM NEW.category THEN
    RETURN NEW;
  END IF;

  cat_upper := UPPER(COALESCE(NEW.category, ''));
  slug := CASE
    WHEN cat_upper = 'STRENGTH' THEN 'strength'
    WHEN cat_upper = 'CALORIE BURNING' THEN 'calorie-burning'
    WHEN cat_upper = 'METABOLIC' THEN 'metabolic'
    WHEN cat_upper = 'CARDIO' THEN 'cardio'
    WHEN cat_upper LIKE 'MOBILITY%' THEN 'mobility'
    WHEN cat_upper = 'CHALLENGE' THEN 'challenge'
    WHEN cat_upper = 'PILATES' THEN 'pilates'
    WHEN cat_upper = 'RECOVERY' THEN 'recovery'
    WHEN cat_upper = 'MICRO-WORKOUTS' THEN 'micro-workouts'
    ELSE NULL
  END;

  IF slug IS NULL OR NEW.id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.indexnow_queue (url, content_type, content_id)
  VALUES (
    'https://smartygym.com/workout/' || slug || '/' || NEW.id,
    'workout',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.queue_program_for_indexnow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug TEXT;
  cat_upper TEXT;
BEGIN
  IF NEW.is_visible IS NOT TRUE THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.is_visible IS TRUE THEN
    RETURN NEW;
  END IF;

  cat_upper := UPPER(COALESCE(NEW.category, ''));
  slug := CASE
    WHEN cat_upper = 'CARDIO ENDURANCE' THEN 'cardio-endurance'
    WHEN cat_upper = 'FUNCTIONAL STRENGTH' THEN 'functional-strength'
    WHEN cat_upper = 'MUSCLE HYPERTROPHY' THEN 'muscle-hypertrophy'
    WHEN cat_upper = 'WEIGHT LOSS' THEN 'weight-loss'
    WHEN cat_upper = 'LOW BACK PAIN' THEN 'low-back-pain'
    WHEN cat_upper LIKE 'MOBILITY%' THEN 'mobility-stability'
    ELSE NULL
  END;

  IF slug IS NULL OR NEW.id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.indexnow_queue (url, content_type, content_id)
  VALUES (
    'https://smartygym.com/trainingprogram/' || slug || '/' || NEW.id,
    'program',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.queue_article_for_indexnow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_published IS NOT TRUE THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.is_published IS TRUE
     AND OLD.slug IS NOT DISTINCT FROM NEW.slug THEN
    RETURN NEW;
  END IF;

  IF NEW.slug IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.indexnow_queue (url, content_type, content_id)
  VALUES (
    'https://smartygym.com/blog/' || NEW.slug,
    'article',
    NEW.id::text
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_indexnow_workouts ON public.admin_workouts;
CREATE TRIGGER trg_indexnow_workouts
AFTER INSERT OR UPDATE OF is_visible, name, category ON public.admin_workouts
FOR EACH ROW EXECUTE FUNCTION public.queue_workout_for_indexnow();

DROP TRIGGER IF EXISTS trg_indexnow_programs ON public.admin_training_programs;
CREATE TRIGGER trg_indexnow_programs
AFTER INSERT OR UPDATE OF is_visible ON public.admin_training_programs
FOR EACH ROW EXECUTE FUNCTION public.queue_program_for_indexnow();

DROP TRIGGER IF EXISTS trg_indexnow_articles ON public.blog_articles;
CREATE TRIGGER trg_indexnow_articles
AFTER INSERT OR UPDATE OF is_published, slug ON public.blog_articles
FOR EACH ROW EXECUTE FUNCTION public.queue_article_for_indexnow();
