-- Drop old constraint
ALTER TABLE user_activity_log DROP CONSTRAINT IF EXISTS valid_content_type;

-- Add new constraint with 'measurement'
ALTER TABLE user_activity_log ADD CONSTRAINT valid_content_type 
CHECK (content_type = ANY (ARRAY['workout'::text, 'program'::text, 'personal_training'::text, 'tool'::text, 'measurement'::text]));