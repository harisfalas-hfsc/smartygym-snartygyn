UPDATE public.admin_workouts
SET main_workout =
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(main_workout,
                '<strong>(\d+)\.\s+', '<strong>', 'g'),
              '(<p[^>]*>)(\d+)\.\s+', '\1', 'g'),
            '<strong>([^<]+)</p>', '<strong>\1</strong></p>', 'g'),
          '(\([a-zA-Z ]+\))(\s*\1)+', '\1', 'g'),
        '(\}\})(\s*\([a-zA-Z ]+\))(\s*\2)+', '\1\2', 'g'),
    updated_at = now()
WHERE main_workout IS NOT NULL
  AND (
    main_workout ~ '<strong>\d+\.\s' OR
    main_workout ~ '<p[^>]*>\d+\.\s' OR
    main_workout ~ '<strong>[^<]+</p>' OR
    main_workout ~ '(\([a-zA-Z ]+\))\s*\1'
  );
