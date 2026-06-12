CREATE OR REPLACE FUNCTION public._fix_rx_sections(content text, default_rx text)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $fn$
DECLARE
  parts text[];
  out_parts text[] := '{}';
  p text;
  plain text;
  current_rx text;
BEGIN
  IF content IS NULL OR content = '' THEN
    RETURN content;
  END IF;
  parts := string_to_array(content, '</li>');
  current_rx := default_rx;
  FOREACH p IN ARRAY parts LOOP
    plain := lower(regexp_replace(p, '<[^>]*>', ' ', 'g'));
    IF plain ~ '(warm.?up|activation)' AND p ~ '<(h[1-6]|strong)' THEN
      current_rx := '30 sec';
    ELSIF plain ~ 'cool.?down' AND p ~ '<(h[1-6]|strong)' THEN
      current_rx := '30 sec hold';
    ELSIF plain ~ 'finisher' AND p ~ '<(h[1-6]|strong)' THEN
      current_rx := '3 x 10';
    ELSIF plain ~ '(main workout|the workout|workout)' AND p ~ '<(h[1-6]|strong)' AND plain !~ '(warm|cool|finisher|activation)' THEN
      current_rx := default_rx;
    END IF;

    -- only rewrite lines carrying our auto-injected marker
    IF p ~ '\{\{exercise:[^}]*\}\} — (3 x 12|3 x 10|30 sec hold|30 sec)' THEN
      p := regexp_replace(p, '(\{\{exercise:[^}]*\}\}) — (3 x 12|3 x 10|30 sec hold|30 sec)', '\1 — ' || current_rx, 'g');
    END IF;
    out_parts := array_append(out_parts, p);
  END LOOP;
  RETURN array_to_string(out_parts, '</li>');
END;
$fn$;

UPDATE public.admin_workouts
SET
  main_workout = public._fix_rx_sections(main_workout, '3 x 12'),
  warm_up      = public._fix_rx_sections(warm_up, '30 sec'),
  activation   = public._fix_rx_sections(activation, '30 sec'),
  finisher     = public._fix_rx_sections(finisher, '3 x 10'),
  cool_down    = public._fix_rx_sections(cool_down, '30 sec hold'),
  updated_at   = now()
WHERE coalesce(is_visible, true) = true
  AND (coalesce(main_workout,'') || coalesce(warm_up,'') || coalesce(activation,'') || coalesce(finisher,'') || coalesce(cool_down,''))
      ~ '\{\{exercise:[^}]*\}\} — (3 x 12|3 x 10|30 sec hold|30 sec)';

DROP FUNCTION public._fix_rx_sections(text, text);