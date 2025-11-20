-- Add updated_at column to contact_messages so update triggers can run safely
ALTER TABLE public.contact_messages
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();