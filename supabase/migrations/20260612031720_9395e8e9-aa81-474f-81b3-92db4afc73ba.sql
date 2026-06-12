
CREATE OR REPLACE FUNCTION public._repair_naked_v2(blob text)
RETURNS text
LANGUAGE plpgsql
AS $fn$
DECLARE
  parts text[];
  i int;
  seg text;
  out text := '';
BEGIN
  IF blob IS NULL OR blob = '' THEN RETURN blob; END IF;
  parts := string_to_array(blob, '</li>');
  FOR i IN 1 .. array_length(parts, 1) LOOP
    seg := parts[i];
    IF seg ~ '\{\{exercise:' AND seg !~ '[0-9]' THEN
      seg := regexp_replace(seg, '(\{\{exercise:[^}]+\}\})', '3 x 12 \1');
    END IF;
    IF i < array_length(parts, 1) THEN
      out := out || seg || '</li>';
    ELSE
      out := out || seg;
    END IF;
  END LOOP;
  RETURN out;
END;
$fn$;

UPDATE public.admin_workouts
SET main_workout = public._repair_naked_v2(main_workout),
    warm_up = public._repair_naked_v2(warm_up),
    activation = public._repair_naked_v2(activation),
    finisher = public._repair_naked_v2(finisher),
    cool_down = public._repair_naked_v2(cool_down)
WHERE is_visible = true;

DROP FUNCTION public._repair_naked_v2(text);
