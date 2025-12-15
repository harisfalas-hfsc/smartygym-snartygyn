-- Create system_health_audits table to store audit history
CREATE TABLE IF NOT EXISTS public.system_health_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_checks INTEGER NOT NULL DEFAULT 0,
  passed_checks INTEGER NOT NULL DEFAULT 0,
  warning_checks INTEGER NOT NULL DEFAULT 0,
  failed_checks INTEGER NOT NULL DEFAULT 0,
  skipped_checks INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  results JSONB,
  critical_issues TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_health_audits ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admins can view audit history"
ON public.system_health_audits
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert audits"
ON public.system_health_audits
FOR INSERT
WITH CHECK (true);

-- Create index for date-based queries
CREATE INDEX idx_system_health_audits_date ON public.system_health_audits(audit_date DESC);