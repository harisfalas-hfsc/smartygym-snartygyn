-- Admin SELECT bypass policies (idempotent)

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_subscriptions' AND policyname='Admins can view all subscriptions') THEN
    CREATE POLICY "Admins can view all subscriptions"
      ON public.user_subscriptions FOR SELECT
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_purchases' AND policyname='Admins can view all purchases') THEN
    CREATE POLICY "Admins can view all purchases"
      ON public.user_purchases FOR SELECT
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins can view all profiles') THEN
    CREATE POLICY "Admins can view all profiles"
      ON public.profiles FOR SELECT
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='social_media_analytics' AND policyname='Admins can view all analytics') THEN
    CREATE POLICY "Admins can view all analytics"
      ON public.social_media_analytics FOR SELECT
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;