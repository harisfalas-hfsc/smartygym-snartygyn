CREATE TABLE public.wod_readiness_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  triggered_by TEXT NOT NULL DEFAULT 'manual',
  overall_status TEXT NOT NULL DEFAULT 'healthy',
  total_checks INTEGER NOT NULL DEFAULT 0,
  passed_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  results JSONB,
  failed_check_keys TEXT[] DEFAULT '{}',
  warning_check_keys TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_wod_readiness_audits_date ON public.wod_readiness_audits (audit_date DESC);

ALTER TABLE public.wod_readiness_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view readiness audits"
  ON public.wod_readiness_audits FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert readiness audits"
  ON public.wod_readiness_audits FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage readiness audits"
  ON public.wod_readiness_audits FOR ALL
  USING (true) WITH CHECK (true);