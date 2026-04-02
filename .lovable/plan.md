

# Create 3 SEO-Optimized Blog Articles

## What Gets Built
Three Fitness-category blog articles generated via AI script, inserted into `blog_articles` as published, with AI-generated images and SEO metadata.

### Articles
1. **"Best 10-Minute Workouts for Busy People"** — slug: `best-10-minute-workouts-for-busy-people`
2. **"How to Stay Consistent with Training"** — slug: `how-to-stay-consistent-with-training`
3. **"Daily Workout vs Gym Program"** — slug: `daily-workout-vs-gym-program`

## Implementation Steps

### Step 1: Generate article content via AI script
Use the `ai-gateway` skill to generate each article's HTML content with a detailed prompt including:
- Category: Fitness
- Author: Haris Falas (Sports Scientist | CSCS Certified | 20+ Years Experience)
- 800–1200 words, HTML formatted (`<h2>`, `<p>`, `<ul>`, `<strong>`)
- Evidence-based, scientific references
- Internal links to valid paths only: `/workout`, `/trainingprogram`, `/1rmcalculator`, `/exerciselibrary`, `/daily-ritual`, `/disclaimer`, `/blog`, `/the-smarty-method`, `/coach-profile`, `/macrocalculator`, `/bmrcalculator`, `/caloriecounter`, `/smarty-plans`
- Brand mentions: SmartyGym, SmartGym, Smart-Gym, Haris Falas
- Each article gets a unique excerpt (under 160 chars)

### Step 2: Validate all internal links
Apply the same whitelist validation used in `generate-weekly-blog-articles` to strip any invalid internal links while preserving text.

### Step 3: Generate blog images
Call the `generate-blog-image` edge function for each article to create featured images and get public URLs.

### Step 4: Insert into `blog_articles` table
Insert each article with:
- `is_published: true`, `published_at: now()`
- `author_name: "Haris Falas"`, `author_credentials: "Sports Scientist | CSCS Certified | 20+ Years Experience"`
- `category: "Fitness"`, `is_ai_generated: true`
- Generated image URL, calculated read time

### Step 5: Upsert SEO metadata
Insert rows into `seo_metadata` table (via service role) for each article with:
- `content_type: "blog-article"`, `content_id: slug`
- Targeted keyword clusters (title variations, brand names, topic keywords)
- `meta_title` optimized for search (under 60 chars)
- `meta_description` matching the excerpt

The existing `ArticleDetail.tsx` already handles Article JSON-LD, BreadcrumbList schema, Open Graph, Twitter cards, and `SEOEnhancer` component — no code changes needed.

## Technical Details
- All work done via `code--exec` scripts — no source code file changes
- Uses `ai-gateway` skill for content generation
- Uses existing `generate-blog-image` edge function for images
- Database inserts via `psql` (blog_articles) and edge function calls
- SEO metadata inserted via service role since RLS blocks public access on `seo_metadata`

