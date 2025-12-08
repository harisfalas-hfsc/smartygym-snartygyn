-- Drop and recreate the notification_type check constraint to include all types
ALTER TABLE public.notification_audit_log DROP CONSTRAINT IF EXISTS notification_audit_log_notification_type_check;

ALTER TABLE public.notification_audit_log ADD CONSTRAINT notification_audit_log_notification_type_check 
CHECK (notification_type IN ('welcome', 'purchase', 'renewal', 'cancellation', 'announcement', 'reminder', 'content_notification', 'wod', 'daily_ritual', 'monday_motivation', 'subscription_renewal', 'subscription_expiration', 'subscription_change', 'first_purchase', 'automated'));