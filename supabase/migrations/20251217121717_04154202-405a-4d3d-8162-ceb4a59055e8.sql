-- Add column to store Google Calendar event IDs for check-in reminders
ALTER TABLE public.user_calendar_connections 
ADD COLUMN IF NOT EXISTS checkin_reminder_event_ids JSONB DEFAULT NULL;