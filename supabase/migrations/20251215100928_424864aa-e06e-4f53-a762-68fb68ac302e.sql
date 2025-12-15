-- Add new message types to the enum for proper notification categorization
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'daily_ritual';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'weekly_activity_report';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'wod_notification';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'checkin_reminder';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'subscription_expired';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'reactivation';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'support';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'mass_notification';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'new_workout';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'new_program';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'new_article';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'program_delivered';