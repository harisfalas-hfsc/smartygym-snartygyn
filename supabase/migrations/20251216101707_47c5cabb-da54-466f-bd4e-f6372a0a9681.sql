-- Create exercise_library_videos table
CREATE TABLE public.exercise_library_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_video_id TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercise_library_videos ENABLE ROW LEVEL SECURITY;

-- Public read access for visible videos
CREATE POLICY "Anyone can view visible videos"
ON public.exercise_library_videos
FOR SELECT
USING (is_visible = true);

-- Admin full access
CREATE POLICY "Admins can manage all videos"
ON public.exercise_library_videos
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_exercise_library_videos_updated_at
BEFORE UPDATE ON public.exercise_library_videos
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();