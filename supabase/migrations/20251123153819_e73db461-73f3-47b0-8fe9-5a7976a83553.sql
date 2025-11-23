
-- Remove push_subscriptions table and its trigger
-- This is part of the push notification system cleanup

-- Drop trigger first
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;

-- Drop the table
DROP TABLE IF EXISTS push_subscriptions CASCADE;
