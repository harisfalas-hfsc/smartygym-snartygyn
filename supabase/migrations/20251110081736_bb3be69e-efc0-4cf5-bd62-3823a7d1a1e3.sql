-- Create blog_articles table
CREATE TABLE public.blog_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('Fitness', 'Wellness', 'Nutrition')),
  image_url text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  read_time text,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published articles
CREATE POLICY "Anyone can view published articles"
ON public.blog_articles
FOR SELECT
USING (is_published = true);

-- Only admins can insert articles
CREATE POLICY "Only admins can insert articles"
ON public.blog_articles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update articles
CREATE POLICY "Only admins can update articles"
ON public.blog_articles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete articles
CREATE POLICY "Only admins can delete articles"
ON public.blog_articles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_articles_updated_at
BEFORE UPDATE ON public.blog_articles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();