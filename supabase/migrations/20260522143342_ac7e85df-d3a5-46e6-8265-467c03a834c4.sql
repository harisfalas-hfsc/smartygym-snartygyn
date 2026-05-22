CREATE TABLE IF NOT EXISTS public.wod_tomorrow_preview (
  date date PRIMARY KEY,
  bodyweight_workout_id text REFERENCES public.admin_workouts(id) ON DELETE SET NULL,
  equipment_workout_id text REFERENCES public.admin_workouts(id) ON DELETE SET NULL,
  recovery_workout_id text REFERENCES public.admin_workouts(id) ON DELETE SET NULL,
  is_recovery_day boolean NOT NULL DEFAULT false,
  category text,
  difficulty text,
  difficulty_stars_min integer,
  difficulty_stars_max integer,
  picked_at timestamptz NOT NULL DEFAULT now(),
  picked_by text NOT NULL DEFAULT 'cron',
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wod_tomorrow_preview_status_check CHECK (status IN ('pending','approved','rejected'))
);

ALTER TABLE public.wod_tomorrow_preview ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view preview"
  ON public.wod_tomorrow_preview FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert preview"
  ON public.wod_tomorrow_preview FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update preview"
  ON public.wod_tomorrow_preview FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete preview"
  ON public.wod_tomorrow_preview FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER wod_tomorrow_preview_set_updated_at
  BEFORE UPDATE ON public.wod_tomorrow_preview
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.cron_job_metadata
  (job_name, display_name, description, category, edge_function_name, request_body, is_critical, schedule, schedule_human_readable, timezone, is_active)
VALUES
  ('preview-tomorrow-wod-evening',
   'Preview Tomorrow''s WOD (6 PM)',
   'Pre-picks tomorrow''s Bodyweight + Equipment Workout of the Day from the library and saves them to the preview table at 18:00 Europe/Athens so the admin can review, swap, or approve before the morning publish.',
   'wod',
   'preview-tomorrow-wod',
   '{"action":"preview","triggerSource":"cron-evening"}'::jsonb,
   false,
   '0 16 * * *',
   'Daily 16:00 UTC (18:00 Europe/Athens) — pre-picks tomorrow''s WOD into the preview table',
   'UTC',
   true)
ON CONFLICT (job_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  edge_function_name = EXCLUDED.edge_function_name,
  request_body = EXCLUDED.request_body,
  schedule = EXCLUDED.schedule,
  schedule_human_readable = EXCLUDED.schedule_human_readable,
  timezone = EXCLUDED.timezone,
  is_active = EXCLUDED.is_active,
  updated_at = now();