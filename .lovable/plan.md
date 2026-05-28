## What I will do

Create 4 new blog articles in your database, fully published, with the exact same structure, voice, and SEO quality as your existing articles — readable by Google immediately.

### The 4 articles

1. **Fitness** — "No Time, No Excuse: How to Stay Fit When You Have a Brutally Busy Life"
2. **Fitness** — "The Best Exercises for People Over 40 — What the Science Actually Says"
3. **Nutrition** — "Red Meat, Cholesterol and Heart Disease: Everything You Were Told Is Wrong"
4. **Wellness** — "The Family That Trains Together: How to Build a Healthy Home for Every Age"

### For each article you get

- **Author:** Haris Falas (Sports Scientist | CSCS Certified | 20+ Years Experience)
- **Hand-written body** (900–1300 words), same HTML structure as your existing articles: H2 sections, paragraphs, lists, bold key terms, evidence-based tone
- **AI-generated featured image** matching the category (via your existing image generator)
- **Internal links** woven naturally into the text, pointing to:
  - your Smarty tools (Calorie Calculator, BMR, 1RM, etc.)
  - your workout library and training programs
  - your Daily Smarty Ritual
  - relevant existing blog articles where useful
- **SEO metadata** auto-created (meta title, description, keywords, JSON-LD Article schema, image alt)
- **Canonical URL** = `/blog/<slug>.html` so Google reads the full article, not the homepage shell
- **Auto-published** + queued in your normal dashboard + email notification pipeline (same as your weekly auto-articles)

### Consistency rule going forward

Every new article — whether I write it or your weekly generator writes it — will follow the same standard: real body content, `.html` canonical, valid internal links only, author = Haris Falas, full SEO metadata, image included. This is already enforced for the auto-generator and will be applied identically here.

### What I will NOT touch

- No changes to existing articles
- No layout, design, pricing, payments, or HFSC changes
- No deletions

### Technical details (for reference)

- Insert 4 rows into `blog_articles` with `is_published=true`, `is_ai_generated=false`, `author_name="Haris Falas"`
- Call `generate-blog-image` edge function once per article for the featured image
- Insert matching `seo_metadata` rows with Article JSON-LD pointing to `/blog/<slug>.html`
- Queue 4 rows in `pending_content_notifications` so subscribers get notified
- All internal links validated against your whitelist (workout, trainingprogram, tools, daily-ritual, disclaimer, blog cross-links)

Approve and I'll write all 4 and publish them.
