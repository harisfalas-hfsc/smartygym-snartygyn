-- Create trigger function on auth.users for email confirmation
CREATE OR REPLACE FUNCTION public.trigger_welcome_email_on_confirm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_sent boolean;
  profile_record record;
BEGIN
  -- Only proceed if email_confirmed_at transitioned from NULL to NOT NULL
  IF (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
     AND NEW.email_confirmed_at IS NOT NULL THEN

    -- Idempotency check: skip if already sent
    SELECT welcome_sent INTO already_sent
    FROM public.profiles
    WHERE user_id = NEW.id;

    IF already_sent IS NOT TRUE THEN
      -- Build a record-like jsonb mimicking the profile shape send-welcome-email expects
      SELECT * INTO profile_record FROM public.profiles WHERE user_id = NEW.id;

      PERFORM net.http_post(
        url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-welcome-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno'
        ),
        body := jsonb_build_object(
          'record', jsonb_build_object(
            'user_id', NEW.id,
            'full_name', COALESCE(profile_record.full_name, ''),
            'email', NEW.email
          )
        )
      );

      UPDATE public.profiles SET welcome_sent = true WHERE user_id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;

CREATE TRIGGER on_auth_user_email_confirmed
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.trigger_welcome_email_on_confirm();

-- Backfill: trigger welcome email for users confirmed in last 30 days who never received it
DO $$
DECLARE
  u record;
  p record;
BEGIN
  FOR u IN
    SELECT au.id, au.email
    FROM auth.users au
    JOIN public.profiles pr ON pr.user_id = au.id
    WHERE au.email_confirmed_at IS NOT NULL
      AND au.created_at > now() - interval '30 days'
      AND COALESCE(pr.welcome_sent, false) = false
  LOOP
    SELECT * INTO p FROM public.profiles WHERE user_id = u.id;

    PERFORM net.http_post(
      url := 'https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno'
      ),
      body := jsonb_build_object(
        'record', jsonb_build_object(
          'user_id', u.id,
          'full_name', COALESCE(p.full_name, ''),
          'email', u.email
        )
      )
    );

    UPDATE public.profiles SET welcome_sent = true WHERE user_id = u.id;
  END LOOP;
END $$;