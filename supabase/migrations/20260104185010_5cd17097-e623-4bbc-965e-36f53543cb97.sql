-- Create contact_message_history table to store conversation threads
CREATE TABLE public.contact_message_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_message_id UUID NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('original', 'auto_reply', 'admin_response', 'customer_reply')),
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'system', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_message_history ENABLE ROW LEVEL SECURITY;

-- Admin can read all message history
CREATE POLICY "Admins can read message history" ON public.contact_message_history
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin can insert message history
CREATE POLICY "Admins can insert message history" ON public.contact_message_history
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role policy for edge functions to insert auto-replies
CREATE POLICY "Service role can insert message history" ON public.contact_message_history
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Create index for faster lookups by contact_message_id
CREATE INDEX idx_contact_message_history_message_id ON public.contact_message_history(contact_message_id);
CREATE INDEX idx_contact_message_history_created_at ON public.contact_message_history(created_at);