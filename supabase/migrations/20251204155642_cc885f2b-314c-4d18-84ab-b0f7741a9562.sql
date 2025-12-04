-- Clean up duplicate trigger
DROP TRIGGER IF EXISTS on_profile_created_welcome ON public.profiles;