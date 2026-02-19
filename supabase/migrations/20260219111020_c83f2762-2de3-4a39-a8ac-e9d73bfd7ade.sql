ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_sent boolean DEFAULT false;

-- Mark all existing users as having received welcome
UPDATE profiles SET welcome_sent = true;