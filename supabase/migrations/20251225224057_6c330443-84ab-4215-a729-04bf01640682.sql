-- Create table to store WOD auto-generation configuration
CREATE TABLE public.wod_auto_generation_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled boolean NOT NULL DEFAULT true,
  generation_hour_utc integer NOT NULL DEFAULT 3,
  paused_until timestamp with time zone NULL,
  pause_reason text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Only allow one config row
CREATE UNIQUE INDEX wod_auto_generation_config_single_row ON public.wod_auto_generation_config ((true));

-- Enable RLS
ALTER TABLE public.wod_auto_generation_config ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view WOD config"
ON public.wod_auto_generation_config
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update WOD config"
ON public.wod_auto_generation_config
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert WOD config"
ON public.wod_auto_generation_config
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default configuration
INSERT INTO public.wod_auto_generation_config (is_enabled, generation_hour_utc)
VALUES (true, 3);

-- Create trigger for updated_at
CREATE TRIGGER update_wod_auto_generation_config_updated_at
BEFORE UPDATE ON public.wod_auto_generation_config
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();