-- Add new message types to the enum
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'announcement_new_workout';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'announcement_new_program';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'announcement_new_service';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'announcement_special_offer';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'announcement_update';
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'announcement_event';