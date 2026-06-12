
-- ============================================================
-- A. CRON ORPHAN REMOVAL
-- ============================================================
DO $$
BEGIN
  -- Unschedule orphan cron jobs if they exist
  BEGIN
    PERFORM cron.unschedule('process-strength-library-item-every-minute');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    PERFORM cron.unschedule('send-scheduled-notifications-job');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

DELETE FROM public.cron_job_metadata
WHERE job_name IN (
  'process-strength-library-item-every-minute',
  'send-scheduled-notifications-job'
);

UPDATE public.cron_job_metadata
SET display_name = 'Daily System Health Audit'
WHERE job_name = 'wod-post-generation-audit';

-- ============================================================
-- B. INACTIVE DUPLICATE TEMPLATES (kept active default per type)
-- ============================================================
DELETE FROM public.automated_message_templates
WHERE is_active = false
  AND is_default = false
  AND template_name IN (
    'Daily WOD & Ritual Notification',
    'Plan Change Notification',
    'Morning WOD Notification',
    'Recovery Day WOD Notification',
    'Morning Ritual Notification'
  );

-- ============================================================
-- C. LEGACY INACTIVE AUTOMATION RULES (replaced by morning_daily_digest)
-- ============================================================
DELETE FROM public.automation_rules
WHERE is_active = false
  AND automation_key IN (
    'workout_of_day',
    'daily_ritual',
    'morning_ritual_notification',
    'morning_wod_notification',
    'morning_wod_recovery_notification'
  );

-- ============================================================
-- D. FIX MIS-TYPED new_addition RULE
-- ============================================================
ALTER TABLE public.automation_rules
  DROP CONSTRAINT IF EXISTS automation_rules_trigger_type_check;

ALTER TABLE public.automation_rules
  ADD CONSTRAINT automation_rules_trigger_type_check
  CHECK (trigger_type = ANY (ARRAY[
    'signup'::text,
    'purchase'::text,
    'subscription_renewal'::text,
    'cron'::text,
    'event'::text,
    'content_published'::text
  ]));

UPDATE public.automation_rules
SET trigger_type = 'content_published',
    rule_type = 'event',
    description = 'Fires from pending_content_notifications when a new workout/program/article becomes visible'
WHERE automation_key = 'new_addition';

-- ============================================================
-- E. PARITY ENFORCEMENT
-- ============================================================
UPDATE public.automation_rules
SET sends_dashboard_message = true
WHERE automation_key = 'reengagement_email';

-- ============================================================
-- F. ADD sends_push COLUMN (3-channel parity)
-- ============================================================
ALTER TABLE public.automation_rules
  ADD COLUMN IF NOT EXISTS sends_push boolean NOT NULL DEFAULT true;

-- ============================================================
-- G. NEW AUTOMATION RULES (scheduled workout/program reminders)
-- ============================================================
INSERT INTO public.automation_rules (
  rule_type, automation_key, name, description,
  trigger_type, message_type, target_audience,
  is_active, sends_email, sends_dashboard_message, sends_push
) VALUES
  ('scheduled', 'scheduled_workout_reminder',
   'Scheduled Workout Reminder',
   'Reminds the user about a workout they scheduled in their calendar.',
   'cron', 'announcement_update', 'scheduled_users',
   true, true, true, true),
  ('scheduled', 'scheduled_program_reminder',
   'Scheduled Program Reminder',
   'Reminds the user about a training program day they scheduled.',
   'cron', 'announcement_update', 'scheduled_users',
   true, true, true, true)
ON CONFLICT (automation_key) DO NOTHING;

-- ============================================================
-- H. NEW EDITABLE TEMPLATES (reactivation, support)
-- ============================================================
INSERT INTO public.automated_message_templates (
  message_type, template_name, subject, content,
  dashboard_subject, dashboard_content,
  email_subject, email_content,
  is_active, is_default, automation_key
) VALUES
  ('reactivation',
   'Reengagement Email',
   'We miss you at SmartyGym 💙',
   'Hi {{name}},

It''s been a while since you trained with us, and we wanted to check in.

Your fitness journey matters, and we''re here to support you whenever you''re ready to come back. Here''s what''s waiting for you:

• Fresh workouts of the day (one every morning)
• New training programs designed for real life
• Your Smarty Ritual to ease back in gently

Come back any time — no pressure, just real coaching.

— Coach Haris',
   'We miss you 💙',
   'It''s been a while. Your daily WOD and Smarty Ritual are waiting whenever you''re ready to come back.',
   'We miss you at SmartyGym 💙',
   '<p>Hi {{name}},</p><p>It''s been a while since you trained with us, and we wanted to check in.</p><p>Your fitness journey matters, and we''re here whenever you''re ready to come back.</p><p>— Coach Haris</p>',
   true, true, 'reengagement_email'),
  ('support',
   'Direct Coach Reply',
   'A message from Coach Haris',
   'Hi {{name}},

{{message_body}}

— Coach Haris',
   'New message from Coach Haris',
   '{{message_preview}}',
   'A message from Coach Haris',
   '<p>Hi {{name}},</p><div>{{message_body}}</div><p>— Coach Haris</p>',
   true, true, 'direct_coach_email')
ON CONFLICT DO NOTHING;

