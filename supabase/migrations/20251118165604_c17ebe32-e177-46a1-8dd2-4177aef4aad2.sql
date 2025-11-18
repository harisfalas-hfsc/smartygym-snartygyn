-- Create notification_audit_log table for tracking all sent notifications
CREATE TABLE IF NOT EXISTS notification_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('manual', 'automated', 'scheduled')),
  message_type TEXT NOT NULL,
  sent_by UUID REFERENCES auth.users(id),
  recipient_filter TEXT,
  recipient_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE notification_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin-only access
CREATE POLICY "Only admins can view notification audit log"
  ON notification_audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert notification audit log"
  ON notification_audit_log FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for better query performance
CREATE INDEX idx_notification_audit_sent_at ON notification_audit_log(sent_at DESC);
CREATE INDEX idx_notification_audit_type ON notification_audit_log(notification_type);

-- Set up cron job for scheduled notifications (runs every 5 minutes)
SELECT cron.schedule(
  'send-scheduled-notifications-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-scheduled-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno'
    ),
    body := jsonb_build_object('time', now()::text)
  ) AS request_id;
  $$
);

-- Set up cron job for renewal reminders (runs daily at 9 AM UTC)
SELECT cron.schedule(
  'send-renewal-reminders-job',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-renewal-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno'
    ),
    body := jsonb_build_object('time', now()::text)
  ) AS request_id;
  $$
);