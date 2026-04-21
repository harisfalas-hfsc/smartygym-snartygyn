CREATE TABLE public.blog_article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id uuid REFERENCES blog_articles(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);
ALTER TABLE public.blog_article_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reads" ON public.blog_article_views
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reads" ON public.blog_article_views
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);