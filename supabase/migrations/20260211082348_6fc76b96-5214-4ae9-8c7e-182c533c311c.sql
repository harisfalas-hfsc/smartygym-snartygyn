
-- Create promo_banners table for admin-configurable top bar promotions
CREATE TABLE public.promo_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  link_url TEXT NOT NULL DEFAULT '/workout',
  link_text TEXT NOT NULL DEFAULT 'Start Free!',
  bg_color TEXT NOT NULL DEFAULT '#0ea5e9',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Public can view active promo banners"
ON public.promo_banners
FOR SELECT
USING (is_active = true);

-- Admins can manage all banners
CREATE POLICY "Admins can manage promo banners"
ON public.promo_banners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
