
CREATE TABLE IF NOT EXISTS public.strength_library_batch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  focus text NOT NULL,
  equipment text NOT NULL CHECK (equipment IN ('BODYWEIGHT','EQUIPMENT')),
  difficulty_stars integer NOT NULL CHECK (difficulty_stars BETWEEN 1 AND 6),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  workout_id text REFERENCES public.admin_workouts(id) ON DELETE SET NULL,
  stripe_product_id text,
  stripe_price_id text,
  image_url text,
  workout_name text,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS strength_library_batch_spec_uniq
  ON public.strength_library_batch (focus, equipment, difficulty_stars);

ALTER TABLE public.strength_library_batch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage strength batch"
  ON public.strength_library_batch
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_strength_library_batch_updated
  BEFORE UPDATE ON public.strength_library_batch
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.strength_library_batch (focus, equipment, difficulty_stars)
SELECT focus, equipment, stars
FROM (VALUES
  ('LOWER BODY','BODYWEIGHT',3),('LOWER BODY','EQUIPMENT',4),('LOWER BODY','BODYWEIGHT',5),('LOWER BODY','EQUIPMENT',6),
  ('UPPER BODY','BODYWEIGHT',3),('UPPER BODY','EQUIPMENT',4),('UPPER BODY','BODYWEIGHT',5),('UPPER BODY','EQUIPMENT',6),
  ('FULL BODY','BODYWEIGHT',3),('FULL BODY','EQUIPMENT',4),('FULL BODY','BODYWEIGHT',5),('FULL BODY','EQUIPMENT',6),
  ('LOW PUSH & UPPER PULL','BODYWEIGHT',3),('LOW PUSH & UPPER PULL','EQUIPMENT',4),('LOW PUSH & UPPER PULL','BODYWEIGHT',5),('LOW PUSH & UPPER PULL','EQUIPMENT',6),
  ('LOW PULL & UPPER PUSH','BODYWEIGHT',3),('LOW PULL & UPPER PUSH','EQUIPMENT',4),('LOW PULL & UPPER PUSH','BODYWEIGHT',5),('LOW PULL & UPPER PUSH','EQUIPMENT',6),
  ('CORE & GLUTES','BODYWEIGHT',3),('CORE & GLUTES','EQUIPMENT',4),('CORE & GLUTES','BODYWEIGHT',5),('CORE & GLUTES','EQUIPMENT',6)
) AS v(focus, equipment, stars)
ON CONFLICT (focus, equipment, difficulty_stars) DO NOTHING;
