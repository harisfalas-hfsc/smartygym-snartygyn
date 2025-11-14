-- Update default inactivity timeout to 24 hours (1440 minutes)
UPDATE system_settings 
SET setting_value = '1440',
    updated_at = now()
WHERE setting_key = 'inactivity_timeout_minutes';

-- Add custom_session_duration column to profiles table for "Remember Me" functionality
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS custom_session_duration INTEGER DEFAULT NULL;

COMMENT ON COLUMN profiles.custom_session_duration IS 
'Custom inactivity timeout in minutes for this user (for "Remember Me" functionality). NULL = use system default, 43200 = 30 days';