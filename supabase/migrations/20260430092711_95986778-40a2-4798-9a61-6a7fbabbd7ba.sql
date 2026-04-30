
CREATE TABLE IF NOT EXISTS public.workout_repair_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id TEXT NOT NULL,
  workout_name TEXT,
  bugs_found JSONB NOT NULL DEFAULT '[]'::jsonb,
  fixes_applied JSONB NOT NULL DEFAULT '[]'::jsonb,
  flagged_for_review JSONB NOT NULL DEFAULT '[]'::jsonb,
  changed BOOLEAN NOT NULL DEFAULT false,
  run_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_repair_log_workout_id ON public.workout_repair_log(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_repair_log_run_at ON public.workout_repair_log(run_at DESC);

ALTER TABLE public.workout_repair_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read workout repair log"
ON public.workout_repair_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert workout repair log"
ON public.workout_repair_log
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
