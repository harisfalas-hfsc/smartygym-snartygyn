-- First, drop the existing check constraint and recreate with 'checkin' included
ALTER TABLE user_activity_log DROP CONSTRAINT IF EXISTS valid_content_type;

-- Add the new constraint with 'checkin' as a valid type
ALTER TABLE user_activity_log ADD CONSTRAINT valid_content_type 
  CHECK (content_type IN ('workout', 'program', 'personal_training', 'tool', 'measurement', 'checkin'));