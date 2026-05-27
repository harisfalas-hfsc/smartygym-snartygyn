
-- Allow anon to call the visible programs/workouts metadata RPCs (read-only, already filters to is_visible=true)
GRANT EXECUTE ON FUNCTION public.get_visible_program_metadata(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_visible_workout_metadata(text) TO anon;

-- Allow anon to read published blog articles (slug + dates only needed for sitemap, but full read is acceptable since they're public posts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_articles'
      AND policyname = 'Anyone can read published blog articles'
  ) THEN
    CREATE POLICY "Anyone can read published blog articles"
      ON public.blog_articles FOR SELECT
      TO anon, authenticated
      USING (is_published = true);
  END IF;
END $$;

GRANT SELECT ON public.blog_articles TO anon;
