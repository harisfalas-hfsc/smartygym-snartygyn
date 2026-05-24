
CREATE TABLE IF NOT EXISTS public.system_health_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  status TEXT NOT NULL DEFAULT 'open',
  scheduled_for_date DATE,
  equipment_slot TEXT,
  category TEXT,
  difficulty TEXT,
  day_in_84 INTEGER,
  issue_message TEXT,
  autofix_attempted BOOLEAN NOT NULL DEFAULT false,
  autofix_status TEXT,
  autofix_result JSONB,
  candidate_rejection_reasons JSONB,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_health_events_recent
  ON public.system_health_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_events_open
  ON public.system_health_events (check_type, status, scheduled_for_date, equipment_slot);

ALTER TABLE public.system_health_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view health events" ON public.system_health_events;
CREATE POLICY "Admins can view health events"
ON public.system_health_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS update_system_health_events_updated_at ON public.system_health_events;
CREATE TRIGGER update_system_health_events_updated_at
BEFORE UPDATE ON public.system_health_events
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
