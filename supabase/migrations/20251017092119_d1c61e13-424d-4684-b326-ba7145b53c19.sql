-- Create subscription status enum
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due');

-- Create plan type enum
CREATE TYPE plan_type AS ENUM ('free', 'gold', 'platinum');

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type plan_type NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create plan_generation_usage table
CREATE TABLE public.plan_generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('workout', 'training_program', 'diet_plan')),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  month_year TEXT NOT NULL
);

-- Enable RLS on plan_generation_usage
ALTER TABLE public.plan_generation_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for plan_generation_usage
CREATE POLICY "Users can view their own usage"
  ON public.plan_generation_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.plan_generation_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX idx_plan_generation_usage_user_id ON public.plan_generation_usage(user_id);
CREATE INDEX idx_plan_generation_usage_month_year ON public.plan_generation_usage(month_year);
CREATE INDEX idx_plan_generation_usage_user_month ON public.plan_generation_usage(user_id, month_year);

-- Trigger to update updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();