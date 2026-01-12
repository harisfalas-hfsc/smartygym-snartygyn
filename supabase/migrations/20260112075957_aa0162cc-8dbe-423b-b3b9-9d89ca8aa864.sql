-- Create email delivery log table for tracking individual email sends
CREATE TABLE public.email_delivery_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message_type TEXT NOT NULL,
  to_email TEXT NOT NULL,
  user_id UUID,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  error_message TEXT,
  resend_id TEXT,
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.email_delivery_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read this table (no public access)
CREATE POLICY "Admins can view email delivery logs"
  ON public.email_delivery_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND (p.notification_preferences->>'is_admin')::boolean = true
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_email_delivery_log_email ON public.email_delivery_log(to_email);
CREATE INDEX idx_email_delivery_log_sent_at ON public.email_delivery_log(sent_at DESC);
CREATE INDEX idx_email_delivery_log_status ON public.email_delivery_log(status);