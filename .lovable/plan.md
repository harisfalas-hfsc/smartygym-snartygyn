

## Create Three New Blog Articles (Fitness, Nutrition, Wellness)

Three manually crafted, SEO-optimized articles will be written and inserted directly into the `blog_articles` table, each with an AI-generated featured image. All articles will be published immediately (`is_published = true`) and fully editable from your back office content management.

Additionally, the automated weekly generation edge function will be updated to ensure future articles avoid duplicating topics already covered.

---

### Article 1 -- Fitness

**Title:** Data-Driven Fitness: How Wearable Technology Is Changing the Way We Train

**Slug:** `data-driven-fitness-wearable-technology-changing-training`

**Topics covered:**
- Wearable tech as the number one global fitness trend (ACSM 2026 survey)
- What modern devices track: heart rate, sleep, recovery, blood pressure, glucose, temperature
- How 70%+ of users actively adjust training and recovery based on their data
- The shift from "train hard" to "train smart and measurable"
- How coaches and individuals use wearable data for performance, fat loss, recovery, and injury prevention
- Personalized programming and reduced injury risk through data-driven decisions

**Internal links used (all verified valid):**
- `/workout` -- workout library
- `/trainingprogram` -- training programs
- `/1rmcalculator` -- One Rep Max Calculator
- `/exerciselibrary` -- exercise library
- `/disclaimer` -- health disclaimer

**Image prompt direction:** Person wearing a fitness tracker/smartwatch during a workout, modern gym setting, data/metrics visible on the watch screen, vibrant and professional photography.

---

### Article 2 -- Nutrition

**Title:** High Protein, High Fiber, and Gut Health: The New Nutrition Blueprint

**Slug:** `high-protein-fiber-gut-health-new-nutrition-blueprint`

**Topics covered:**
- The shift away from extreme diets toward practical, functional eating
- Growing consumer demand for high-protein and high-fiber foods
- Fiber layering: diversifying plant fibers for gut microbiome health
- Functional foods and drinks gaining traction
- Why gut health is becoming the new body composition strategy
- High protein plus gut-friendly nutrition as a fat loss and longevity approach for adults over 30

**Internal links used (all verified valid):**
- `/caloriecalculator` -- Calorie Calculator
- `/bmrcalculator` -- BMR Calculator
- `/workout` -- workout library
- `/trainingprogram` -- training programs
- `/daily-ritual` -- Daily Smarty Ritual

**Image prompt direction:** Colorful spread of high-protein and high-fiber whole foods (Greek yogurt, legumes, lean proteins, vegetables, nuts, fermented foods), modern kitchen or meal prep setting.

---

### Article 3 -- Wellness

**Title:** Mental Health and Longevity: Why the Future of Fitness Is Preventive

**Slug:** `mental-health-longevity-future-fitness-preventive`

**Topics covered:**
- Mental wellbeing and happiness as the top health goals globally
- Growing focus on longevity, healthy aging, sleep, and preventive health
- Exercise for mental health climbing in global fitness trends
- 78% of exercisers cite mental and emotional wellbeing as their main reason to train
- Moving beyond aesthetics toward stress management, better sleep, and functional aging
- Practical strategies for stress, sleep, and longevity performance

**Internal links used (all verified valid):**
- `/daily-ritual` -- Daily Smarty Ritual
- `/workout` -- workout library
- `/trainingprogram` -- training programs
- `/disclaimer` -- health disclaimer
- `/blog/science-of-sleep-why-rest-secret-weapon` -- cross-link to existing sleep article

**Image prompt direction:** Person in a calm, natural setting (sunrise, park, or peaceful outdoor space) doing mindful exercise like yoga or stretching, conveying tranquility, mental clarity, and wellbeing.

---

### Edge Function Topic Update

The `CATEGORY_TOPICS` array in `generate-weekly-blog-articles/index.ts` will be expanded with new trending topics to ensure future automated articles cover fresh ground and don't overlap with the topics now covered. New additions include:

- **Fitness:** "wearable technology and data-driven training", "fitness trends and industry shifts", "training for longevity after 40"
- **Nutrition:** "gut microbiome and fiber diversity", "high-protein functional eating", "nutrition for longevity and aging"
- **Wellness:** "exercise for mental health", "longevity and preventive health strategies", "stress resilience and emotional fitness"

---

### Link Safety

Every article uses only verified valid internal paths from the whitelist:
- `/workout`, `/trainingprogram`, `/1rmcalculator`, `/bmrcalculator`, `/caloriecalculator`, `/exerciselibrary`, `/daily-ritual`, `/disclaimer`, `/blog`
- Cross-article links use `/blog/[existing-slug]` format, verified against the database

No external links or invented paths will be used.

---

### Technical Details

**Database operations:**
- Insert 3 new rows into `blog_articles` with full HTML content, SEO excerpts, author attribution, read time, and AI-generated images
- Each article: `is_published = true`, `is_ai_generated = false` (manually written), attributed to Haris Falas

**Edge function image generation:**
- Call `generate-blog-image` for each article to create a topic-appropriate featured image
- Images stored in `blog-images` storage bucket

**File modified:**
- `supabase/functions/generate-weekly-blog-articles/index.ts` -- add new topics to `CATEGORY_TOPICS` arrays to prevent future automated articles from repeating topics already covered

**What stays untouched:**
- All existing 13 blog articles
- BlogManager component and content editing workflow
- Blog page rendering
- All other edge functions and cron jobs

