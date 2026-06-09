ALTER TABLE public.contact_message_history
DROP CONSTRAINT IF EXISTS contact_message_history_message_type_check;

ALTER TABLE public.contact_message_history
ADD CONSTRAINT contact_message_history_message_type_check
CHECK (message_type IN ('original', 'auto_reply', 'admin_response', 'customer_reply', 'ai_response'));

COMMENT ON CONSTRAINT contact_message_history_message_type_check ON public.contact_message_history IS 'Allowed conversation entry types, including automatic support replies shown in the user dashboard.';