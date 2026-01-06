-- Add new message type for new category announcements
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'new_category_announcement';