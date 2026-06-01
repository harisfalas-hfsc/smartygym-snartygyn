# Plan: Freeletics & Peloton Conquest — 100% Additive Update

## Confirmation: this is an UPDATE, not a re-orientation

Nothing already working gets removed, rewritten, or re-oriented. Every existing system stays exactly as it is:

- ✅ The existing `/best-online-fitness-platform` comparison page — **untouched** (only cross-linked from the new pages).
- ✅ The weekly Sunday blog cron — **untouched logic**, we only **append** new topics to its seed list.
- ✅ The weekly SEO refresh cron — **untouched logic**, we only **append** keywords to its bank.
- ✅ All 36 existing meta tags, FAQ schema, and AI-entity tags from last week's work — **kept as-is**.
- ✅ Existing sitemap entries, routes, brand positioning ("100% Human, 0% AI"), Haris Falas attribution — **all preserved**.
- ✅ No DB migrations, no auth changes, no business logic changes, no UI restructuring, no removed pages.

What changes = pure additions on top of what's already winning.

## What gets ADDED (nothing replaced)

### 1. Semrush recon (read-only, no code impact)
Pull Freeletics + Peloton data → save report to `/mnt/documents/freeletics-peloton-attack-report.md`. Zero code touched.

### 2. Two NEW conquest pages (additive routes)
- `/smartygym-vs-freeletics` (new file)
- `/smartygym-vs-peloton` (new file)

Each follows the existing `BestOnlineFitnessPlatform.tsx` pattern (same components, same design system, same brand voice). Registered as **new** routes in `src/App.tsx` — no existing routes modified.

### 3. Blog cron seed list — APPEND only
Add ~40 new topics to the array in `generate-weekly-blog-articles/index.ts`. The 25 topics already seeded last week stay. Generation logic untouched.

### 4. SEO refresh cron keyword bank — APPEND only
Add new Freeletics/Peloton conquest keywords to the bank. Existing keywords stay. Logic untouched.

### 5. Homepage meta tags — APPEND only
Add 8–10 new `article:tag` / `ai-entity` / `ai-topic` entries to `index.html` + `src/pages/Index.tsx`. Nothing removed.

### 6. Sitemap — APPEND only
Add the two new routes to `public/sitemap.xml` + `scripts/generate-sitemap.ts`. Existing entries untouched (only `lastmod` refresh on homepage to trigger re-crawl — same pattern we already use).

### 7. robots.txt — VERIFY + harden (no removals)
Confirm GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, Bytespider, CCBot, cohere-ai, Grok, Gemini are all explicitly allowed. Add any missing. Nothing existing removed.

### 8. Cross-links from existing pages — additive only
Add small "Compare us with…" links from `/best-online-fitness-platform` and footer to the two new pages. No layout restructuring, no marketing banners (memory rule respected).

## Files touched — additive summary

| File | Action |
|---|---|
| `src/pages/SmartygymVsFreeletics.tsx` | **NEW file** |
| `src/pages/SmartygymVsPeloton.tsx` | **NEW file** |
| `src/App.tsx` | **Add** 2 route registrations |
| `src/pages/BestOnlineFitnessPlatform.tsx` | **Add** cross-links only |
| `src/pages/Index.tsx` + `index.html` | **Append** meta tags |
| `supabase/functions/generate-weekly-blog-articles/index.ts` | **Append** topics |
| `supabase/functions/weekly-seo-refresh/index.ts` | **Append** keywords |
| `public/sitemap.xml` + `scripts/generate-sitemap.ts` | **Append** entries |
| `public/robots.txt` | **Verify**, append missing crawlers if any |
| `/mnt/documents/freeletics-peloton-attack-report.md` | **NEW deliverable** |

## What is explicitly NOT touched
- `src/integrations/supabase/*` (forbidden anyway)
- Any existing route, page, or component logic
- HFSC (off-limits per memory)
- Brand positioning, color palette, layout standards
- WOD generation, workout structure, exercise library
- Auth, payments, RLS, DB schema
- Existing blog topics, existing SEO keywords, existing meta tags

## Bottom line
This is a strict **append-and-add** update. Every existing winning system keeps running unchanged; we're stacking a focused Freeletics + Peloton conquest layer on top.

Approve and I execute immediately.
