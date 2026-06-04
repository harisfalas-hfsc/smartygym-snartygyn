CREATE OR REPLACE FUNCTION public.ensure_ritual_morning_greeting()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  plain_text text;
BEGIN
  plain_text := trim(regexp_replace(COALESCE(NEW.morning_content, ''), '<[^>]*>', '', 'g'));

  IF NEW.morning_content IS NOT NULL
     AND plain_text !~* '^\s*(🌅\s*)?Good morning, Smarty\b' THEN
    NEW.morning_content := '<p class="tiptap-paragraph">🌅 Good morning, Smarty! Let''s begin with intention, energy, and care for your body.</p>' || NEW.morning_content;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_ritual_morning_greeting_trigger ON public.daily_smarty_rituals;
CREATE TRIGGER ensure_ritual_morning_greeting_trigger
BEFORE INSERT OR UPDATE OF morning_content ON public.daily_smarty_rituals
FOR EACH ROW
EXECUTE FUNCTION public.ensure_ritual_morning_greeting();

UPDATE public.daily_smarty_rituals
SET morning_content = '<p class="tiptap-paragraph">🌅 Good morning, Smarty! Let''s begin with intention, energy, and care for your body.</p>' || morning_content
WHERE is_visible IS TRUE
  AND morning_content IS NOT NULL
  AND trim(regexp_replace(COALESCE(morning_content, ''), '<[^>]*>', '', 'g')) !~* '^\s*(🌅\s*)?Good morning, Smarty\b';