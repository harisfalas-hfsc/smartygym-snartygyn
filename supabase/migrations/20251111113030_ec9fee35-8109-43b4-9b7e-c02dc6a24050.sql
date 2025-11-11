-- Add response_read_at to track when user views admin response
ALTER TABLE public.contact_messages
ADD COLUMN response_read_at timestamp with time zone;