## Goal
Create 3 new published blog articles (one per category) with the exact titles you specified, full SEO + AI-crawler optimization matching the existing standard, then verify and report.

## The 3 articles

1. **Fitness** — "Why Walking Is the Most Underrated Exercise on the Planet — According to Science"
2. **Nutrition** — "The Truth About Protein: How Much You Actually Need and Why Everyone Is Getting It Wrong"
3. **Wellness** — "Why Sleep Is Your Most Powerful Performance Drug — And How to Use It"

All authored by **Haris Falas** — Sports Scientist | CSCS Certified | 20+ Years Experience.

## Step 1 — Write each article (800–1200 words, HTML)

For each article:
- Unique evidence-based content written in Haris's voice, citing science where relevant
- 4–6 `<h2>` section headings, `<p>` paragraphs, `<ul>/<li>` lists, `<strong>` emphasis
- **3+ internal links** per article, only from the validated whitelist:
  - Fitness → `/workout`, `/trainingprogram`, `/1rmcalculator`, `/exerciselibrary`, `/disclaimer`
  - Nutrition → `/caloriecalculator`, `/bmrcalculator`, `/workout`, `/trainingprogram`, `/daily-ritual`
  - Wellness → `/daily-ritual`, `/workout`, `/trainingprogram`, `/disclaimer`, `/blog`
  - Plus 1–2 cross-links to existing `/blog/{slug}` articles (verified by querying `blog_articles` first)
- Unique SEO excerpt under 160 chars
- Slug auto-generated, read time auto-calculated

## Step 2 — AI-generated featured image
Call `generate-blog-image` per article (uses the existing Lovable AI image pipeline, uploaded to `blog-images` bucket).

## Step 3 — Publish + queue notifications
Insert into `blog_articles` with `is_published = true`, `published_at = now()`, `is_ai_generated = true`, author fields, image, read time. Triggers automatically:
- Queue dashboard + email notifications via `pending_content_notifications`
- Queue IndexNow ping via `indexnow_queue` (Bing/Yandex/Google)

## Step 4 — SEO metadata row (per article)
Insert into `seo_metadata` matching the existing pattern:
- `meta_title`: `{title} | Haris Falas` (≤60 chars)
- `meta_description`: excerpt + author tag (≤155 chars)
- `keywords`: base brand keywords + category keywords + topic-specific keywords (walking/NEAT/cardio; protein/RDA/muscle; sleep/recovery/circadian)
- `image_alt_text`: descriptive, includes "Haris Falas SmartyGym"
- `json_ld`: Article schema with author Person, publisher Organization, mainEntityOfPage canonical `https://smartygym.com/blog/{slug}.html`

## Step 5 — Sitemap + llms files refresh
The existing prerender/sitemap pipeline picks up new articles automatically on next build:
- `scripts/generate-sitemap.ts` adds `/blog/{slug}.html` from DB
- `scripts/generate-llms-full.ts` pulls full text into `llms-full.txt`
- IndexNow worker pings search engines

## Step 6 — Verification (the double-check you asked for)
After inserts, I will:
1. Query DB to confirm all 3 rows exist, published, with image_url set
2. Confirm 3 matching `seo_metadata` rows exist with JSON-LD
3. Confirm 3 entries queued in `indexnow_queue`
4. Parse the HTML of each article and verify **every `<a href>`** resolves to either:
   - A whitelisted internal path, OR
   - An existing `/blog/{slug}` from the DB, OR
   - A valid external URL
   Strip and re-save if any invalid link slipped through (the `validateAndFixLinks` sanitizer does this on write, but I'll re-verify after).
5. Confirm the canonical URL, image, title, excerpt, and read time per article

## Final report I'll deliver
- 3 article titles + slugs + published URLs
- Image URL per article
- Internal link count per article + confirmation all resolve
- SEO metadata row confirmation (title, description length, keyword count, JSON-LD present)
- IndexNow queue confirmation
- Sitemap inclusion confirmation (next build)

## What this does NOT touch
- No schema changes, no migrations
- No changes to existing articles, layout, pricing, HFSC, or any business logic
- Purely additive — 3 new rows in `blog_articles` + 3 in `seo_metadata` + auto-queued notifications/IndexNow
