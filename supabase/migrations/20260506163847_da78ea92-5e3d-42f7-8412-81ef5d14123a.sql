
DROP FUNCTION IF EXISTS public.get_public_testimonials();

CREATE OR REPLACE FUNCTION public.get_public_testimonials()
RETURNS TABLE (
  id uuid,
  display_name text,
  rating integer,
  testimonial_text text,
  created_at timestamptz,
  updated_at timestamptz,
  is_mine boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    t.display_name,
    t.rating,
    t.testimonial_text,
    t.created_at,
    t.updated_at,
    (auth.uid() IS NOT NULL AND t.user_id = auth.uid()) AS is_mine
  FROM public.testimonials t
  ORDER BY t.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_testimonials() TO anon, authenticated;
