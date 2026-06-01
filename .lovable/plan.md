## Goal

Identify the keywords and phrases that drive Google + Bing + AI-crawler visibility for the 12 competitors listed in the comparison table on `/best-online-fitness-platform`, then bake the winning ones into SmartyGym's SEO layer (meta tags, AI-entity tags, JSON-LD, page copy, internal links, sitemap, etc.) so we can rank for the same demand.

## Competitors in the comparison table (source: `src/components/seo/BestFitnessSections.tsx` + `src/pages/BestOnlineFitnessPlatform.tsx`)

1. Peloton — `onepeloton.com`
2. Nike Training Club — `nike.com` (NTC section)
3. Apple Fitness+ — `apple.com/apple-fitness-plus`
4. Les Mills On Demand — `lesmills.com`
5. Beachbody / BODi — `bodi.com`
6. Freeletics — `freeletics.com`
7. Fitbod — `fitbod.me`
8. Sweat (Kayla Itsines) — `sweat.com`
9. FIIT — `fiit.tv`
10. Centr (Chris Hemsworth) — `centr.com`
11. Alo Moves — `alomoves.com`
12. Obé Fitness — `obefitness.com`

## Phase 1 — Research (read-only, no code changes)

For each of the 12 domains, run two Semrush calls in parallel batches:

- `semrush--domain_analysis` (database `us`) → top 25 organic keywords + traffic snapshot.
- `semrush--top_pages` (database `us`) → top 25 highest-traffic URLs (reveals which content types win: "free workout plan", "HIIT app", "yoga at home", branded queries, etc.).

Then for the strongest non-branded clusters that appear across multiple competitors, run `semrush--keyword_research` on 5–8 head terms (e.g. "home workout app", "HIIT workouts", "best workout app", "strength training app", "pilates app", "free workout plan", "weight loss workout") to pull volume, KDI, related terms, and people-also-ask questions — those PAA strings are exactly what AI crawlers (ChatGPT, Claude, Perplexity, Gemini, Grok) cite.

Deliverable for the user: a written report grouped by:
- **Branded queries** each competitor owns (and the "X alternative" variants we should target — most of these already exist in our `ai-entity` / `ai-topic` tags, we'll fill the gaps).
- **Generic high-intent clusters** shared across competitors (home workout app, HIIT app, strength app, women's workout app, etc.), with volume + KDI bands.
- **Question-format keywords** (PAA) that AI crawlers love to cite.
- **Format/category keywords** (TABATA, AMRAP, EMOM, pilates at home, mobility routine…).

Note on scope: Semrush returns Google data. Bing/Yandex generally mirror Google's keyword demand, so the same target list applies. For AI crawlers, the question-format PAA keywords from `keyword_research` are the primary signal.

## Phase 2 — SEO injection plan (the build that will follow)

Once the report is approved, the implementation will touch ONLY SEO surfaces — no UI/business-logic changes:

1. **`/best-online-fitness-platform`** — extend `<meta name="ai-entity">`, `ai-topic`, `ai-comparison`, `article:tag` and add an `<meta name="keywords">` with the new clusters; add missing "X alternative" tags for any competitor not already covered; expand the comparison-table `aria-label` (already keyword-heavy) only if new competitor terms surface.
2. **JSON-LD on the same page** — add a `FAQPage` block built from the highest-volume PAA questions (e.g. "what is the best home workout app", "is Fitbod worth it") with SmartyGym-positioned answers. AI crawlers consume FAQPage schema directly.
3. **Homepage (`index.html` + `src/pages/Index.tsx` head)** — add the top 5–7 generic head terms to the site-wide `<meta name="keywords">` and AI-entity tag (without changing visible copy).
4. **Per-cluster landing-page deltas** — update the `<title>`/`<meta description>` of existing pages that already target a cluster (e.g. `Tools`, `ExerciseLibrary`, `WhyInvestInSmartyGym`, `TheSmartyMethod`, `SmartyPlans`, blog index) to lead with the winning keyword phrasing from Semrush.
5. **`weekly-seo-refresh` cron prompt** — extend the SEO-metadata generator's system prompt with the approved keyword bank so future workouts / programs / blog posts auto-include them in their generated `meta_title`, `meta_description`, `keywords`, and JSON-LD.
6. **`generate-weekly-blog-articles` topic seed** — add a curated list of "SmartyGym vs <competitor>" and "Best <cluster> app 2026" titles so the Sunday automation publishes articles that capture competitor-alternative demand.
7. **`public/sitemap.xml` + IndexNow trigger** — re-include the updated `/best-online-fitness-platform` URL with a fresh `lastmod` so Bing/Yandex re-crawl immediately via the existing IndexNow cron.
8. **`public/robots.txt`** — confirm `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `Bytespider`, `CCBot`, `cohere-ai`, `Grok`, `Gemini` user-agents are explicitly Allowed (add any missing) so AI crawlers can index the freshly enriched pages.

## Technical details

- All Semrush calls use database `us` first (largest dataset and the market most of these competitors target); for FIIT and Les Mills I'll add a `uk` pass since those are UK-anchored.
- No edits to `src/integrations/supabase/*`, no DB migrations, no UI changes in Phase 2 — strictly head tags, JSON-LD, robots/sitemap, and edge-function prompt strings.
- Memory rules respected: no marketing banners, no structural layout changes, no AI-coach mentions, brand stays "100% Human, 0% AI".

## What I need from you

Approve this plan and I'll run the 24 Semrush calls (12 × `domain_analysis` + 12 × `top_pages`) plus the 5–8 `keyword_research` calls, then come back with the full report and the concrete keyword list ready for Phase 2.
