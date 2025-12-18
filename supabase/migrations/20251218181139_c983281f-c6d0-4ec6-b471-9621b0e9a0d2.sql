-- Create promotional_videos table with version history
CREATE TABLE public.promotional_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  component_name TEXT DEFAULT 'sample',
  component_code TEXT,
  video_url TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES public.promotional_videos(id) ON DELETE SET NULL,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotional_videos ENABLE ROW LEVEL SECURITY;

-- Only admins can manage promotional videos
CREATE POLICY "Admins can manage promotional videos"
ON public.promotional_videos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view current videos (for public gallery if needed)
CREATE POLICY "Anyone can view current promotional videos"
ON public.promotional_videos
FOR SELECT
USING (is_current = true);

-- Create index for faster queries
CREATE INDEX idx_promotional_videos_current ON public.promotional_videos(is_current) WHERE is_current = true;
CREATE INDEX idx_promotional_videos_parent ON public.promotional_videos(parent_version_id);

-- Add trigger for updated_at
CREATE TRIGGER update_promotional_videos_updated_at
BEFORE UPDATE ON public.promotional_videos
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert the default sample video
INSERT INTO public.promotional_videos (name, description, duration, component_name, is_current)
VALUES ('Sample', 'Reference template video - 8 scenes showcasing SmartyGym brand', '20-25 sec', 'sample', true);