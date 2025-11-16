-- Enable realtime for user_system_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_system_messages;

-- Enable realtime for contact_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;