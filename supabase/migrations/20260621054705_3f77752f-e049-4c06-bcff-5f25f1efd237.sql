-- Unwrap <strong>...</strong> wrappers around bullet-line content while
-- preserving section titles (which use <u> inside <strong>) and round/block
-- headers that end with a colon (e.g. "8 Rounds of:").
--
-- The pattern matches <strong>X</strong> where X contains no '<' (so titles
-- with <u> are skipped) and does not end with ':' (so headers are skipped).

UPDATE public.admin_workouts
SET main_workout = regexp_replace(
      main_workout,
      '<strong>([^<:][^<]*[^<:]|[^<:])</strong>',
      '\1',
      'g'
    ),
    updated_at = now()
WHERE main_workout ~ '<strong>([^<:][^<]*[^<:]|[^<:])</strong>';

UPDATE public.admin_workouts
SET finisher = regexp_replace(
      finisher,
      '<strong>([^<:][^<]*[^<:]|[^<:])</strong>',
      '\1',
      'g'
    ),
    updated_at = now()
WHERE finisher IS NOT NULL
  AND finisher ~ '<strong>([^<:][^<]*[^<:]|[^<:])</strong>';
