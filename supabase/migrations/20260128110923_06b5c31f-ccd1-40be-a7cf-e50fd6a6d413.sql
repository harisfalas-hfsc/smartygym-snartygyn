-- Create unique index to prevent duplicate welcome messages per user
-- This prevents race conditions at the database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_welcome_message 
ON user_system_messages (user_id, message_type) 
WHERE message_type = 'welcome';