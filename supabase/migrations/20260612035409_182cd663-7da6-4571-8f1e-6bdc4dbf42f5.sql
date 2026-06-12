-- Stop auto-prepending the morning greeting on new/updated rituals
DROP TRIGGER IF EXISTS ensure_ritual_morning_greeting_trigger ON public.daily_smarty_rituals;
DROP FUNCTION IF EXISTS public.ensure_ritual_morning_greeting() CASCADE;
DROP FUNCTION IF EXISTS public.normalize_ritual_morning_content(text) CASCADE;