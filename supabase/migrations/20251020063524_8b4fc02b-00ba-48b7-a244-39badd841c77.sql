-- Change fitness_goal from text to text array to support multiple goals
ALTER TABLE public.profiles 
DROP COLUMN fitness_goal;

ALTER TABLE public.profiles 
ADD COLUMN fitness_goals text[] DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.profiles.fitness_goals IS 'User fitness goals - can select multiple';