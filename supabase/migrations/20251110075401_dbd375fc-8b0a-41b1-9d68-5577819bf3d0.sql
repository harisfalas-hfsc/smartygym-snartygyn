-- Create a table to track email campaigns sent (to avoid duplicates)
CREATE TABLE IF NOT EXISTS public.email_campaign_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  email_id TEXT
);

-- Enable RLS
ALTER TABLE public.email_campaign_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view campaign logs
CREATE POLICY "Only admins can view campaign logs"
ON public.email_campaign_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_email_campaign_log_user_type ON public.email_campaign_log(user_id, campaign_type);
CREATE INDEX idx_email_campaign_log_sent_at ON public.email_campaign_log(sent_at);