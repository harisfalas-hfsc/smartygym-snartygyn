-- Insert canonical empty paragraph between sections where missing (consistency fix)
DO $$
DECLARE
  pattern text := '(</(?:ul|p)>)(<p[^>]*>\s*(?:🧽|🔥|💪|⚡|🧘))';
  replacement text := '\1<p class="tiptap-paragraph"></p>\2';
BEGIN
  UPDATE public.admin_workouts SET
    warm_up = CASE WHEN warm_up ~ pattern THEN regexp_replace(warm_up, pattern, replacement, 'g') ELSE warm_up END,
    activation = CASE WHEN activation ~ pattern THEN regexp_replace(activation, pattern, replacement, 'g') ELSE activation END,
    main_workout = CASE WHEN main_workout ~ pattern THEN regexp_replace(main_workout, pattern, replacement, 'g') ELSE main_workout END,
    finisher = CASE WHEN finisher ~ pattern THEN regexp_replace(finisher, pattern, replacement, 'g') ELSE finisher END,
    cool_down = CASE WHEN cool_down ~ pattern THEN regexp_replace(cool_down, pattern, replacement, 'g') ELSE cool_down END
  WHERE warm_up ~ pattern OR activation ~ pattern OR main_workout ~ pattern OR finisher ~ pattern OR cool_down ~ pattern;

  UPDATE public.admin_training_programs SET
    overview = CASE WHEN overview ~ pattern THEN regexp_replace(overview, pattern, replacement, 'g') ELSE overview END,
    program_structure = CASE WHEN program_structure ~ pattern THEN regexp_replace(program_structure, pattern, replacement, 'g') ELSE program_structure END,
    weekly_schedule = CASE WHEN weekly_schedule ~ pattern THEN regexp_replace(weekly_schedule, pattern, replacement, 'g') ELSE weekly_schedule END,
    progression_plan = CASE WHEN progression_plan ~ pattern THEN regexp_replace(progression_plan, pattern, replacement, 'g') ELSE progression_plan END,
    nutrition_tips = CASE WHEN nutrition_tips ~ pattern THEN regexp_replace(nutrition_tips, pattern, replacement, 'g') ELSE nutrition_tips END,
    expected_results = CASE WHEN expected_results ~ pattern THEN regexp_replace(expected_results, pattern, replacement, 'g') ELSE expected_results END
  WHERE overview ~ pattern OR program_structure ~ pattern OR weekly_schedule ~ pattern OR progression_plan ~ pattern OR nutrition_tips ~ pattern OR expected_results ~ pattern;
END $$;