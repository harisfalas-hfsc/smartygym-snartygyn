-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT one_testimonial_per_user UNIQUE(user_id)
);

-- Enable Row-Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Everyone can read testimonials
CREATE POLICY "Anyone can view testimonials" 
ON public.testimonials 
FOR SELECT 
USING (true);

-- Premium users can insert their own testimonial (one per user enforced by UNIQUE constraint)
CREATE POLICY "Premium users can insert own testimonial" 
ON public.testimonials 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM user_subscriptions 
    WHERE user_subscriptions.user_id = auth.uid() 
    AND user_subscriptions.status = 'active'::subscription_status
    AND user_subscriptions.plan_type IN ('gold'::plan_type, 'platinum'::plan_type)
  )
);

-- Users can update only their own testimonial
CREATE POLICY "Users can update own testimonial" 
ON public.testimonials 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete only their own testimonial
CREATE POLICY "Users can delete own testimonial" 
ON public.testimonials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Seed 11 fake testimonials with placeholder UUIDs (these won't be editable by real users)
INSERT INTO public.testimonials (id, user_id, display_name, rating, testimonial_text, created_at)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Maria K.', 5, 'SmartyGym changed my life! The workouts are perfectly designed and I have never felt stronger. The science-based approach really shows in the results.', now() - interval '30 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'John D.', 5, 'As a busy professional, having expert-designed workouts I can do anywhere is invaluable. No more excuses - my gym is always with me!', now() - interval '28 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'Sarah L.', 4, 'The training programs are incredible. Lost 15kg in 4 months following the weight loss program! The structured approach made all the difference.', now() - interval '25 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'Michael R.', 5, 'Finally, a fitness platform that does not use AI nonsense. Real expertise from a real coach with over 20 years of experience. This is the real deal!', now() - interval '22 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000005', 'Elena P.', 5, 'The Daily Smarty Ritual keeps me motivated every single day. Best investment I have made for my health and wellbeing!', now() - interval '18 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000006', 'David W.', 4, 'Great variety of workouts. Whether I have 15 minutes or an hour, there is always something perfect for my schedule and goals.', now() - interval '15 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000007', 'Anna M.', 5, 'The science-based approach is what sold me. Every workout has purpose and delivers results. I can see the difference in just weeks!', now() - interval '12 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000008', 'Chris B.', 5, 'I travel constantly for work. SmartyGym is my gym in my pocket - literally life-changing! No more missed workouts on business trips.', now() - interval '9 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000009', 'Lisa T.', 4, 'The check-in system keeps me accountable. Have not missed a workout in 3 months! The consistency tracking is a game changer.', now() - interval '6 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000010', 'Robert H.', 5, 'Premium membership is worth every cent. The training programs alone are incredible value. Highly recommend to anyone serious about fitness!', now() - interval '3 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000011', 'Jennifer S.', 5, 'As a mom of three, I never thought I would find time to exercise. SmartyGym made it possible with quick, effective workouts I can do at home!', now() - interval '1 day');