-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage templates
CREATE POLICY "Only admins can manage email templates"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default templates
INSERT INTO public.email_templates (name, subject, body, category) VALUES
(
  'Welcome Email',
  'Welcome to SmartyGym! 🎉',
  'Hello {{name}}!

Welcome to SmartyGym, your ultimate fitness companion! We''re thrilled to have you join our community of fitness enthusiasts.

Here''s what you can expect:
• Access to premium workout programs
• Personalized training plans
• Expert guidance and support
• A community of like-minded individuals

Ready to start your fitness journey? Log in to your dashboard and explore our workout library!

If you have any questions, we''re here to help.

Best regards,
The SmartyGym Team',
  'welcome'
),
(
  'Subscription Renewal Reminder',
  'Your SmartyGym Subscription is Renewing Soon',
  'Hi {{name}},

Your SmartyGym {{plan_type}} subscription will renew on {{renewal_date}}.

Your continued membership includes:
• Unlimited access to all premium workouts
• New programs added monthly
• Priority customer support
• Community forum access

No action needed - your subscription will automatically renew.

To manage your subscription or update payment details, visit your account settings.

Keep crushing those fitness goals!

Best,
The SmartyGym Team',
  'renewal'
),
(
  'Special Offer',
  'Exclusive Offer: Upgrade Your Fitness Journey! 🌟',
  'Hey {{name}},

We have an exclusive offer just for you!

For a limited time, upgrade to our Platinum membership and get:
• 20% off your first 3 months
• Access to exclusive workout programs
• One-on-one coaching sessions
• Premium nutrition guides

This offer expires in 7 days, so don''t miss out!

Click here to upgrade now and take your fitness to the next level.

Questions? Reply to this email - we''re here to help!

Cheers,
The SmartyGym Team',
  'promotion'
),
(
  'Subscription Expired',
  'We Miss You at SmartyGym!',
  'Hi {{name}},

Your SmartyGym subscription has expired, and we miss you!

Your fitness journey doesn''t have to stop here. Renew your membership today and get back to:
• Your favorite workout programs
• Tracking your progress
• Connecting with the community
• Achieving your fitness goals

Renew now and pick up right where you left off.

We hope to see you back soon!

Best,
The SmartyGym Team',
  'reactivation'
),
(
  'New Feature Announcement',
  'Exciting New Feature: {{feature_name}}',
  'Hello {{name}},

We''ve just launched something amazing, and you''re one of the first to know!

Introducing: {{feature_name}}

{{feature_description}}

This new feature is now available in your dashboard. Log in to check it out!

We''re always working to make SmartyGym better for you. Have feedback? We''d love to hear it!

Happy training,
The SmartyGym Team',
  'announcement'
);
