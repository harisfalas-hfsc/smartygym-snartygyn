-- Create automation_rules table for centralized automation configuration
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('event', 'scheduled')),
  automation_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('signup', 'purchase', 'subscription_renewal', 'cron')),
  trigger_config JSONB DEFAULT '{}'::jsonb,
  message_type TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all_users',
  is_active BOOLEAN DEFAULT true,
  sends_email BOOLEAN DEFAULT true,
  sends_dashboard_message BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  next_trigger_at TIMESTAMPTZ,
  total_executions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Only admins can manage automation rules
CREATE POLICY "Only admins can manage automation rules"
  ON automation_rules
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_automation_rules_automation_key ON automation_rules(automation_key);
CREATE INDEX idx_automation_rules_is_active ON automation_rules(is_active);

-- Seed initial automation rules
INSERT INTO automation_rules (automation_key, rule_type, name, description, trigger_type, trigger_config, message_type, target_audience, is_active, sends_email, sends_dashboard_message) VALUES
(
  'welcome_message',
  'event',
  'Welcome Message',
  'Sent to new users 5 minutes after signup to welcome them to SmartyGym',
  'signup',
  '{"delay_minutes": 5}'::jsonb,
  'welcome',
  'new_users',
  true,
  true,
  true
),
(
  'weekly_motivation',
  'scheduled',
  'Weekly Motivation',
  'Sent every Monday at 10:00 AM UTC to keep users motivated',
  'cron',
  '{"schedule": "0 10 * * 1", "timezone": "UTC", "description": "Every Monday at 10:00 AM"}'::jsonb,
  'motivational_weekly',
  'all_users',
  true,
  true,
  true
),
(
  'renewal_reminder',
  'scheduled',
  'Renewal Reminder',
  'Sent 3 days before subscription expires at 10:00 AM UTC',
  'cron',
  '{"schedule": "0 10 * * *", "timezone": "UTC", "description": "Daily at 10:00 AM", "condition": "3 days before expiry"}'::jsonb,
  'renewal_reminder',
  'expiring_subscribers',
  true,
  true,
  true
),
(
  'renewal_confirmation',
  'event',
  'Renewal Confirmation',
  'Sent 5 minutes after successful subscription renewal payment',
  'subscription_renewal',
  '{"delay_minutes": 5}'::jsonb,
  'renewal_thank_you',
  'renewed_subscribers',
  true,
  true,
  true
),
(
  'purchase_confirmation_subscription',
  'event',
  'Subscription Purchase Confirmation',
  'Sent immediately after Gold/Platinum subscription purchase',
  'purchase',
  '{"delay_minutes": 0, "purchase_type": "subscription"}'::jsonb,
  'purchase_subscription',
  'new_subscribers',
  true,
  true,
  true
),
(
  'purchase_confirmation_workout',
  'event',
  'Workout Purchase Confirmation',
  'Sent immediately after standalone workout purchase',
  'purchase',
  '{"delay_minutes": 0, "purchase_type": "workout"}'::jsonb,
  'purchase_workout',
  'workout_purchasers',
  true,
  true,
  true
),
(
  'purchase_confirmation_program',
  'event',
  'Program Purchase Confirmation',
  'Sent immediately after standalone training program purchase',
  'purchase',
  '{"delay_minutes": 0, "purchase_type": "program"}'::jsonb,
  'purchase_program',
  'program_purchasers',
  true,
  true,
  true
),
(
  'purchase_confirmation_personal_training',
  'event',
  'Personal Training Purchase Confirmation',
  'Sent immediately after personal training purchase',
  'purchase',
  '{"delay_minutes": 0, "purchase_type": "personal_training"}'::jsonb,
  'purchase_personal_training',
  'personal_training_purchasers',
  true,
  true,
  true
);

-- Add updated_at trigger
CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();