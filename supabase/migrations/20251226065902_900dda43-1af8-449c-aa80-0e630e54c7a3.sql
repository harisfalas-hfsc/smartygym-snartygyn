-- Create cron_job_metadata table for storing job descriptions and configuration
CREATE TABLE public.cron_job_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  edge_function_name TEXT,
  request_body JSONB DEFAULT '{}'::jsonb,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cron_job_metadata ENABLE ROW LEVEL SECURITY;

-- Only admins can manage cron job metadata
CREATE POLICY "Admins can manage cron job metadata"
ON public.cron_job_metadata
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_cron_job_metadata_updated_at
BEFORE UPDATE ON public.cron_job_metadata
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert metadata for existing cron jobs
INSERT INTO public.cron_job_metadata (job_name, display_name, description, category, edge_function_name, is_critical) VALUES
('archive-old-wods-midnight', 'Archive Old WODs', 'Archives workout of the day entries older than 30 days to keep the database clean and performant.', 'maintenance', 'archive-old-wods', false),
('generate-workout-of-day-midnight', 'Generate Workout of Day', 'Automatically generates a new AI-powered workout of the day at midnight.', 'content_generation', 'generate-workout-of-day', true),
('send-automated-messages-job', 'Send Automated Messages', 'Processes and sends scheduled automated messages (dashboard notifications and emails) to users.', 'notifications', 'send-automated-messages', true),
('send-renewal-reminders-daily', 'Send Renewal Reminders', 'Sends email reminders to users whose subscriptions are about to expire.', 'notifications', 'send-renewal-reminders', true),
('send-scheduled-notifications-job', 'Send Scheduled Notifications', 'Processes and sends scheduled push notifications and emails at their designated times.', 'notifications', 'send-scheduled-notifications', true),
('send-scheduled-emails-job', 'Send Scheduled Emails', 'Processes and sends scheduled email campaigns to targeted user groups.', 'notifications', 'send-scheduled-emails', true),
('cleanup-old-rate-limits', 'Cleanup Rate Limits', 'Removes expired rate limit entries to maintain database performance.', 'maintenance', 'cleanup-rate-limits', false),
('refresh-seo-metadata-weekly', 'Refresh SEO Metadata', 'Weekly refresh of SEO metadata for all content to ensure search optimization.', 'maintenance', 'refresh-seo-metadata', false),
('send-workout-reminders-job', 'Send Workout Reminders', 'Sends reminder notifications to users about their scheduled workouts.', 'notifications', 'send-workout-reminders', true),
('generate-daily-ritual-job', 'Generate Daily Ritual', 'Generates daily Smarty Rituals content for users.', 'content_generation', 'generate-daily-ritual', true),
('send-checkin-reminders-job', 'Send Check-in Reminders', 'Sends morning and evening check-in reminders to users.', 'notifications', 'send-checkin-reminders', true),
('run-system-health-audit-daily', 'Run System Health Audit', 'Daily automated system health check that validates all critical functions.', 'maintenance', 'run-system-health-audit', true),
('sync-stripe-subscriptions-job', 'Sync Stripe Subscriptions', 'Synchronizes subscription status with Stripe to ensure data consistency.', 'maintenance', 'sync-stripe-subscriptions', true),
('cleanup-expired-sessions', 'Cleanup Expired Sessions', 'Removes expired user sessions and tokens from the database.', 'maintenance', 'cleanup-sessions', false),
('send-monday-motivation-job', 'Send Monday Motivation', 'Sends weekly motivational messages to users every Monday.', 'notifications', 'send-monday-motivation', false),
('send-weekly-activity-summary-job', 'Send Weekly Activity Summary', 'Sends weekly activity summary emails to users on Sundays.', 'notifications', 'send-weekly-activity-summary', false),
('process-pending-notifications-job', 'Process Pending Notifications', 'Processes pending content notifications for new workouts and programs.', 'notifications', 'process-pending-notifications', true)
ON CONFLICT (job_name) DO NOTHING;