-- Add new message types for morning notifications
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'morning_wod';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'morning_wod_recovery';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'morning_ritual';