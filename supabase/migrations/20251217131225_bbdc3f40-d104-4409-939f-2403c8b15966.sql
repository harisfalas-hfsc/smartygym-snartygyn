-- Add ritual_reminder_event_ids column to user_calendar_connections
ALTER TABLE public.user_calendar_connections
ADD COLUMN IF NOT EXISTS ritual_reminder_event_ids JSONB DEFAULT NULL;