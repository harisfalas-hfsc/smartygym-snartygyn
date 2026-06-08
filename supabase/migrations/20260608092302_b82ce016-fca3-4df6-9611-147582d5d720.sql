
-- Restrict owners from modifying admin-controlled fields on contact_messages
CREATE OR REPLACE FUNCTION public.protect_contact_message_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  -- Non-admin owners may not change admin-controlled fields
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.category IS DISTINCT FROM OLD.category
     OR NEW.response IS DISTINCT FROM OLD.response
     OR NEW.responded_at IS DISTINCT FROM OLD.responded_at
     OR NEW.responded_by IS DISTINCT FROM OLD.responded_by
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.name IS DISTINCT FROM OLD.name
     OR NEW.subject IS DISTINCT FROM OLD.subject
     OR NEW.message IS DISTINCT FROM OLD.message
  THEN
    RAISE EXCEPTION 'Only administrators can modify these fields on contact messages';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_contact_message_admin_fields_trg ON public.contact_messages;
CREATE TRIGGER protect_contact_message_admin_fields_trg
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.protect_contact_message_admin_fields();
