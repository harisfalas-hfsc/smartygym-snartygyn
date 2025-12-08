-- Fix notification_audit_log constraint to allow daily_ritual, wod, welcome, renewal notification types
ALTER TABLE notification_audit_log 
DROP CONSTRAINT notification_audit_log_notification_type_check;

ALTER TABLE notification_audit_log 
ADD CONSTRAINT notification_audit_log_notification_type_check 
CHECK (notification_type = ANY (ARRAY['manual', 'automated', 'scheduled', 'daily_ritual', 'wod', 'welcome', 'renewal', 'content_notification']));