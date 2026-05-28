## Reality check first (Semrush, just pulled)

Your competitors confirm the strategy. Sample volumes:

- amrap workout — 1,600/mo, KDI 36 (winnable)
- emom workout — 1,600/mo, KDI 30 (winnable)
- fitness for men over 40 — 390/mo, KDI 28 (easy)
- 15 minute workout — 1,300/mo, KDI 43 (possible)
- fat burning workout — 1,300/mo, KDI 73 (hard, target long-tail variants)
- circuit workout — 2,900/mo, KDI 63 (hard, target variants)
- workout for weight loss — 480/mo, KDI 54 (possible)

Fitness Blender gets ~38K US visits/mo from 36K ranking keywords — they win because every workout format and audience has a dedicated **landing page** with a list of matching workouts and FAQ content. You currently have **zero** of those. That is the gap.

The current SEO infrastructure (prerender, sitemap, RSS, JSON-LD, llms.txt) is already excellent. What's missing is **keyword-targeted surfaces** that funnel into your 500+ workouts and 50 articles. This plan only adds surfaces — no visual UI changes anywhere.

## What gets built

### 1. 25+ keyword landing pages (the core win)

New prerendered routes, each with H1, intro copy, FAQ schema, ItemList JSON-LD, and a DB-driven list of matching workouts/programs/articles. Zero visible UI change — these are new pages, not edits.

**Workout-format landing pages** (target the format keywords you named):
- `/workouts/amrap` — AMRAP workout
- `/workouts/emom` — EMOM workout
- `/workouts/tabata` — Tabata workout
- `/workouts/for-time` — For-time workout
- `/workouts/circuit` — Circuit training workout
- `/workouts/hiit` — HIIT workout
- `/workouts/supersets` — Superset workout

**Goal landing pages** (the long-tail you named):
- `/workouts/for-weight-loss`
- `/workouts/to-burn-fat`
- `/workouts/to-get-stronger`
- `/workouts/for-muscle-gain`
- `/workouts/for-endurance`
- `/workouts/for-mobility`
- `/workouts/for-low-back-pain`

**Audience landing pages**:
- `/workouts/for-men-over-40`
- `/workouts/for-women-over-40`
- `/workouts/for-beginners`
- `/workouts/for-busy-professionals`
- `/workouts/for-travelers`

**Duration / equipment landing pages**:
- `/workouts/15-minute`
- `/workouts/20-minute`
- `/workouts/30-minute`
- `/workouts/no-equipment`
- `/workouts/dumbbell-only`
- `/workouts/kettlebell`
- `/workouts/bodyweight`

Each one queries the DB at build time for matching workouts (by `category`, `format`, `equipment`, `duration`, `difficulty`) and prerenders a real list with descriptive anchors. This is exactly how Fitness Blender ranks for "low impact HIIT" etc.

### 2. Topic hub pages

- `/topics/weight-loss` — aggregates weight-loss workouts + the weight-loss program + matching blog articles + FAQ.
- `/topics/strength`, `/topics/recovery`, `/topics/mobility`, `/topics/healthy-aging`, `/topics/fat-loss`, `/topics/muscle-building`.

These consolidate keyword authority for head terms and link out to every leaf page.

### 3. Stronger JSON-LD (more SERP real estate)

- **Workouts**: add `HowTo` schema (warm-up → main → finisher steps) → eligible for the HowTo carousel in Google.
- **Programs**: enrich `Course` with `hasCourseInstance`, `coursePrerequisites`, `educationalCredentialAwarded`, `offers`.
- **Articles**: add `wordCount`, `keywords`, `inLanguage`, `articleBody` excerpt.
- **Every page**: add `FAQPage` schema with 3–5 keyword-targeted Q&A pulled from a per-page FAQ map (the questions come from Semrush `phrase_questions`).
- **WOD pages**: add `Event` schema (daily-recurring) so Google can show "today's workout".

### 4. Title + description rewrite (front-load benefit keywords)

