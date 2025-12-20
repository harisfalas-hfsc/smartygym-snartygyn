-- Update default notification preferences for profiles table
-- This ensures all new users have all toggles set to ON by default

ALTER TABLE public.profiles 
ALTER COLUMN notification_preferences 
SET DEFAULT '{
  "opt_out_all": false,
  "push": true,
  "email_wod": true,
  "email_ritual": true,
  "email_monday_motivation": true,
  "email_new_workout": true,
  "email_new_program": true,
  "email_new_article": true,
  "email_weekly_activity": true,
  "email_checkin_reminders": true,
  "dashboard_wod": true,
  "dashboard_ritual": true,
  "dashboard_monday_motivation": true,
  "dashboard_new_workout": true,
  "dashboard_new_program": true,
  "dashboard_new_article": true,
  "dashboard_weekly_activity": true,
  "dashboard_checkin_reminders": true
}'::jsonb;