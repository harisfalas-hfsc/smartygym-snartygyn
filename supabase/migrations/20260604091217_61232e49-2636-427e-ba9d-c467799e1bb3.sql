CREATE OR REPLACE FUNCTION public.normalize_ritual_morning_content(_content text)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  normalized text := COALESCE(_content, '');
  plain_text text;
  previous text;
BEGIN
  IF trim(normalized) = '' THEN
    RETURN normalized;
  END IF;

  LOOP
    previous := normalized;
    plain_text := trim(regexp_replace(normalized, '<[^>]*>', '', 'g'));
    EXIT WHEN plain_text !~* '^(🌅[[:space:]]*)?Good morning, Smarty';

    normalized := regexp_replace(
      normalized,
      '^[[:space:]]*(<p[^>]*>[[:space:]]*)?(🌅[[:space:]]*)?Good morning, Smarty!?[^<]*(</p>)?[[:space:]]*',
      '',
      'i'
    );

    EXIT WHEN normalized = previous;
  END LOOP;

  RETURN '<p class="tiptap-paragraph">🌅 Good morning, Smarty! Let''s begin with intention, energy, and care for your body.</p>' || normalized;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_ritual_morning_greeting()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.morning_content := public.normalize_ritual_morning_content(NEW.morning_content);
  RETURN NEW;
END;
$$;

UPDATE public.daily_smarty_rituals
SET morning_content = public.normalize_ritual_morning_content(morning_content)
WHERE is_visible IS TRUE
  AND morning_content IS NOT NULL;