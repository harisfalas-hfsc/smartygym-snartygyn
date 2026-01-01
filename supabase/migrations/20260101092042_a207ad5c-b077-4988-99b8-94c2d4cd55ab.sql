-- Phase 1: Restore RICH templates as the default (unset placeholder templates)

-- For morning_wod: Make the RICH template (16fde8f7-8117-4cfa-9261-1f1f2137e631) the default
UPDATE automated_message_templates SET is_default = false WHERE message_type = 'morning_wod';
UPDATE automated_message_templates SET is_default = true WHERE id = '16fde8f7-8117-4cfa-9261-1f1f2137e631';

-- For morning_wod_recovery: Make the RICH template (3c10f97b-2ec4-4d2b-a93b-709e38f44bdd) the default
UPDATE automated_message_templates SET is_default = false WHERE message_type = 'morning_wod_recovery';
UPDATE automated_message_templates SET is_default = true WHERE id = '3c10f97b-2ec4-4d2b-a93b-709e38f44bdd';

-- For morning_ritual: Make the RICH template (3a5e10d5-1443-4d5a-8329-bb979805705d) the default
UPDATE automated_message_templates SET is_default = false WHERE message_type = 'morning_ritual';
UPDATE automated_message_templates SET is_default = true WHERE id = '3a5e10d5-1443-4d5a-8329-bb979805705d';

-- Optionally mark placeholder templates as inactive so they don't get picked by accident
UPDATE automated_message_templates 
SET is_active = false 
WHERE id IN (
  '9f9de2a0-0494-4aac-8a27-bf7695c5ffe1',  -- plain morning_wod
  '062a2634-b670-4129-891c-1e3e4f72877b',  -- plain morning_wod_recovery
  '42612602-64e0-4d04-bae0-6cd0e4bbdf31'   -- plain morning_ritual
);

-- Copy content to the new channel-specific fields if they're NULL (backfill)
UPDATE automated_message_templates
SET 
  dashboard_subject = COALESCE(dashboard_subject, subject),
  dashboard_content = COALESCE(dashboard_content, content),
  email_subject = COALESCE(email_subject, subject),
  email_content = COALESCE(email_content, content)
WHERE message_type IN ('morning_wod', 'morning_wod_recovery', 'morning_ritual', 'welcome', 'announcement_update');