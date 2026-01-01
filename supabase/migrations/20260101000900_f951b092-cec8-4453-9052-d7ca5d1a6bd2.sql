-- Create WOD generation run logging table for observability
CREATE TABLE public.wod_generation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cyprus_date TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running',
  expected_count INTEGER NOT NULL,
  found_count INTEGER DEFAULT 0,
  is_recovery_day BOOLEAN DEFAULT false,
  expected_category TEXT,
  wods_created JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  trigger_source TEXT DEFAULT 'orchestrator',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for quick lookups by date
CREATE INDEX idx_wod_generation_runs_date ON public.wod_generation_runs(cyprus_date);
CREATE INDEX idx_wod_generation_runs_status ON public.wod_generation_runs(status);

-- Enable RLS
ALTER TABLE public.wod_generation_runs ENABLE ROW LEVEL SECURITY;

-- Admin can read
CREATE POLICY "Admins can view generation runs"
ON public.wod_generation_runs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Service role can insert/update (for edge functions)
CREATE POLICY "Service role can manage generation runs"
ON public.wod_generation_runs
FOR ALL
USING (true)
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.wod_generation_runs IS 'Logs every WOD generation attempt for observability and debugging';