
-- 1. workout_of_day_state: remove public SELECT policy (admin policy + service role remain)
DROP POLICY IF EXISTS "Anyone can view WOD schedule state" ON public.workout_of_day_state;

-- 2. testimonials: create a public view excluding user_id, restrict base table SELECT to owners + admins
CREATE OR REPLACE VIEW public.testimonials_public
WITH (security_invoker = true) AS
SELECT id, display_name, rating, testimonial_text, created_at, updated_at
FROM public.testimonials;

GRANT SELECT ON public.testimonials_public TO anon, authenticated;

-- Replace the broad public read with owner + admin read on base table
DROP POLICY IF EXISTS "Anyone can view testimonials" ON public.testimonials;

CREATE POLICY "Owners and admins can view testimonials"
ON public.testimonials
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow the public view to read all testimonials regardless of RLS:
-- Use a SECURITY DEFINER wrapper since security_invoker view will respect RLS.
DROP VIEW IF EXISTS public.testimonials_public;

CREATE OR REPLACE FUNCTION public.get_public_testimonials()
RETURNS TABLE (
  id uuid,
  display_name text,
  rating integer,
  testimonial_text text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, display_name, rating, testimonial_text, created_at, updated_at
  FROM public.testimonials
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_testimonials() TO anon, authenticated;

-- Function for public rating aggregates (used on home/coach pages)
CREATE OR REPLACE FUNCTION public.get_testimonial_rating_stats()
RETURNS TABLE (
  count bigint,
  average numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint AS count,
         COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS average
  FROM public.testimonials;
$$;

GRANT EXECUTE ON FUNCTION public.get_testimonial_rating_stats() TO anon, authenticated;
