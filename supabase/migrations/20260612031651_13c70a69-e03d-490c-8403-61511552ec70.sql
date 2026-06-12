
-- Repair "naked" exercise tokens inside admin_workouts.main_workout
-- A naked line = <li> containing {{exercise:...}} with NO digits anywhere in the li.
-- We inject a default prescription based on the nearest preceding section header emoji.

CREATE OR REPLACE FUNCTION public._repair_naked_exercises(blob text)
RETURNS text
LANGUAGE plpgsql
AS $fn$
DECLARE
  result text := '';
  remaining text := COALESCE(blob, '');
  m_start int;
  m_end int;
  m_text text;
  current_section text := 'main';
  default_dose text;
  li_re text := '<li[^>]*>.*?</li>';
  header_re text := '(🧽|🔥|💪|⚡|🧘|🌡|🏁|🎯|🌬|🪷|❄|🌿)[[:space:]]*<strong>?<u>?[[:space:]]*([^<]+)';
  next_li int;
  next_h int;
  hdr_match text[];
  header_label text;
BEGIN
  IF remaining IS NULL OR remaining = '' THEN RETURN blob; END IF;

  LOOP
    -- find next header and next li
    next_h := NULL;
    next_li := NULL;

    -- Probe positions using regexp_matches with positions emulated via substring index search
    SELECT position(substring(remaining FROM header_re) IN remaining) INTO next_h
      WHERE substring(remaining FROM header_re) IS NOT NULL;
    SELECT position(substring(remaining FROM li_re) IN remaining) INTO next_li
      WHERE substring(remaining FROM li_re) IS NOT NULL;

    IF next_h IS NULL AND next_li IS NULL THEN
      result := result || remaining;
      EXIT;
    END IF;

    IF next_h IS NOT NULL AND (next_li IS NULL OR next_h < next_li) THEN
      m_text := substring(remaining FROM header_re);
      m_start := next_h;
      m_end := m_start + length(m_text);
      result := result || substring(remaining FROM 1 FOR m_end - 1);
      -- classify
      hdr_match := regexp_match(m_text, header_re);
      header_label := lower(COALESCE(hdr_match[2], ''));
      current_section := CASE
        WHEN header_label ~ '(warm|tissue)' THEN 'warmup'
        WHEN header_label ~ '(activ|prime)' THEN 'activation'
        WHEN header_label ~ '(cool|restorat|parasymp|down)' THEN 'cooldown'
        WHEN header_label ~ 'finish' THEN 'finisher'
        ELSE 'main'
      END;
      remaining := substring(remaining FROM m_end);
    ELSE
      m_text := substring(remaining FROM li_re);
      m_start := next_li;
      m_end := m_start + length(m_text);
      result := result || substring(remaining FROM 1 FOR m_start - 1);
      IF m_text ~ '\{\{exercise:' AND m_text !~ '[0-9]' THEN
        default_dose := CASE current_section
          WHEN 'warmup' THEN '30 sec '
          WHEN 'activation' THEN '30 sec '
          WHEN 'cooldown' THEN '30 sec hold '
          WHEN 'finisher' THEN '3 x 10 '
          ELSE '3 x 12 '
        END;
        m_text := regexp_replace(m_text, '(\{\{exercise:[^}]+\}\})', default_dose || E'\\1');
      END IF;
      result := result || m_text;
      remaining := substring(remaining FROM m_end);
    END IF;
  END LOOP;

  RETURN result;
END;
$fn$;

UPDATE public.admin_workouts
SET main_workout = public._repair_naked_exercises(main_workout)
WHERE is_visible = true
  AND main_workout ~ '\{\{exercise:';

DROP FUNCTION public._repair_naked_exercises(text);
