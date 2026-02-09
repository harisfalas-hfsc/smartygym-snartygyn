CREATE POLICY "Admins can view all articles"
  ON public.blog_articles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));