-- Phase 4: Create automation rules for morning notifications that match what the backend uses
-- Fixed: trigger_type must be 'cron' not 'schedule'

-- Create Morning WOD Notification rule (for regular workout days)
INSERT INTO automation_rules (
  automation_key,
  rule_type,
  name,
  description,
  trigger_type,
  trigger_config,
  message_type,
  target_audience,
  is_active,
  sends_email,
  sends_dashboard_message
) VALUES (
  'morning_wod_notification',
  'scheduled',
  'Morning WOD Notification',
  'Daily workout notification sent to users when new workouts are available',
  'cron',
  '{"schedule": "0 6 * * *", "timezone": "Europe/Nicosia"}'::jsonb,
  'morning_wod',
  'subscribed_users',
  true,
  true,
  true
) ON CONFLICT (automation_key) DO UPDATE SET
  message_type = 'morning_wod',
  name = 'Morning WOD Notification';

-- Create Morning WOD Recovery Notification rule (for recovery days)
INSERT INTO automation_rules (
  automation_key,
  rule_type,
  name,
  description,
  trigger_type,
  trigger_config,
  message_type,
  target_audience,
  is_active,
  sends_email,
  sends_dashboard_message
) VALUES (
  'morning_wod_recovery_notification',
  'scheduled',
  'Morning WOD Recovery Day Notification',
  'Notification sent on recovery/rest days when no intense workout is scheduled',
  'cron',
  '{"schedule": "0 6 * * *", "timezone": "Europe/Nicosia"}'::jsonb,
  'morning_wod_recovery',
  'subscribed_users',
  true,
  true,
  true
) ON CONFLICT (automation_key) DO UPDATE SET
  message_type = 'morning_wod_recovery',
  name = 'Morning WOD Recovery Day Notification';

-- Create Morning Ritual Notification rule
INSERT INTO automation_rules (
  automation_key,
  rule_type,
  name,
  description,
  trigger_type,
  trigger_config,
  message_type,
  target_audience,
  is_active,
  sends_email,
  sends_dashboard_message
) VALUES (
  'morning_ritual_notification',
  'scheduled',
  'Morning Ritual Notification',
  'Daily Smarty Ritual notification to help users start their day mindfully',
  'cron',
  '{"schedule": "0 6 * * *", "timezone": "Europe/Nicosia"}'::jsonb,
  'morning_ritual',
  'subscribed_users',
  true,
  true,
  true
) ON CONFLICT (automation_key) DO UPDATE SET
  message_type = 'morning_ritual',
  name = 'Morning Ritual Notification';

-- Update the legacy Daily WOD & Ritual rule to clarify it's legacy
UPDATE automation_rules 
SET description = 'Legacy combined notification - individual morning_wod, morning_wod_recovery, and morning_ritual rules are now used instead'
WHERE automation_key = 'workout_of_day';

-- Mark the legacy Daily Smarty Ritual as inactive since we have the new one
UPDATE automation_rules 
SET is_active = false
WHERE automation_key = 'daily_ritual';