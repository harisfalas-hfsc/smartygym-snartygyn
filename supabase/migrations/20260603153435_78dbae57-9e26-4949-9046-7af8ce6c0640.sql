UPDATE public.exercises
SET description = TRIM(BOTH FROM regexp_replace(description, '\s*\|\s*SmartyGym.*$', '', 'i'))
WHERE description ~* '\|\s*SmartyGym';