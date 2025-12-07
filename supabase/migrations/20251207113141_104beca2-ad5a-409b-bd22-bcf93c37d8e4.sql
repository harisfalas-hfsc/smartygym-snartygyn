-- Create storage bucket for ritual images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ritual-images', 'ritual-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Anyone can view ritual images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ritual-images');

-- Create policy for admin upload access
CREATE POLICY "Admins can upload ritual images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ritual-images');