-- Create SEO metadata table for storing generated SEO data
CREATE TABLE public.seo_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'workout', 'program', 'blog', 'ritual', 'page'
  content_id TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  json_ld JSONB,
  image_alt_text TEXT,
  internal_links TEXT[],
  last_refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(content_type, content_id)
);

-- Create SEO refresh log table for tracking refresh history
CREATE TABLE public.seo_refresh_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  refresh_type TEXT NOT NULL, -- 'weekly', 'manual', 'content_update'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  items_scanned INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  sitemap_generated BOOLEAN DEFAULT false,
  error_message TEXT,
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_refresh_log ENABLE ROW LEVEL SECURITY;

-- RLS policies - only service role can manage SEO data
CREATE POLICY "Only service role can manage SEO metadata"
ON public.seo_metadata FOR ALL
USING (false)
WITH CHECK (false);

CREATE POLICY "Only service role can manage SEO refresh log"
ON public.seo_refresh_log FOR ALL
USING (false)
WITH CHECK (false);

-- Index for faster lookups
CREATE INDEX idx_seo_metadata_content ON public.seo_metadata(content_type, content_id);
CREATE INDEX idx_seo_refresh_log_type ON public.seo_refresh_log(refresh_type, started_at DESC);