-- Remove realtime for user_system_messages table
ALTER PUBLICATION supabase_realtime DROP TABLE public.user_system_messages;

-- Remove realtime for contact_messages table  
ALTER PUBLICATION supabase_realtime DROP TABLE public.contact_messages;