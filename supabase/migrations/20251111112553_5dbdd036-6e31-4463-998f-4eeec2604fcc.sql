-- Add attachments column to contact_messages
ALTER TABLE public.contact_messages
ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;

-- Create response_templates table
CREATE TABLE public.response_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on response_templates
ALTER TABLE public.response_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage response templates
CREATE POLICY "Only admins can manage response templates"
  ON public.response_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_response_templates_updated_at
  BEFORE UPDATE ON public.response_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comment
COMMENT ON TABLE public.response_templates IS 'Stores reusable response templates for contact messages';

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message attachments
CREATE POLICY "Anyone can upload message attachments"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'message-attachments');

CREATE POLICY "Users can view their own message attachments"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'message-attachments' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      has_role(auth.uid(), 'admin'::app_role)
    )
  );

CREATE POLICY "Admins can delete message attachments"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'message-attachments' AND has_role(auth.uid(), 'admin'::app_role));