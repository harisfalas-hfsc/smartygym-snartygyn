CREATE OR REPLACE FUNCTION public._repair_naked_v3(content text, default_rx text)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $fn$
DECLARE
  parts text[];
  out_parts text[] := '{}';
  p text;
  visible text;
  current_rx text;
  lower_p text;
BEGIN
  IF content IS NULL OR content = '' THEN
    RETURN content;
  END IF;
  parts := string_to_array(content, '</li>');
  current_rx := default_rx;
  FOREACH p IN ARRAY parts LOOP
    lower_p := lower(p);
    -- track section headers inside consolidated blobs
    IF lower_p ~ '(warm.?up|activation)' AND lower_p ~ '<h[1-6]' THEN
      current_rx := '30 sec';
    ELSIF lower_p ~ 'cool.?down' AND lower_p ~ '<h[1-6]' THEN
      current_rx := '30 sec hold';
    ELSIF lower_p ~ 'finisher' AND lower_p ~ '<h[1-6]' THEN
      current_rx := '3 x 10';
    ELSIF lower_p ~ '(main|workout)' AND lower_p ~ '<h[1-6]' THEN
      current_rx := default_rx;
    END IF;

    IF p ~ '\{\{exercise:' THEN
      visible := regexp_replace(regexp_replace(p, '\{\{exercise:[^}]*\}\}', '', 'g'), '<[^>]*>', '', 'g');
      IF visible !~ '[0-9]' THEN
        -- inject prescription right after the last exercise token in this line
        p := regexp_replace(p, '(\{\{exercise:[^}]*\}\})(?!.*\{\{exercise:)', '\1 — ' || current_rx, '');
      END IF;
    END IF;
    out_parts := array_append(out_parts, p);
  END LOOP;
  RETURN array_to_string(out_parts, '</li>');
END;
$fn$;

UPDATE public.admin_workouts
SET
  main_workout = public._repair_naked_v3(main_workout, '3 x 12'),
  warm_up      = public._repair_naked_v3(warm_up, '30 sec'),
  activation   = public._repair_naked_v3(activation, '30 sec'),
  finisher     = public._repair_naked_v3(finisher, '3 x 10'),
  cool_down    = public._repair_naked_v3(cool_down, '30 sec hold'),
  updated_at   = now()
WHERE coalesce(is_visible, true) = true
  AND id IN (
    SELECT DISTINCT id
    FROM admin_workouts,
    LATERAL (VALUES (main_workout),(warm_up),(activation),(finisher),(cool_down)) AS f(content),
    LATERAL unnest(string_to_array(coalesce(content,''), '</li>')) AS line
    WHERE coalesce(is_visible, true) = true
      AND line ~ '\{\{exercise:'
      AND regexp_replace(regexp_replace(line, '\{\{exercise:[^}]*\}\}', '', 'g'), '<[^>]*>', '', 'g') !~ '[0-9]'
  );

DROP FUNCTION public._repair_naked_v3(text, text);