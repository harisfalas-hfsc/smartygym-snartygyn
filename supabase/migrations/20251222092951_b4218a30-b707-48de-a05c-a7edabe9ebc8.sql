-- Create storage bucket for app store assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-store-assets', 'app-store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create app_store_assets table to track generated assets
CREATE TABLE IF NOT EXISTS public.app_store_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL, -- 'icon', 'feature-graphic', 'screenshot'
  platform TEXT NOT NULL, -- 'ios', 'android', 'both'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  storage_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_store_assets ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admins can manage app store assets"
ON public.app_store_assets
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_app_store_assets_updated_at
BEFORE UPDATE ON public.app_store_assets
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Storage policies for app-store-assets bucket
CREATE POLICY "Admins can upload app store assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'app-store-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update app store assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'app-store-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete app store assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'app-store-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view app store assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'app-store-assets');