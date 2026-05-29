## Goal

Create a real, on-brand blog article and use it as a live test of the SEO ping pipeline (IndexNow → Bing/Yandex; Search Console sitemap resubmit → Google).

## 1. Write the article

- **Title:** "How Men Over 50 Can Lose Belly Fat — The Science-Backed Protocol"
- **Slug:** `how-men-over-50-can-lose-belly-fat-protocol`
- **Category:** Fitness
- **Author:** Haris Falas (with full credentials, per Author Credentials memory)
- **Length:** ~1,400–1,700 words, ~7 min read
- **Structure** (matches existing standardized articles like "Why Walking Is the Most Underrated Exercise"):
  1. Intro framing the visceral-fat problem for men 50+
  2. Why belly fat behaves differently after 50 (testosterone, insulin resistance, cortisol, sarcopenia)
  3. The 4-pillar protocol: strength first, walking/NEAT, nutrition (protein + fiber), sleep & stress
  4. What to stop doing (excessive cardio, crash diets, late-night eating)
  5. Realistic timeline & how to measure progress
  6. Closing CTA
- **Internal links** (only from the whitelisted paths in the Valid Internal Links memory):
  - `/workout` — workout library
  - `/trainingprogram` — training programs (e.g. weight-loss, functional-strength)
  - `/caloriecalculator` — calorie calculator
  - `/macrocalculator` — macro calculator
  - `/about` — Haris Falas credibility link
  - Each rendered as `<a href="..." class="text-primary hover:underline font-medium">…</a>` like existing articles
- **Formatting:** same HTML rhythm as current articles — `<p>`, `<h2>`, `<ul><li>`, `<strong>`, `<em>`, scientific citations inline (JAMA, Mayo Clinic, Diabetes Care, etc.)
- **Excerpt:** 1–2 sentence SEO-friendly summary
- **Image:** leave `image_url` NULL — the existing trigger will auto-generate one
- **Publish:** `is_published = true`, `published_at = now()`

Insert via a single SQL INSERT into `public.blog_articles`.

## 2. Watch the cron pipeline fire

Right after insert, the DB trigger `queue_article_for_indexnow` will push the new URL into `public.indexnow_queue` with `status='pending'`.

**Step A — IndexNow (Bing / Yandex), ≤ 5 min:**
- Poll `indexnow_queue` for our new row every ~30s
- Wait for `status` to flip from `pending` → `sent` (the cron `process-indexnow-queue-frequent` runs every 5 min)
- Once flipped, fetch the latest `process-indexnow-queue` edge function logs and confirm Bing + Yandex returned 200/202 for our URL
- If patience runs out (>5 min), manually invoke the function once via `supabase--curl_edge_functions` to force the test and re-verify the logs

**Step B — Google Search Console sitemap resubmit:**
- The scheduled run is 02:00 / 09:15 UTC, so we won't naturally hit it during this test
- Manually invoke `refresh-sitemap-ping` via `supabase--curl_edge_functions`
- Read the function logs and confirm the `PUT …/sites/{site}/sitemaps/{sitemap}` call to the Search Console gateway returned `204 No Content`

## 3. Report results in plain English

Final summary table:
- Article live at `/blog/how-men-over-50-can-lose-belly-fat-protocol` ✅ / ❌
- IndexNow → Bing ✅ / ❌ (with timestamp + status code)
- IndexNow → Yandex ✅ / ❌
- Google Search Console sitemap resubmit ✅ / ❌

If any step fails, show the actual error from logs and propose the fix.

## Technical notes

- Article insert: `supabase--insert` (single INSERT, no migration needed)
- Queue polling: `supabase--read_query`
- Manual edge invocations: `supabase--curl_edge_functions` (POST, empty body)
- Log inspection: `supabase--edge_function_logs` for `process-indexnow-queue` and `refresh-sitemap-ping`
- No code changes to the cron functions themselves — this is a live test of the system as it stands after the previous turn's fixes
