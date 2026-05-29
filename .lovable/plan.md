## Plan: New blog article — "Either Way, You'll End Up in the Gym"

A personal, ~2,000-word message-from-the-coach article authored by Haris Falas, with a custom realistic image of normal everyday people, published into the existing Blog system.

### 1. Generate the hero image
- Use `imagegen--generate_image` (model `standard`, 1920×1080, .jpg) into `/tmp/either-way-gym.jpg`.
- Prompt: candid, documentary-style photo of ordinary everyday people of mixed ages and body types in a normal community gym — a middle-aged man on a treadmill, a woman in her 60s lifting a light dumbbell, a young dad stretching, natural lighting, real-life feel, no models, no fitness influencers, no logos, no text.
- Upload the file to the existing `blog-images` Supabase storage bucket via `supabase--storage_upload` and use the resulting public URL as `image_url`.

### 2. Write the article (~2,000 words, HTML)
Tone: first-person message from Coach Haris Falas. Honest, warm, direct.

Structure (H2 sections):
1. **Sooner or later, the gym finds you** — the two doors: you walk in, or the doctor sends you in.
2. **Door #1: You choose it** — investing in health, strength, energy, confidence, body composition, injury prevention, being a better parent/partner/professional, performing in your sport, exploring what your body can do.
3. **Door #2: The doctor sends you** — high blood pressure, overweight, heart issues, osteoporosis, arthritis, chondromalacia, chronic neck/shoulder/lower-back pain, prediabetes, sarcopenia. Exercise prescribed as medicine.
4. **Why Door #1 is the smarter door** — you keep agency, you train *before* damage, results compound, recovery is easier, the cost (time, money, pain) is a fraction.
5. **How you actually choose Door #1** — set goals, respect your body, train for the people you love, measure something, show up on bad days. Practical first steps.
6. **A message from Coach Haris Falas** — closing personal note, signed off.

Internal links woven naturally into the body (using the project's whitelist):
- `/caloriecalculator` — Calorie Calculator
- `/1rmcalculator` — One Rep Max Calculator
- `/bmrcalculator` — BMR Calculator
- `/workout` — workout library
- `/trainingprogram` — training programs
- `/daily-ritual` — Daily Smarty Ritual
- `/disclaimer` — health disclaimer & PAR-Q

Formatting: `<h2>`, `<p>`, `<ul>/<li>`, `<strong>` for emphasis. No H1 (title rendered separately). Read time auto-estimated (~9–11 min).

### 3. Insert into the database
Single `INSERT` into `public.blog_articles` via migration:
- `title`: *Either Way, You'll End Up in the Gym — A Message from Coach Haris Falas*
- `slug`: `either-way-you-will-end-up-in-the-gym`
- `category`: `Wellness`
- `excerpt`: one-sentence SEO summary (<160 chars)
- `content`: the full HTML
- `author_name`: `Haris Falas`
- `author_credentials`: `Sports Scientist | CSCS Certified | 20+ Years Experience`
- `is_ai_generated`: `false` (this is a coach message, not auto-generated)
- `is_published`: `true`, `published_at`: now
- `read_time`: computed
- `image_url`: uploaded hero image URL

### 4. SEO metadata
Insert matching row into `public.seo_metadata` (same pattern the weekly generator uses): meta_title, meta_description, keywords (Haris Falas, SmartyGym, exercise as medicine, why go to the gym, longevity, preventive health…), image_alt_text, and Article JSON-LD pointing to `https://smartygym.com/blog/either-way-you-will-end-up-in-the-gym.html`.

### What I will NOT touch
- No changes to `Blog.tsx`, `ArticleDetail.tsx`, navigation, or any UI — the article will appear automatically through the existing blog pipeline.
- No edits to the weekly generator.
