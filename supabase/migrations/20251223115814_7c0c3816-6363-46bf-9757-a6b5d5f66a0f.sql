-- Create exercises table for self-hosted ExerciseDB
CREATE TABLE public.exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  body_part TEXT NOT NULL,
  equipment TEXT NOT NULL,
  target TEXT NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}',
  instructions TEXT[] DEFAULT '{}',
  gif_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient filtering and searching
CREATE INDEX idx_exercises_body_part ON public.exercises(body_part);
CREATE INDEX idx_exercises_equipment ON public.exercises(equipment);
CREATE INDEX idx_exercises_target ON public.exercises(target);
CREATE INDEX idx_exercises_name ON public.exercises USING gin(to_tsvector('english', name));

-- Enable Row Level Security
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Public read access (exercises are public content)
CREATE POLICY "Anyone can read exercises" ON public.exercises 
  FOR SELECT USING (true);

-- Only admins can manage exercises
CREATE POLICY "Only admins can insert exercises" ON public.exercises 
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update exercises" ON public.exercises 
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete exercises" ON public.exercises 
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for exercise GIFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercise-gifs', 'exercise-gifs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for exercise GIFs bucket
CREATE POLICY "Anyone can view exercise GIFs" ON storage.objects 
  FOR SELECT USING (bucket_id = 'exercise-gifs');

CREATE POLICY "Only admins can upload exercise GIFs" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'exercise-gifs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update exercise GIFs" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'exercise-gifs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete exercise GIFs" ON storage.objects 
  FOR DELETE USING (bucket_id = 'exercise-gifs' AND has_role(auth.uid(), 'admin'::app_role));

-- Insert sample exercise data
INSERT INTO public.exercises (id, name, body_part, equipment, target, secondary_muscles, instructions, gif_url)
VALUES 
  ('0001', '3/4 sit-up', 'waist', 'body weight', 'abs', 
   ARRAY['hip flexors', 'lower back'], 
   ARRAY['Lie down on a flat surface with your back pressed against the ground.', 'Bend your knees and plant your feet firmly on the ground hip-width apart.', 'Place your hands behind your head with your elbows pointing outwards.', 'Engage your core muscles, and slowly lift your upper body about 3/4 of the way up towards your knees, keeping your feet flat on the ground.', 'Hold the position for a moment, then slowly lower your upper body back to the starting position.', 'Repeat for the desired number of repetitions.'],
   'https://v2.exercisedb.io/image/cglb--DKOD4jZ1'),
  
  ('0002', '45° side bend', 'waist', 'body weight', 'abs', 
   ARRAY['obliques'], 
   ARRAY['Stand with your feet shoulder-width apart and your arms extended straight down by your sides.', 'Keeping your back straight and your core engaged, slowly bend your torso to one side, lowering your hand towards your knee.', 'Pause for a moment at the bottom of the movement, then slowly return to the starting position.', 'Repeat on the other side, alternating back and forth for the desired number of repetitions.'],
   'https://v2.exercisedb.io/image/3q9z5BuTAqNb-l'),
  
  ('0003', 'air bike', 'waist', 'body weight', 'abs', 
   ARRAY['hip flexors', 'obliques'], 
   ARRAY['Lie flat on your back with your hands placed behind your head.', 'Lift your legs off the ground and bend your knees at a 90-degree angle.', 'Bring your right elbow towards your left knee while simultaneously straightening your right leg.', 'Return to the starting position and repeat the movement on the opposite side, bringing your left elbow towards your right knee while straightening your left leg.', 'Continue alternating sides in a pedaling motion, as if riding a bicycle.', 'Repeat for the desired number of repetitions.'],
   'https://v2.exercisedb.io/image/gxvQ8uBDc0gn09'),
  
  ('0004', 'all fours squad stretch', 'upper legs', 'body weight', 'quads', 
   ARRAY['glutes', 'hip flexors'], 
   ARRAY['Start on all fours with your hands directly under your shoulders and your knees directly under your hips.', 'Extend one leg straight back, keeping your knee bent and your foot flexed.', 'Slowly lower your hips towards the ground, feeling a stretch in your quad.', 'Hold this position for 20-30 seconds.', 'Repeat on the other side.'],
   'https://v2.exercisedb.io/image/Xa5s6z6yXVdZRL'),
  
  ('0006', 'alternate heel touchers', 'waist', 'body weight', 'abs', 
   ARRAY['obliques'], 
   ARRAY['Lie flat on your back with your knees bent and feet flat on the ground.', 'Extend your arms straight out to the sides, parallel to the ground.', 'Engaging your core, lift your head and shoulders off the ground.', 'Reach your right hand towards your right heel, crunching your obliques.', 'Return to the starting position and repeat on the left side, reaching your left hand towards your left heel.', 'Continue alternating sides for the desired number of repetitions.'],
   'https://v2.exercisedb.io/image/14R3mbTfK7-aVu');