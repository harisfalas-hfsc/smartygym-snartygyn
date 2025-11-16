-- Add unique constraint on user_id and device_type combination
ALTER TABLE push_subscriptions 
  ADD CONSTRAINT push_subscriptions_user_device_unique 
  UNIQUE (user_id, device_type);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
  ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active 
  ON push_subscriptions(is_active) 
  WHERE is_active = true;