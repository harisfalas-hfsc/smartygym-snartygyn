-- Add generated_for_date column to track pre-generated WODs
ALTER TABLE public.admin_workouts 
ADD COLUMN IF NOT EXISTS generated_for_date date NULL;

-- Add index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_admin_workouts_generated_for_date 
ON public.admin_workouts (generated_for_date) 
WHERE generated_for_date IS NOT NULL;

-- Comment explaining purpose
COMMENT ON COLUMN public.admin_workouts.generated_for_date IS 'The date this WOD was generated FOR (for pre-generation). NULL means it was generated on its created_at date.';