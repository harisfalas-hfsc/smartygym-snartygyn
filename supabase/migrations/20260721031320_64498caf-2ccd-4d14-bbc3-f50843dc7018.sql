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
    before_work ||
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(
                      replace(
                        replace(
                          replace(work_blocks,
                            '{{exercise:1512:all fours squad stretch}}', '{{exercise:0514:jump squat}}'),
                            '{{exercise:1424:seated glute stretch}}', '{{exercise:0630:mountain climber}}'),
                            '{{exercise:1511:hamstring stretch}}', '{{exercise:1160:burpee}}'),
                            '{{exercise:0643:overhead triceps stretch}}', '{{exercise:0662:push-up}}'),
                            '{{exercise:1366:upward facing dog}}', '{{exercise:0872:reverse crunch}}'),
                            '{{exercise:pigeon-stretch:Pigeon Stretch}}', '{{exercise:0630:mountain climber}}'),
                            '{{exercise:1390:seated calf stretch (male)}}', '{{exercise:0549:kettlebell swing}}'),
                            '{{exercise:cat-cow-stretch:Cat-Cow Stretch}}', '{{exercise:3305:barbell thruster}}'),
                            '{{exercise:3698:inchworm v. 2}}', '{{exercise:0549:kettlebell swing}}'),
                            '{{exercise:3304:skin the cat}}', '{{exercise:1160:burpee}}'),
                            '{{exercise:1378:calf stretch with rope}}', '{{exercise:high-knees:High Knees}}'),
                            '{{exercise:1365:upper back stretch}}', '{{exercise:3305:barbell thruster}}')
      || after_work AS new_main_workout
  FROM challenge_parts
)
UPDATE public.admin_workouts aw
SET main_workout = c.new_main_workout,
    updated_at = now()
FROM cleaned c
WHERE aw.id = c.id
  AND c.new_main_workout IS DISTINCT FROM c.old_main_workout;