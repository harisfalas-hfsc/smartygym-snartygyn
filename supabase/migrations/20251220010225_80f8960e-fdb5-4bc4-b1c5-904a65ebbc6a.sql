-- Update ALL existing users' notification_preferences to include the new keys
-- This uses jsonb_build_object to merge new defaults with existing preferences
-- Existing explicit settings are preserved, only missing keys get defaults

UPDATE public.profiles
SET notification_preferences = COALESCE(notification_preferences, '{}'::jsonb) || jsonb_build_object(
  -- Dashboard notifications (default true if not set)
  'dashboard_wod', COALESCE((notification_preferences->>'dashboard_wod')::boolean, true),
  'dashboard_ritual', COALESCE((notification_preferences->>'dashboard_ritual')::boolean, true),
  'dashboard_new_workout', COALESCE((notification_preferences->>'dashboard_new_workout')::boolean, true),
  'dashboard_new_program', COALESCE((notification_preferences->>'dashboard_new_program')::boolean, true),
  'dashboard_new_article', COALESCE((notification_preferences->>'dashboard_new_article')::boolean, true),
  'dashboard_weekly_activity', COALESCE((notification_preferences->>'dashboard_weekly_activity')::boolean, true),
  'dashboard_monday_motivation', COALESCE((notification_preferences->>'dashboard_monday_motivation')::boolean, true),
  'dashboard_checkin_reminders', COALESCE((notification_preferences->>'dashboard_checkin_reminders')::boolean, true),
  -- Email notifications (default true if not set)
  'email_wod', COALESCE((notification_preferences->>'email_wod')::boolean, true),
  'email_ritual', COALESCE((notification_preferences->>'email_ritual')::boolean, true),
  'email_new_workout', COALESCE((notification_preferences->>'email_new_workout')::boolean, true),
  'email_new_program', COALESCE((notification_preferences->>'email_new_program')::boolean, true),
  'email_new_article', COALESCE((notification_preferences->>'email_new_article')::boolean, true),
  'email_weekly_activity', COALESCE((notification_preferences->>'email_weekly_activity')::boolean, true),
  'email_monday_motivation', COALESCE((notification_preferences->>'email_monday_motivation')::boolean, true),
  'email_checkin_reminders', COALESCE((notification_preferences->>'email_checkin_reminders')::boolean, true),
  -- Push notification master toggle (default true if not set)
  'push', COALESCE((notification_preferences->>'push')::boolean, true),
  -- Opt-out all (default false if not set)
  'opt_out_all', COALESCE((notification_preferences->>'opt_out_all')::boolean, false)
)
WHERE notification_preferences IS NULL 
   OR NOT (notification_preferences ? 'dashboard_wod')
   OR NOT (notification_preferences ? 'email_wod');