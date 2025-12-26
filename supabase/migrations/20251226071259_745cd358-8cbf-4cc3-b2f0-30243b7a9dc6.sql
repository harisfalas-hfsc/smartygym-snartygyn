-- Add schedule-related columns to cron_job_metadata
ALTER TABLE public.cron_job_metadata 
ADD COLUMN IF NOT EXISTS schedule TEXT,
ADD COLUMN IF NOT EXISTS schedule_human_readable TEXT,
ADD COLUMN IF NOT EXISTS next_run_estimate TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Athens';

-- Update existing jobs with their schedules
UPDATE public.cron_job_metadata SET schedule = '0 0 * * *', schedule_human_readable = 'Daily at midnight (00:00 UTC)', is_active = true WHERE job_name = 'archive-old-wods-midnight';
UPDATE public.cron_job_metadata SET schedule = '0 0 * * *', schedule_human_readable = 'Daily at midnight (00:00 UTC)', is_active = true WHERE job_name = 'generate-workout-of-day-midnight';
UPDATE public.cron_job_metadata SET schedule = '*/10 * * * *', schedule_human_readable = 'Every 10 minutes', is_active = true WHERE job_name = 'send-scheduled-notifications-job';
UPDATE public.cron_job_metadata SET schedule = '0 9 * * *', schedule_human_readable = 'Daily at 9:00 AM UTC (12:00 Cyprus)', is_active = true WHERE job_name = 'send-renewal-reminders-daily';
UPDATE public.cron_job_metadata SET schedule = '*/10 * * * *', schedule_human_readable = 'Every 10 minutes', is_active = true WHERE job_name = 'send-automated-messages-job';
UPDATE public.cron_job_metadata SET schedule = '0 6 * * 1', schedule_human_readable = 'Every Monday at 6:00 AM UTC (9:00 Cyprus)', is_active = true WHERE job_name = 'send-weekly-activity-summary-monday';
UPDATE public.cron_job_metadata SET schedule = '0 6 * * 1', schedule_human_readable = 'Every Monday at 6:00 AM UTC (9:00 Cyprus)', is_active = true WHERE job_name = 'send-monday-motivation-monday';
UPDATE public.cron_job_metadata SET schedule = '0 5 * * *', schedule_human_readable = 'Daily at 5:00 AM UTC (8:00 Cyprus)', is_active = true WHERE job_name = 'send-checkin-reminders-morning';
UPDATE public.cron_job_metadata SET schedule = '0 18 * * *', schedule_human_readable = 'Daily at 6:00 PM UTC (9:00 PM Cyprus)', is_active = true WHERE job_name = 'send-checkin-reminders-evening';
UPDATE public.cron_job_metadata SET schedule = '0 3 * * *', schedule_human_readable = 'Daily at 3:00 AM UTC (6:00 Cyprus)', is_active = true WHERE job_name = 'generate-workout-of-day-daily';
UPDATE public.cron_job_metadata SET schedule = '5 22 * * *', schedule_human_readable = 'Daily at 10:05 PM UTC (1:05 AM Cyprus)', is_active = true WHERE job_name = 'generate-daily-ritual-job';
UPDATE public.cron_job_metadata SET schedule = '0 4 * * *', schedule_human_readable = 'Daily at 4:00 AM UTC (7:00 Cyprus)', is_active = true WHERE job_name = 'run-system-health-audit-daily';
UPDATE public.cron_job_metadata SET schedule = '0 5 * * *', schedule_human_readable = 'Daily at 5:00 AM UTC (8:00 Cyprus)', is_active = true WHERE job_name = 'send-wod-notification-daily';
UPDATE public.cron_job_metadata SET schedule = '30 22 * * *', schedule_human_readable = 'Daily at 10:30 PM UTC (1:30 AM Cyprus)', is_active = true WHERE job_name = 'send-ritual-notification-daily';
UPDATE public.cron_job_metadata SET schedule = '*/5 * * * *', schedule_human_readable = 'Every 5 minutes', is_active = true WHERE job_name = 'send-scheduled-emails-job';
UPDATE public.cron_job_metadata SET schedule = '0 2 * * 0', schedule_human_readable = 'Every Sunday at 2:00 AM UTC (5:00 Cyprus)', is_active = true WHERE job_name = 'refresh-seo-metadata-weekly';
UPDATE public.cron_job_metadata SET schedule = '0 1 * * *', schedule_human_readable = 'Daily at 1:00 AM UTC (4:00 Cyprus)', is_active = true WHERE job_name = 'cleanup-rate-limits-daily';