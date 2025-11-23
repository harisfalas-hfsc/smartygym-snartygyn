-- Create scheduled_emails table (mirror of scheduled_notifications for emails)
CREATE TABLE IF NOT EXISTS public.scheduled_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  target_audience TEXT NOT NULL,
  recipient_emails TEXT[],
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  status TEXT DEFAULT 'pending',
  recurrence_pattern TEXT DEFAULT 'once',
  recurrence_interval TEXT,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_scheduled_time TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage scheduled emails
CREATE POLICY "Admins can manage scheduled emails"
  ON public.scheduled_emails
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for efficient queries
CREATE INDEX idx_scheduled_emails_status_time ON public.scheduled_emails(status, next_scheduled_time);
CREATE INDEX idx_scheduled_emails_scheduled_time ON public.scheduled_emails(scheduled_time) WHERE status = 'pending';