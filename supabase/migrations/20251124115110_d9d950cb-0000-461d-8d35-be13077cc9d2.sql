-- Insert default purchase confirmation templates (without ON CONFLICT since template_name is not unique)
INSERT INTO public.automated_message_templates (
  template_name,
  message_type,
  subject,
  content,
  is_active,
  is_default
) 
SELECT * FROM (VALUES
  (
    'Subscription Purchase Confirmation',
    'purchase_subscription'::message_type,
    'Welcome to {planName}! 🎉',
    'Congratulations on joining SmartyGym {planName}!

Your subscription is now active and you have full access to all premium content, including:
- Exclusive workouts and training programs
- Advanced fitness tools and calculators
- Priority support from Coach Haris Falas

Start exploring your new benefits right away!

Thank you for choosing SmartyGym!',
    true,
    true
  ),
  (
    'Workout Purchase Confirmation',
    'purchase_workout'::message_type,
    'Your Workout "{contentName}" is Ready! 💪',
    'Thank you for purchasing "{contentName}"!

Your workout is now available in your dashboard. You can access it anytime and track your progress.

Ready to get started? Click below to view your workout:
[View My Workout]

Keep crushing your fitness goals!',
    true,
    true
  ),
  (
    'Program Purchase Confirmation',
    'purchase_program'::message_type,
    'Your Training Program "{contentName}" is Ready! 🏋️',
    'Thank you for purchasing "{contentName}"!

Your training program is now available in your dashboard. You can start following it right away and track your progress week by week.

Ready to begin? Click below to view your program:
[View My Program]

Let''s achieve those goals together!',
    true,
    true
  ),
  (
    'Personal Training Purchase Confirmation',
    'purchase_personal_training'::message_type,
    'Your Personal Training Program is Being Created! 🎯',
    'Thank you for purchasing Personal Training by Haris Falas!

Coach Haris will create your customized training program within 48-72 hours based on the information you provided.

You will receive a notification once your program is ready. In the meantime, feel free to explore other content on SmartyGym.

Thank you for trusting us with your fitness journey!',
    true,
    true
  )
) AS v(template_name, message_type, subject, content, is_active, is_default)
WHERE NOT EXISTS (
  SELECT 1 FROM public.automated_message_templates 
  WHERE message_type = v.message_type AND is_default = true
);