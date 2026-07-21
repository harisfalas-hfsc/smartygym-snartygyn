WITH challenge_parts AS (
  SELECT
    id,
    main_workout,
    substring(main_workout from 1 for position('💪' in main_workout) - 1) AS before_work,
    substring(
      main_workout
      from position('💪' in main_workout)
      for CASE
        WHEN position('🧘' in substring(main_workout from position('💪' in main_workout))) > 0
          THEN position('🧘' in substring(main_workout from position('💪' in main_workout))) - 1
        ELSE char_length(main_workout)
      END
    ) AS work_blocks,
    CASE
      WHEN position('🧘' in substring(main_workout from position('💪' in main_workout))) > 0
        THEN substring(
          main_workout
          from position('💪' in main_workout) + position('🧘' in substring(main_workout from position('💪' in main_workout))) - 1
        )
      ELSE ''
    END AS after_work
  FROM public.admin_workouts
  WHERE upper(category) = 'CHALLENGE'
    AND main_workout IS NOT NULL
    AND position('💪' in main_workout) > 0
    AND COALESCE(id, '') NOT ILIKE '%HFSC%'
    AND COALESCE(name, '') NOT ILIKE '%HFSC%'
), cleaned AS (
  SELECT
    id,
    main_workout AS old_main_workout,
    before_work || replace(work_blocks, '{{exercise:1271:chest and front of shoulder stretch}}', '{{exercise:3305:barbell thruster}}') || after_work AS new_main_workout
  FROM challenge_parts
)
UPDATE public.admin_workouts aw
SET main_workout = c.new_main_workout,
    updated_at = now()
FROM cleaned c
WHERE aw.id = c.id
  AND c.new_main_workout IS DISTINCT FROM c.old_main_workout;