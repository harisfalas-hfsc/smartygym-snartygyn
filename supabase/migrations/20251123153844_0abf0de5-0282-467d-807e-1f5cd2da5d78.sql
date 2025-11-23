
-- Temporarily disable trigger, update notifications, then re-enable
-- This is needed because the trigger expects an updated_at column that doesn't exist

-- Disable the trigger
ALTER TABLE scheduled_notifications DISABLE TRIGGER update_scheduled_notifications_updated_at;

-- Mark all pending push notifications as failed
UPDATE scheduled_notifications 
SET status = 'failed', 
    error_message = 'Push notification system removed - feature discontinued'
WHERE status = 'pending';

-- Re-enable the trigger
ALTER TABLE scheduled_notifications ENABLE TRIGGER update_scheduled_notifications_updated_at;
