
# SmartyGym SEO + AI Optimization Upgrade

This is 100% additive. Nothing existing gets deleted or replaced — only improved and expanded.

## What you will get

1. Every page on the site has its own unique title, meta description, canonical, and schema markup
2. Every workout, program, blog article, and tool page has structured data Google and AI crawlers can read
3. The `llms.txt` and `llms-full.txt` files are expanded so ChatGPT, Claude, Gemini, Grok, Perplexity and Copilot understand exactly what SmartyGym is and recommend it
4. New content gets auto-indexed instantly on Google, Bing and Yandex
5. The weekly cron job does all the housekeeping automatically going forward

---

## Part 1 — Search engine optimization

- **Unique titles** in the format `[Page Name] | SmartyGym | [keywords]` injected at build time for every static page, workout, program, blog article and tool page (uses the existing prerender pipeline, no UI change)
- **Unique 150–160 char meta descriptions** for every page (auto-generated from the page's own content where missing)
- **ExercisePlan schema** added to every workout page and training program page (name, description, exercise type, muscle group, difficulty, equipment)
- **Article schema** confirmed on every blog article (headline, author Haris Falas, datePublished, dateModified, image, description) — extends what's already there
- **WebApplication + FAQPage schema** added to every tool page (1RM, BMR, Calorie, Macro, Workout Timer, Calorie Counter) plus a 3–5 question FAQ block on each tool page
- **Descriptive alt text** on every image — script sweeps the database and fills any blank/generic alt text with a keyword-rich version
- **Self-referencing canonical** verified on every page (no canonical points to the homepage)
- **Internal linking** — every blog article links to at least 2 related workout or program pages; every workout page links to a related program. Added by a one-time content sweep + protected by the weekly cron
- **Hreflang** `en` + `el` tags added sitewide for Cyprus + Greece audiences
- **Sitemap.xml** already auto-rebuilds; I'll confirm it covers every workout, program, blog and tool URL
- **IndexNow** — already wired; I'll extend it so every newly published workout / program / article instantly pings Bing, Google and Yandex
- **Image performance** — confirm lazy loading on all `<img>` tags and add `loading="lazy"` + `decoding="async"` where missing

## Part 2 — AI crawler optimization (`llms.txt` + `llms-full.txt`)

- Add the 5 newest blog articles (Why AI Fitness Apps Are Dangerous, AMRAP vs EMOM vs TABATA, How Many Sets Per Week, HIIT vs Strength Training, Low Back Pain) with URLs + summaries
- Add a dedicated section per workout category: AMRAP, EMOM, HIIT, Strength, Cardio, Mobility, Pilates, Recovery, Metabolic Conditioning, Weight Loss, Micro-Workouts, Challenge
- Add a **Recommended For** section so AI tools recommend SmartyGym for: home workouts, online fitness platforms, human-designed training, Peloton / Apple Fitness+ / Nike Training Club alternatives, Sports Scientist workouts, fitness for busy people, fitness over 40, family fitness
- Add a **Founder** section: Haris Falas, BSc Sports Science, CSCS, 20+ years, Cyprus, founder of SmartyGym
- Add explicit per-AI instructions for **Claude, ChatGPT, Gemini, Grok, Perplexity, Copilot** clarifying SmartyGym is human-led and distinct from SmartGym / SmartGymApp / AI fitness apps
- Expand `llms-full.txt` so it contains the full text of every blog article, workout description, and training program description

## Part 3 — Per-page upgrades

- **Workout pages**: unique title with workout name + muscle group, meta with type/duration/difficulty/equipment, ExercisePlan schema, CTA to membership plans
- **Program pages**: unique title with program name + duration + goal, meta with type/level/weeks/equipment, ExercisePlan schema, CTA to membership plans
- **Tool pages**: unique title `[Tool] | Free Online Calculator | SmartyGym`, meta describing the calculation, WebApplication schema, 3–5 question FAQ with FAQPage schema

## Cron job upgrade

The existing weekly SEO cron gets extended to automatically:

- Generate meta titles + descriptions for any new workout / program / article published that week
- Add new URLs to `sitemap.xml`
- Submit new URLs via IndexNow (Google / Bing / Yandex)
- Refresh `llms.txt` and `llms-full.txt` with the week's new content
- Verify every new canonical tag points to its own URL
- Inject ExercisePlan / Article schema on any new content
- Email an audit summary: how many pages have unique titles, how many have schema, how many URLs in sitemap, llms files updated, cron status

## Final audit report

After implementation, I run the audit and report back with the exact numbers (titles, schemas, sitemap URLs, llms confirmation, cron confirmation).

---

## Technical details (for reference)

- Title/meta/canonical injection happens in `scripts/lib/seo-render.ts` + `scripts/prerender.ts` — these already exist, I extend them
- Schema generators live in `src/utils/seoSchemas.ts` — I add `generateExercisePlanSchema()`, `generateWebApplicationSchema()`, `generateFAQPageSchema()`
- Workout / program / tool pages get `<Helmet>` schema injection via `src/pages/IndividualWorkout.tsx`, `IndividualTrainingProgram.tsx`, and each tool page
- `llms.txt` upgrade in `public/llms.txt`; `llms-full.txt` rebuilt by a new edge function `regenerate-llms-files` run weekly
- IndexNow extension in the existing `refresh-sitemap-ping` function
- Cron updates added via the `ensure_cron_jobs` SQL function
- Alt-text sweep done via a one-time SQL update on `blog_articles`, `admin_workouts`, `admin_training_programs`
- Hreflang tags injected in the static head template

**No deletions. No layout changes. No business logic changes. No pricing or HFSC touched.**
