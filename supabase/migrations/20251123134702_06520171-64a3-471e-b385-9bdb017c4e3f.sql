-- Add recurrence support to scheduled_notifications table
ALTER TABLE scheduled_notifications
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT DEFAULT 'once',
ADD COLUMN IF NOT EXISTS recurrence_interval TEXT,
ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_scheduled_time TIMESTAMPTZ;

-- Add check constraint for recurrence_pattern
ALTER TABLE scheduled_notifications
ADD CONSTRAINT scheduled_notifications_recurrence_pattern_check
CHECK (recurrence_pattern IN ('once', 'daily', 'weekly', 'twice_weekly', 'three_times_weekly', 'custom'));

COMMENT ON COLUMN scheduled_notifications.recurrence_pattern IS 'Defines if notification repeats: once, daily, weekly, twice_weekly, three_times_weekly, custom';
COMMENT ON COLUMN scheduled_notifications.recurrence_interval IS 'For custom recurrence: interval in days (e.g., "7" for weekly)';
COMMENT ON COLUMN scheduled_notifications.last_sent_at IS 'Timestamp of last successful send for recurring notifications';
COMMENT ON COLUMN scheduled_notifications.next_scheduled_time IS 'Calculated next send time for recurring notifications';