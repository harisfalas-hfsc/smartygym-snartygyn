-- Add new message types for morning and evening check-in reminders
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'checkin_reminder_morning';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'checkin_reminder_evening';