-- ============================================================
-- I. MIGRATE notification_preferences SHAPE PER USER
-- ============================================================
UPDATE public.profiles
SET notification_preferences = jsonb_build_object(
  'opt_out_all', COALESCE((notification_preferences->>'opt_out_all')::boolean, false),
  'morning_daily_digest', jsonb_build_object(
    'email',
      COALESCE((notification_preferences->>'email_wod')::boolean, true)
      AND COALESCE((notification_preferences->>'email_ritual')::boolean, true),
    'dashboard',
      COALESCE((notification_preferences->>'dashboard_wod')::boolean, true)
      AND COALESCE((notification_preferences->>'dashboard_ritual')::boolean, true),
    'push',
      COALESCE((notification_preferences->>'push')::boolean, true)
  ),
  'monday_motivation', jsonb_build_object(
    'email',     COALESCE((notification_preferences->>'email_monday_motivation')::boolean, true),
    'dashboard', COALESCE((notification_preferences->>'dashboard_monday_motivation')::boolean, true),
    'push',      COALESCE((notification_preferences->>'push')::boolean, true)
  ),
  'new_workout', jsonb_build_object(
    'email',     COALESCE((notification_preferences->>'email_new_workout')::boolean, true),
    'dashboard', COALESCE((notification_preferences->>'dashboard_new_workout')::boolean, true),
    'push',      COALESCE((notification_preferences->>'push')::boolean, true)
  ),
  'new_program', jsonb_build_object(
    'email',     COALESCE((notification_preferences->>'email_new_program')::boolean, true),
    'dashboard', COALESCE((notification_preferences->>'dashboard_new_program')::boolean, true),
    'push',      COALESCE((notification_preferences->>'push')::boolean, true)
  ),
  'new_article', jsonb_build_object(
    'email',     COALESCE((notification_preferences->>'email_new_article')::boolean, true),
    'dashboard', COALESCE((notification_preferences->>'dashboard_new_article')::boolean, true),
    'push',      COALESCE((notification_preferences->>'push')::boolean, true)
  ),
  'weekly_activity_report', jsonb_build_object(
    'email',     COALESCE((notification_preferences->>'email_weekly_activity')::boolean, true),
    'dashboard', COALESCE((notification_preferences->>'dashboard_weekly_activity')::boolean, true),
    'push',      COALESCE((notification_preferences->>'push')::boolean, true)
  ),
  'checkin_reminder', jsonb_build_object(
    'email',     COALESCE((notification_preferences->>'email_checkin_reminders')::boolean, true),
    'dashboard', COALESCE((notification_preferences->>'dashboard_checkin_reminders')::boolean, true),
    'push',      COALESCE((notification_preferences->>'push')::boolean, true)
  ),
  'scheduled_workout_reminder', jsonb_build_object(
    'email',     COALESCE((notification_preferences->>'email_scheduled_workout_reminders')::boolean, true),
    'dashboard', true,
    'push',      COALESCE((notification_preferences->>'push')::boolean, true)
  ),
  'scheduled_program_reminder', jsonb_build_object(
    'email',     COALESCE((notification_preferences->>'email_scheduled_program_reminders')::boolean, true),
    'dashboard', true,
    'push',      COALESCE((notification_preferences->>'push')::boolean, true)
  ),
  'goal_achievement', jsonb_build_object(
    'email',     COALESCE((notification_preferences->>'email_goal_achievement')::boolean, true),
    'dashboard', true,
    'push',      COALESCE((notification_preferences->>'push')::boolean, true)
  ),
  'welcome_onboarding', jsonb_build_object(
    'email',     COALESCE((notification_preferences->>'email_welcome_onboarding')::boolean, true),
    'dashboard', true,
    'push',      COALESCE((notification_preferences->>'push')::boolean, true)
  )
)
WHERE notification_preferences IS NULL
   OR NOT (notification_preferences ? 'morning_daily_digest');

-- ============================================================
-- J. REWRITE COLUMN DEFAULT TO NEW SHAPE
-- ============================================================
ALTER TABLE public.profiles
  ALTER COLUMN notification_preferences SET DEFAULT jsonb_build_object(
    'opt_out_all', false,
    'morning_daily_digest',       jsonb_build_object('email', true, 'dashboard', true, 'push', true),
    'monday_motivation',          jsonb_build_object('email', true, 'dashboard', true, 'push', true),
    'new_workout',                jsonb_build_object('email', true, 'dashboard', true, 'push', true),
    'new_program',                jsonb_build_object('email', true, 'dashboard', true, 'push', true),
    'new_article',                jsonb_build_object('email', true, 'dashboard', true, 'push', true),
    'weekly_activity_report',     jsonb_build_object('email', true, 'dashboard', true, 'push', true),
    'checkin_reminder',           jsonb_build_object('email', true, 'dashboard', true, 'push', true),
    'scheduled_workout_reminder', jsonb_build_object('email', true, 'dashboard', true, 'push', true),
    'scheduled_program_reminder', jsonb_build_object('email', true, 'dashboard', true, 'push', true),
    'goal_achievement',           jsonb_build_object('email', true, 'dashboard', true, 'push', true),
    'welcome_onboarding',         jsonb_build_object('email', true, 'dashboard', true, 'push', true)
  );
