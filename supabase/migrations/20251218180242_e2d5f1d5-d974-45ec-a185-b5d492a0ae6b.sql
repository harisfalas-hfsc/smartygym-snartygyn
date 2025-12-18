-- Create storage bucket for promotional videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('promotional-videos', 'promotional-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to promotional videos
CREATE POLICY "Public can view promotional videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'promotional-videos');

-- Allow admins to upload promotional videos
CREATE POLICY "Admins can upload promotional videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'promotional-videos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update promotional videos
CREATE POLICY "Admins can update promotional videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'promotional-videos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete promotional videos
CREATE POLICY "Admins can delete promotional videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'promotional-videos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);