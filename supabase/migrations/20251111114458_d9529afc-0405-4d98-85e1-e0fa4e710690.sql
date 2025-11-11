-- Create enum for message types
CREATE TYPE message_type AS ENUM (
  'welcome',
  'purchase_workout',
  'purchase_program',
  'purchase_personal_training',
  'purchase_subscription',
  'renewal_reminder',
  'renewal_thank_you',
  'cancellation'
);

-- Create automated message templates table
CREATE TABLE public.automated_message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_type message_type NOT NULL,
  template_name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automated_message_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage templates
CREATE POLICY "Only admins can manage templates"
  ON public.automated_message_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create user system messages table
CREATE TABLE public.user_system_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type message_type NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_system_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own system messages
CREATE POLICY "Users can view their own system messages"
  ON public.user_system_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their messages as read
CREATE POLICY "Users can update their own system messages"
  ON public.user_system_messages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_automated_message_templates_updated_at
  BEFORE UPDATE ON public.automated_message_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default templates for each message type

-- Welcome messages
INSERT INTO public.automated_message_templates (message_type, template_name, subject, content, is_default) VALUES
('welcome', 'Enthusiastic Welcome', 'Welcome to SmartyGym - Your Fitness Journey Starts Now! 💪', 
'Hi there!

Welcome to SmartyGym! We''re absolutely thrilled to have you join our fitness community.

You''ve just taken the first step towards transforming your fitness, and we''re here to support you every step of the way. Whether you''re just starting out or you''re a seasoned athlete, our workouts and programs are designed to help you reach your goals.

Here''s what you can do now:
• Explore our free workouts and get started today
• Check out our training programs for structured guidance
• Use our fitness calculators to track your progress
• Join our community and share your journey

Remember, every champion was once a beginner. Let''s make this journey amazing together!

Stay strong,
The SmartyGym Team', true),

('welcome', 'Professional Welcome', 'Welcome to SmartyGym - Let''s Begin Your Transformation', 
'Hello and welcome!

Thank you for joining SmartyGym. We''re committed to helping you achieve your fitness goals with expert-designed workouts and training programs.

As a member, you have access to:
• Professionally designed workout sessions
• Structured training programs by Sports Scientist Haris Falas
• Comprehensive exercise library
• Fitness tracking tools

We recommend starting with our free workouts to get familiar with our training style. When you''re ready, explore our premium programs for more advanced training.

Your fitness journey starts now. Let''s get to work!

Best regards,
SmartyGym Team', false),

('welcome', 'Motivational Welcome', 'You''re In! Welcome to the SmartyGym Family 🎯', 
'Hey Champion!

You just made one of the best decisions for your health and fitness - welcome to SmartyGym!

This is more than just signing up. This is you saying "I''m ready to change." And we''re right here with you, every rep, every set, every victory.

Your next steps:
✓ Browse our workout library and find what excites you
✓ Set your first fitness goal in your profile
✓ Start your first workout - even 15 minutes counts!
✓ Track your progress and watch yourself grow stronger

The hardest part? You''ve already done it. You showed up. Now let''s keep that momentum going.

Your journey, our support. Let''s do this!

Coach Haris & The SmartyGym Team', false);

-- Purchase workout messages
INSERT INTO public.automated_message_templates (message_type, template_name, subject, content, is_default) VALUES
('purchase_workout', 'Thank You - Ready to Train', 'Thank You for Your Purchase! Your Workout is Ready 🔥', 
'Hi there!

Thank you for purchasing your workout! We''re excited to help you crush your fitness goals.

Your workout is now available in your dashboard under "My Purchases". You can access it anytime, anywhere - that''s the SmartyGym advantage!

Ready to get started?
• Review the workout structure and format
• Watch any instructional videos
• Prepare your space and equipment
• Give it your all!

Remember: Progress over perfection. Every workout brings you one step closer to your goals.

Need help? We''re always here for you. Just reach out through the Contact section.

Let''s get after it!
SmartyGym Team', true),

('purchase_workout', 'Detailed Workout Guide', 'Your Workout Purchase Confirmed - Here''s What''s Next', 
'Hello!

Thank you for your purchase. Your new workout is ready and waiting for you in your dashboard.

Here''s how to get the most out of it:

1. PREPARATION
   • Read through the entire workout first
   • Gather any required equipment
   • Ensure you have adequate space

2. EXECUTION
   • Follow the warm-up carefully to prevent injury
   • Focus on proper form over speed
   • Take breaks when needed - listen to your body

3. RECOVERY
   • Complete the cool-down section
   • Hydrate well after your session
   • Track your performance for next time

This workout was designed by Sports Scientist Haris Falas with years of experience. Trust the process and stay consistent.

Questions? Contact us anytime.

Best regards,
SmartyGym', false),

('purchase_workout', 'Motivational Purchase', 'You Did It! Your Workout is Ready - Time to Sweat! 💪', 
'Hey there!

BOOM! You just invested in yourself, and that''s what winners do. Your workout is locked and loaded in your dashboard.

Here''s the deal: You''ve got the workout. Now it''s time to show up and do the work. No excuses, no holding back. This is YOUR time.

Your workout is waiting in "My Purchases" - ready when you are.

Pro tips from Coach Haris:
→ Consistency beats intensity every time
→ Focus on form, not just finishing fast
→ Take progress photos - you''ll be amazed in 30 days
→ Share your wins with us - we love to celebrate with you!

The workout is ready. The question is: Are YOU?

Let''s GO!
Team SmartyGym', false);

-- Purchase program messages  
INSERT INTO public.automated_message_templates (message_type, template_name, subject, content, is_default) VALUES
('purchase_program', 'Program Welcome', 'Welcome to Your Training Program! Let''s Transform Together 🎯', 
'Congratulations!

You''ve just unlocked your complete training program! This is a game-changer for your fitness journey.

Your program is now available in "My Purchases" in your dashboard. This isn''t just a collection of workouts - it''s a complete, structured system designed to deliver real results over the coming weeks.

What to expect:
• Progressive training that builds on each session
• Clear weekly structure and goals
• Expert guidance from Sports Scientist Haris Falas
• Comprehensive nutrition tips
• Measurable results you can track

Getting Started:
1. Read the complete program overview
2. Understand the weekly schedule
3. Mark your calendar for training days
4. Set up your tracking system
5. Begin with Week 1!

This is your transformation roadmap. Follow it, trust the process, and you WILL see results.

Ready to begin? We''re with you every step!

SmartyGym Team', true),

('purchase_program', 'Professional Program Start', 'Your Training Program: Complete Access & Getting Started Guide', 
'Thank you for your purchase!

Your comprehensive training program is now accessible in your dashboard. This program has been professionally designed to help you achieve specific, measurable results.

Program Details:
• Duration: As specified in your program
• Structure: Progressive weekly training blocks
• Includes: Workout plans, progression strategies, nutrition guidance
• Designed by: Sports Scientist Haris Falas

Recommendations for Success:
1. Complete the Par-Q questionnaire if you haven''t already
2. Review the entire program structure before starting
3. Prepare your training schedule in advance
4. Track your workouts and progress consistently
5. Follow the progression plan as outlined

This program is evidence-based and field-tested. Consistency and adherence to the plan are key to your success.

For questions or support, contact us anytime.

Best regards,
SmartyGym', false),

('purchase_program', 'Excited Program Start', 'Your Transformation Program is LIVE! Time to Level Up! 🚀', 
'YES! You''re IN!

You just committed to a complete training program, and that takes guts. This isn''t just about workouts - this is about becoming a better, stronger, healthier version of yourself.

Your program is ready and waiting in your dashboard. This is your blueprint for the next several weeks of serious progress.

Here''s what makes this special:
✓ Not random workouts - this is a SYSTEM
✓ Each week builds on the last
✓ Designed by an expert who knows what works
✓ Everything you need in one place

Your mission (should you choose to accept it):
→ Week 1 starts NOW
→ Follow the plan exactly as written
→ Track every session
→ Don''t skip rest days (recovery = growth!)
→ Check in weekly to assess progress

The program is ready. Your future self is waiting. Let''s make them proud!

All in,
Coach Haris & SmartyGym Team', false);

-- Purchase personal training messages
INSERT INTO public.automated_message_templates (message_type, template_name, subject, content, is_default) VALUES
('purchase_personal_training', 'PT Service Confirmation', 'Your Personal Training Service - We''re Creating Your Custom Program! 🎯', 
'Thank you for choosing Personal Training!

This is where your fitness journey becomes truly personalized. We''re now working on creating a custom training program designed specifically for YOU - your goals, your lifestyle, your needs.

What happens next:
1. Our team has received your detailed questionnaire responses
2. Sports Scientist Haris Falas is reviewing your information
3. Your custom program is being designed (typically 2-3 business days)
4. You''ll receive a notification when it''s ready in your dashboard

Your program will include:
• Personalized workout structure
• Custom exercise selection based on your equipment and experience
• Specific progression plan for your goals
• Nutrition guidance tailored to your needs
• Ongoing support and adjustments

This is the highest level of service we offer, and we''re committed to your success. Your custom program will be delivered to "My Purchases" in your dashboard.

Questions while you wait? Contact us anytime!

Excited to start your journey together,
Coach Haris & SmartyGym Team', true),

('purchase_personal_training', 'Professional PT Welcome', 'Personal Training Service Confirmed - Program Development Underway', 
'Thank you for your Personal Training purchase.

Your request has been received and is currently being processed by our coaching team. This service includes a fully customized training program based on your specific information and goals.

Development Timeline:
• Questionnaire Review: Complete
• Program Design: 2-3 business days
• Delivery: Via your dashboard under "My Purchases"

What''s Included:
• Individualized training program structure
• Custom exercise selection and progressions
• Detailed weekly planning
• Nutrition recommendations
• Form guidance and training tips

Your program is being created by Sports Scientist Haris Falas, with over 20 years of experience in fitness and strength conditioning.

You will receive a notification once your program is ready.

For any questions during this process, please contact us.

Best regards,
SmartyGym Personal Training Team', false),

('purchase_personal_training', 'Exclusive PT Experience', 'Welcome to Elite Personal Training - Your Custom Program is Coming! 🏆', 
'Welcome to the ELITE level!

You''ve just unlocked the most personalized fitness experience possible. This isn''t a template. This isn''t generic. This is 100% YOURS.

Right now, Coach Haris is reviewing every detail you shared - your goals, your current fitness, your lifestyle, your limitations, your strengths. He''s crafting a program that''s perfectly designed for YOUR success.

What makes this different:
→ Zero guesswork - everything is planned for you
→ Exercises chosen specifically for YOUR body and goals
→ Progression mapped to YOUR timeline
→ Support every step of the way

Timeline:
📝 Today: We received your info
🎯 Next 2-3 days: Your program is being created
🚀 Then: Program delivered to your dashboard
💪 After: You start your transformation!

This is personal. This is powerful. This is YOUR program.

Stay tuned - something special is coming your way!

Coach Haris & Team SmartyGym', false);

-- Purchase subscription messages
INSERT INTO public.automated_message_templates (message_type, template_name, subject, content, is_default) VALUES
('purchase_subscription', 'Subscription Welcome', 'Welcome to Premium! Your Full Access Starts Now 🌟', 
'Welcome to the SmartyGym Premium family!

You''ve just unlocked EVERYTHING - unlimited access to our complete fitness platform. This is where your fitness journey really takes off!

Here''s what you now have access to:
✓ 100+ Premium Workouts - All fitness levels and styles
✓ Complete Training Programs - Structured 6-8 week plans
✓ Exercise Library - Detailed form guides and videos
✓ Fitness Tools - Calculators and tracking features
✓ Priority Support - We''re here when you need us
✓ New Content - Fresh workouts added regularly

Getting the Most Out of Your Membership:
1. Explore the workout library and find your favorites
2. Choose a training program that matches your goals
3. Set up your workout schedule
4. Track your progress consistently
5. Join the community and share your journey

You''re not just a subscriber - you''re part of our fitness family. We''re committed to helping you succeed, and we''ll be right here supporting you every step of the way.

Ready to dive in? Everything is waiting for you in your dashboard!

Let''s make this incredible,
SmartyGym Team', true),

('purchase_subscription', 'Premium Access Activated', 'Premium Membership Activated - Complete Platform Access', 
'Your Premium membership is now active!

Thank you for subscribing to SmartyGym Premium. You now have unlimited access to our complete fitness platform.

Premium Member Benefits:
• Access to 100+ premium workouts across all formats
• Complete training programs (6-8 week structured plans)
• Comprehensive exercise library with instructional content
• Advanced fitness calculators and tracking tools
• Priority customer support
• All future content and updates included

Your membership details:
• Plan: As selected during checkout
• Start Date: Today
• Access: Immediate and unlimited
• Billing: Automatic renewal

All premium content is now accessible through your dashboard. We recommend starting with our featured programs designed by Sports Scientist Haris Falas.

For subscription management (payment method, billing info, cancellation), visit your account settings.

Welcome aboard!
SmartyGym', false);

-- Renewal reminder messages
INSERT INTO public.automated_message_templates (message_type, template_name, subject, content, is_default) VALUES
('renewal_reminder', 'Friendly Reminder', 'Your Subscription Renews in 3 Days - Just a Heads Up! 📅', 
'Hi there!

This is just a friendly reminder that your SmartyGym subscription will automatically renew in 3 days.

Your Current Plan: [Plan details]
Renewal Date: [Date]
Amount: [Amount]

No action needed! Your subscription will continue seamlessly, ensuring uninterrupted access to all premium features.

Want to make changes?
• Update your payment method
• Change your subscription plan  
• Review your billing history

You can manage everything in your account settings or through your subscription management portal.

We''re grateful to have you as part of the SmartyGym community!

Keep crushing those goals,
SmartyGym Team', true),

('renewal_reminder', 'Professional Reminder', 'Subscription Renewal Notice - Action Required in 3 Days', 
'Subscription Renewal Notification

Your SmartyGym subscription is scheduled for automatic renewal in 3 days.

Renewal Details:
• Current Plan: [Plan]
• Renewal Date: [Date]
• Amount: [Amount]
• Payment Method: [Last 4 digits]

Your subscription will renew automatically unless you choose to cancel before the renewal date.

To manage your subscription:
1. Go to Account Settings
2. Select Subscription Management
3. Update, modify, or cancel as needed

If you have any questions about your subscription or billing, please contact our support team.

Thank you for your continued membership.

SmartyGym', false),

('renewal_reminder', 'Appreciative Reminder', 'Heads Up: Your Fitness Journey Continues in 3 Days! 💪', 
'Hey Champion!

Quick note: Your SmartyGym membership renews automatically in 3 days.

Here''s what that means:
→ Zero interruption to your training
→ Continued access to everything
→ Same great price
→ We stay committed to your success

Renewal: [Date]
Plan: [Your Current Plan]
Investment: [Amount]

We''ve loved being part of your fitness journey, and we''re excited to keep supporting you!

Want to make any changes? Just head to your account settings anytime.

Thanks for being awesome!

SmartyGym Team', false);

-- Renewal thank you messages
INSERT INTO public.automated_message_templates (message_type, template_name, subject, content, is_default) VALUES
('renewal_thank_you', 'Grateful Thank You', 'Thank You for Renewing! Let''s Keep Building Together 🙏', 
'Thank you!

Your subscription has been renewed, and we''re so grateful for your continued trust in SmartyGym.

Your commitment to your fitness journey inspires us to keep creating better content, better programs, and better experiences for you.

Renewed Membership Details:
• Plan: [Your Plan]
• Next Renewal: [Date]
• Access: Unlimited and uninterrupted

What''s new this period:
• [New workouts/programs recently added]
• [Any upcoming features or content]
• [Community highlights or challenges]

We''re not just here for your subscription - we''re here for your success. Every workout you complete, every goal you reach, that''s what drives us.

Thank you for being part of the SmartyGym family. Let''s make this period even better than the last!

With gratitude,
SmartyGym Team', true),

('renewal_thank_you', 'Professional Renewal Confirmation', 'Subscription Renewed - Continued Access Confirmed', 
'Subscription Renewal Confirmation

Your SmartyGym subscription has been successfully renewed.

Renewal Details:
• Plan: [Current Plan]
• Renewal Date: [Today''s Date]
• Amount Charged: [Amount]
• Next Billing Date: [Future Date]
• Receipt: Available in your account

Your premium access continues uninterrupted with full platform benefits:
• All premium workouts and programs
• Complete exercise library
• Fitness tracking tools
• Priority support

Thank you for your continued membership. We appreciate your business and commitment to fitness.

For billing questions or subscription management, visit your account settings.

Best regards,
SmartyGym', false);

-- Cancellation messages
INSERT INTO public.automated_message_templates (message_type, template_name, subject, content, is_default) VALUES
('cancellation', 'Sorry to See You Go', 'We''re Sorry to See You Go - But Your Journey Doesn''t End Here', 
'We''re sorry to see you leave.

Your subscription has been cancelled. We wanted to let you know:

• Your premium access continues until: [End Date]
• You can still use all premium features until then
• Your workout history and progress are saved
• You can reactivate anytime - we''d love to have you back!

Before you go, we''d love to hear from you:
What could we have done better? Your feedback helps us improve and serve our members better. Please take a moment to share your thoughts through our contact form.

What happens next:
→ Full access until your subscription end date
→ After that, you''ll have free member access
→ All your data remains safe in your account
→ Resubscribe anytime with one click

Whether this is "goodbye" or just "see you later," thank you for being part of SmartyGym. The door is always open.

We wish you all the best on your fitness journey!

SmartyGym Team', true),

('cancellation', 'Professional Cancellation Notice', 'Subscription Cancellation Confirmed', 
'Subscription Cancellation Confirmation

Your SmartyGym subscription cancellation has been processed.

Cancellation Details:
• Cancellation Date: [Today]
• Access Ends: [Subscription End Date]
• Final Billing: [Amount if applicable]

Important Information:
• You retain full premium access until your subscription end date
• No refunds for unused time (as per terms of service)
• Your account data is preserved
• You can resubscribe at any time

After your subscription ends:
• You will revert to free member access
• Premium workouts and programs will be locked
• Your progress and history remain in your account

To reactivate your subscription at any time, simply visit the Premium Benefits page.

Thank you for your time as a SmartyGym member.

SmartyGym', false),

('cancellation', 'Understanding Cancellation', 'We Understand - Here''s What You Need to Know', 
'We get it.

Sometimes life changes, priorities shift, or things just aren''t the right fit. No judgment - we understand.

Your cancellation is confirmed, but here''s the good news:

✓ You still have premium access until [End Date]
✓ All your workouts, programs, and progress are saved
✓ You can come back anytime - no questions asked
✓ We''ll keep improving based on feedback like yours

We''d love to know:
What made you decide to cancel? Even if it''s just "not the right time," that helps us. Your honest feedback makes SmartyGym better for everyone.

Remember:
→ You can keep training with your premium access until [Date]
→ After that, you''ll still have access to free content
→ Coming back is as easy as one click
→ We''ll be here if you need us

Thanks for giving us a try. We hope our paths cross again!

All the best,
SmartyGym Team', false);