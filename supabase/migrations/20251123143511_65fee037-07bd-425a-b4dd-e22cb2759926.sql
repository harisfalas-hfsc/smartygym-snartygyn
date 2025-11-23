-- Add time-based scheduling columns to automated_message_templates
ALTER TABLE automated_message_templates
ADD COLUMN scheduled_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN timezone TEXT DEFAULT 'UTC',
ADD COLUMN recurrence_pattern TEXT,
ADD COLUMN recurrence_interval TEXT,
ADD COLUMN next_scheduled_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN last_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN target_audience TEXT,
ADD COLUMN status TEXT DEFAULT 'active';

-- Add check constraint for recurrence_pattern
ALTER TABLE automated_message_templates
ADD CONSTRAINT check_recurrence_pattern 
CHECK (recurrence_pattern IS NULL OR recurrence_pattern IN ('once', 'daily', 'every_2_days', 'every_3_days', 'weekly', 'custom'));

-- Add check constraint for target_audience
ALTER TABLE automated_message_templates
ADD CONSTRAINT check_target_audience 
CHECK (target_audience IS NULL OR target_audience IN ('all', 'free_users', 'premium_users'));

-- Add check constraint for status
ALTER TABLE automated_message_templates
ADD CONSTRAINT check_status 
CHECK (status IN ('active', 'paused', 'completed'));

-- Add index for efficient scheduled message queries
CREATE INDEX idx_automated_templates_scheduled 
ON automated_message_templates(next_scheduled_time, is_active, status) 
WHERE scheduled_time IS NOT NULL;

-- Add comment
COMMENT ON TABLE automated_message_templates IS 'Hybrid mode: templates can be both event-triggered (when is_default=true) and time-based scheduled (when scheduled_time IS NOT NULL)';