Current pattern: "Strength Workouts | SmartyGym". Rewrite to:
- "Strength Workouts at Home — 120+ Free Sessions by a Sports Scientist | SmartyGym"
- "AMRAP, EMOM and Tabata Workouts — Built by Coach Haris Falas"
- "Workouts for Men Over 40 — Strength, Mobility, Fat Loss"

Rules: keyword first, benefit/count second, brand last. Stays inside the 60-char target.

### 5. Internal-link engine on prerender

Each prerendered workout / program / article body gets 3–5 contextual links auto-inserted, anchored on the matching landing page's keyword:

- A "Strength" workout → links to `/workouts/to-get-stronger`, `/topics/strength`, `/workouts/dumbbell-only`.
- A "15 min cardio" workout → links to `/workouts/15-minute`, `/workouts/for-weight-loss`, `/workouts/hiit`.

Anchor text is the landing page's primary keyword — exactly the signal Google uses to rank those landings. Insertion only happens in the prerendered SEO body, never in the visible React UI.

### 6. Blog SEO upgrades

- Auto-generate per-article FAQ schema from the article's own H2 questions.
- Auto-generate `BreadcrumbList` with category between Home and article (already partial — formalize).
- Add `relatedArticles` ItemList per article.
- Add `<link rel="prev/next">` for paginated `/blog` listing.

### 7. AI-crawler reinforcement (without changing /llms.txt structure)

- Add `/ai-index` page enumerating every workout/program/article with one-sentence structured summaries → submitted to llms-full.txt and indexed for SGE/Perplexity/ChatGPT.
- Expand `/llms-full.txt` to include the new landing pages.
- Add `speakable` schema fragments to articles for voice-search.

### 8. Image SEO pass

Every prerendered `<img>` already has alt text — but it's generic ("workout name"). Rewrite alt rule to: `{name} — {category} {format} workout by Haris Falas`. Eligible for Google Images.

### 9. Sitemap split

Single sitemap with 636 URLs is fine, but Google indexes faster when split. Generate a `sitemap-index.xml` with:
- `sitemap-static.xml`
- `sitemap-workouts.xml`
- `sitemap-programs.xml`
- `sitemap-blog.xml`
- `sitemap-landings.xml` (new)

Same generator, just partitioned output. Update robots.txt to point to the index.

## Technical details

- **Where everything lives**: `scripts/lib/seo-routes.ts` (add landing-page route generators), `scripts/lib/seo-render.ts` (add landing/topic body renderers + HowTo/FAQ schemas + internal-link engine), `scripts/generate-sitemap.ts` (split output). No new infrastructure — uses the existing build-time pipeline.
- **Data source**: same Supabase queries already used by `buildSeoRoutes` — no new tables, no migrations.
- **FAQ content per landing**: a static map of `{ keyword → [ {q,a}, ... ] }` in `scripts/lib/landing-faqs.ts`, ~3 Q&A per page (~75 questions total). Hand-written, evidence-based, no AI fluff — consistent with the 100% Human positioning.
- **Visible UI**: untouched. New routes will redirect users to the appropriate existing React page (`/workouts/amrap` → opens the workout listing filtered by AMRAP). Search engines see the prerendered keyword-rich HTML; users see the existing app. The .html canonical pattern you already use handles this exactly.
- **Risk**: zero — same pattern as your existing 600+ prerendered routes. The prerender verifier (`scripts/verify-prerender.ts`) catches any drift before publish.

## Out of scope (explicit)

- No visual changes to any existing page.
- No new UI components, no new menu items, no new buttons.
- No backend/auth/payment changes.
- No edits to HFSC-related assets.
- No AI-generated workout/article content.

## Expected outcome

- ~50 net-new prerendered URLs, each targeting a specific commercial-intent keyword.
- 3–5× larger keyword footprint within 4–8 weeks of recrawl.
- HowTo + FAQ + Course schema → rich-result eligibility on most workout/program/article SERPs.
- Internal-link engine compounds authority into the new landings, which Google rewards over time.

Time + backlinks still apply (your domain is new, Authority Score is low), but this gives Google **something to actually rank for** beyond "SmartyGym" the brand term.