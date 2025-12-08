-- Create corporate plan type enum
CREATE TYPE public.corporate_plan_type AS ENUM ('dynamic', 'power', 'elite', 'enterprise');

-- Create corporate_subscriptions table
CREATE TABLE public.corporate_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  organization_name TEXT NOT NULL,
  plan_type public.corporate_plan_type NOT NULL,
  max_users INTEGER NOT NULL,
  current_users_count INTEGER NOT NULL DEFAULT 0,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create corporate_members table
CREATE TABLE public.corporate_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_subscription_id UUID NOT NULL REFERENCES public.corporate_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.corporate_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for corporate_subscriptions
-- Admins can do everything
CREATE POLICY "Platform admins can manage all corporate subscriptions"
ON public.corporate_subscriptions
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Corporate admins can view their own subscription
CREATE POLICY "Corporate admins can view own subscription"
ON public.corporate_subscriptions
FOR SELECT
USING (auth.uid() = admin_user_id);

-- Corporate admins can update their own subscription (for org name)
CREATE POLICY "Corporate admins can update own subscription"
ON public.corporate_subscriptions
FOR UPDATE
USING (auth.uid() = admin_user_id);

-- RLS Policies for corporate_members
-- Platform admins can do everything
CREATE POLICY "Platform admins can manage all corporate members"
ON public.corporate_members
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Corporate admins can view their own members
CREATE POLICY "Corporate admins can view own members"
ON public.corporate_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.corporate_subscriptions cs
    WHERE cs.id = corporate_subscription_id
    AND cs.admin_user_id = auth.uid()
  )
);

-- Corporate admins can add members to their subscription
CREATE POLICY "Corporate admins can add members"
ON public.corporate_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.corporate_subscriptions cs
    WHERE cs.id = corporate_subscription_id
    AND cs.admin_user_id = auth.uid()
    AND cs.status = 'active'
    AND cs.current_users_count < cs.max_users
    AND now() < cs.current_period_end
  )
);

-- Corporate admins can delete their own members
CREATE POLICY "Corporate admins can delete members"
ON public.corporate_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.corporate_subscriptions cs
    WHERE cs.id = corporate_subscription_id
    AND cs.admin_user_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_corporate_subscriptions_admin ON public.corporate_subscriptions(admin_user_id);
CREATE INDEX idx_corporate_members_subscription ON public.corporate_members(corporate_subscription_id);
CREATE INDEX idx_corporate_members_user ON public.corporate_members(user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_corporate_subscriptions_updated_at
  BEFORE UPDATE ON public.corporate_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();