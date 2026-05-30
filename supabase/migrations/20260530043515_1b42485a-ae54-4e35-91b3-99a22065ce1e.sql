-- Daily ritual rotation: assignment table
CREATE TABLE public.daily_ritual_assignments (
  ritual_date   date PRIMARY KEY,
  ritual_id     uuid NOT NULL REFERENCES public.daily_smarty_rituals(id) ON DELETE CASCADE,
  cycle_number  integer NOT NULL DEFAULT 1,
  assigned_at   timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.daily_ritual_assignments TO anon;
GRANT SELECT ON public.daily_ritual_assignments TO authenticated;
GRANT ALL ON public.daily_ritual_assignments TO service_role;

ALTER TABLE public.daily_ritual_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ritual assignments"
ON public.daily_ritual_assignments
FOR SELECT
USING (true);

CREATE INDEX idx_daily_ritual_assignments_cycle ON public.daily_ritual_assignments(cycle_number);