-- Allow all users (including logged-out visitors) to read WOD scheduling state
-- This table contains only scheduling metadata (no PII) and is required for the WOD page schedule display.

CREATE POLICY "Anyone can view WOD schedule state"
ON public.workout_of_day_state
FOR SELECT
USING (true);