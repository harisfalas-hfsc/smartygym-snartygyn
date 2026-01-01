-- Phase 3: Clean up duplicate templates - keep only one default per message_type
-- For each message_type with multiple defaults, keep the most recently updated one as default

-- Fix morning_wod: keep 9f9de2a0-0494-4aac-8a27-bf7695c5ffe1 (most recent)
UPDATE automated_message_templates 
SET is_default = false 
WHERE message_type = 'morning_wod' 
AND id != '9f9de2a0-0494-4aac-8a27-bf7695c5ffe1';

-- Fix morning_wod_recovery: keep 062a2634-b670-4129-891c-1e3e4f72877b (most recent)
UPDATE automated_message_templates 
SET is_default = false 
WHERE message_type = 'morning_wod_recovery' 
AND id != '062a2634-b670-4129-891c-1e3e4f72877b';

-- Fix morning_ritual: keep 42612602-64e0-4d04-bae0-6cd0e4bbdf31 (most recent)
UPDATE automated_message_templates 
SET is_default = false 
WHERE message_type = 'morning_ritual' 
AND id != '42612602-64e0-4d04-bae0-6cd0e4bbdf31';

-- Fix announcement_update: keep 791029d8-9558-4be6-8059-bf337c19e34a (most recent)
UPDATE automated_message_templates 
SET is_default = false 
WHERE message_type = 'announcement_update' 
AND id != '791029d8-9558-4be6-8059-bf337c19e34a';

-- Fix welcome: keep 37ddad16-ed20-4198-915c-5b007bafb965 (most recent)
UPDATE automated_message_templates 
SET is_default = false 
WHERE message_type = 'welcome' 
AND id != '37ddad16-ed20-4198-915c-5b007bafb965';

-- Add partial unique index to prevent future duplicates (only one default per message_type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_per_message_type 
ON automated_message_templates (message_type) 
WHERE is_default = true;

-- Add channel-specific columns for Phase 5
ALTER TABLE automated_message_templates 
ADD COLUMN IF NOT EXISTS dashboard_subject text,
ADD COLUMN IF NOT EXISTS dashboard_content text,
ADD COLUMN IF NOT EXISTS email_subject text,
ADD COLUMN IF NOT EXISTS email_content text;

-- Copy existing content to both channels as starting point
UPDATE automated_message_templates 
SET dashboard_subject = subject,
    dashboard_content = content,
    email_subject = subject,
    email_content = content
WHERE dashboard_subject IS NULL;