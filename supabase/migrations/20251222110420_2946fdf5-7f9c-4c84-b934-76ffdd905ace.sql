-- Add unique constraint on file_path for proper upsert operations
ALTER TABLE public.app_store_assets ADD CONSTRAINT app_store_assets_file_path_key UNIQUE (file_path);

-- Create app_store_settings table for editable content
CREATE TABLE public.app_store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_name text NOT NULL DEFAULT 'SmartyGym',
  subtitle text NOT NULL DEFAULT 'Your gym reimagined anywhere, anytime',
  short_description text NOT NULL DEFAULT 'Professional fitness coaching with expert-designed workouts and training programs. Created by Sports Scientist Haris Falas.',
  keywords text NOT NULL DEFAULT 'fitness,workout,gym,training,exercise,strength,personal trainer,HIIT,muscle,weight loss,bodybuilding,cardio',
  full_description text NOT NULL DEFAULT '🏋️ TRANSFORM YOUR FITNESS WITH EXPERT GUIDANCE

SmartyGym brings professional-grade fitness coaching directly to your device. Created by Sports Scientist Haris Falas, every workout is designed with scientific precision to maximize your results.

▸ WHY SMARTYGYM?

✓ 500+ Expert-Designed Workouts
Every exercise is crafted by certified fitness professionals—not AI. Real expertise, real results.

✓ Structured Training Programs
Follow 4-12 week programs designed for progressive overload and measurable improvements.

✓ Workout Generator
Get personalized workouts tailored to your available equipment, time, and fitness goals.

✓ Complete Exercise Library
Video demonstrations and detailed instructions for every movement.

✓ Professional Fitness Tools
• Calorie Calculator
• BMR Calculator  
• One Rep Max Calculator
• Progress Tracking

✓ Workout Logbook
Track every session, monitor progress, and stay accountable.

▸ MEMBERSHIP OPTIONS

FREE TIER
• Workout of the Day
• Basic fitness tools
• Exercise library access

GOLD MEMBERSHIP
• All 500+ premium workouts
• All training programs
• Advanced progress tracking
• €9.99/month

PLATINUM MEMBERSHIP  
• Everything in Gold
• Exclusive content
• Priority support
• €89.89/year (save 25%)

▸ ABOUT THE CREATOR

Haris Falas, Sports Scientist and certified fitness professional, brings over a decade of experience in strength training, athletic performance, and body transformation. Every program in SmartyGym reflects his commitment to evidence-based training.

▸ START TODAY

Download SmartyGym and experience the difference that expert coaching makes. Your transformation begins now.

Questions? Contact us at support@smartygym.com',
  whats_new text NOT NULL DEFAULT 'Version 1.0.0 - Initial Release

• 500+ expert-designed workouts
• 20+ structured training programs
• Workout generator with AI assistance
• Complete exercise library with videos
• Fitness calculators (BMR, Calories, 1RM)
• Workout logbook and progress tracking
• Daily Workout of the Day
• Gold & Platinum membership options',
  promotional_text text NOT NULL DEFAULT 'Professional workouts designed by Sports Scientist Haris Falas. 500+ expert programs. Your gym reimagined anywhere, anytime.',
  support_url text NOT NULL DEFAULT 'https://smartygym.com/contact',
  marketing_url text NOT NULL DEFAULT 'https://smartygym.com',
  privacy_policy_url text NOT NULL DEFAULT 'https://smartygym.com/privacy-policy',
  terms_of_service_url text NOT NULL DEFAULT 'https://smartygym.com/terms-of-service',
  support_email text NOT NULL DEFAULT 'support@smartygym.com',
  category text NOT NULL DEFAULT 'Health & Fitness',
  content_rating text NOT NULL DEFAULT '4+ (Apple) / Everyone (Google)',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_store_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage app store settings
CREATE POLICY "Admins can manage app store settings" ON public.app_store_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings row
INSERT INTO public.app_store_settings (id) VALUES (gen_random_uuid());

-- Create trigger for updated_at
CREATE TRIGGER update_app_store_settings_updated_at
  BEFORE UPDATE ON public.app_store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();