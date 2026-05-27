## Status: both requirements already exist in your codebase

Before writing new code, here's what's already in place from our prior work — this matters because reinstalling/replacing it would actually break what's working:

**1. Dynamic per-page metadata — DONE**
- `react-helmet` is installed and used in every public route (`ArticleDetail.tsx`, `WorkoutDetail.tsx`, `TrainingProgramDetail.tsx`, tools pages, etc.).
- Each page sets its own `<title>`, `<meta description>`, `og:*`, and `<link rel="canonical">` from the live data.

**2. Pre-rendering — DONE**
- `scripts/prerender.ts` runs automatically via a Vite plugin (`smartySeoPrerenderPlugin` in `vite.config.ts`) on every `vite build`.
- It pulls every blog article, workout, program, and tool route from Supabase and writes a real static HTML file per URL: `dist/blog/<slug>.html`, a directory index, and an extensionless leaf file.
- Each file contains the unique title, description, canonical, OG tags, JSON-LD, **and the full article body inside `<div id="root">`** — so Google sees the content with zero JS.
- `dist/_redirects` maps every clean URL (`/blog/<slug>`, `/blog/<slug>/`) → its `.html` file with a 200 rewrite, so the host serves the prerendered HTML instead of the SPA shell.
- `scripts/verify-prerender.ts` runs after every build and **fails the build** if any route is missing its file, canonical, or body content.

Switching to `react-helmet-async` or installing `vite-plugin-ssg` / `prerender-spa-plugin` now would tear out this working pipeline and re-introduce the exact bug you just paid to fix. The correct next step is to confirm the live deploy is actually serving these files.

## Plan

### Step 1 — Verify live deploy
Fetch raw HTML (no JS) from the live URL and confirm:
- `curl -s https://smartygym.com/blog/why-ai-fitness-apps-are-dangerous` returns the article title in `<title>`, the article canonical in `<link rel="canonical">`, and the article body text inside `<div id="root">`.
- Same check for one free workout URL and one free program URL.

### Step 2 — If live HTML is still the homepage shell
Two known possible causes, both fixable without changing the architecture:
- **Cause A — last build didn't actually publish.** Hit Publish once; the existing plugin chain handles the rest.
- **Cause B — Lovable host isn't honoring `_redirects`.** Patch `scripts/prerender.ts` to also write the prerendered HTML at the exact extensionless path served by the host (we already do this for leaf routes; extend to parents if needed) and to write a `200.html` fallback per top-level section. No new dependencies.

### Step 3 — If live HTML is correct
Confirm to you it's working and close this out. No code changes needed.

### Technical notes
- Keep `react-helmet` (sync) — it's what the prerender's hydration expects. Swapping to `react-helmet-async` requires wrapping the app in `HelmetProvider` and updating every page; high-risk for zero SEO gain because the static HTML is already correct.
- Do NOT install `vite-plugin-ssg` or `prerender-spa-plugin` — they would conflict with the existing `smartySeoPrerenderPlugin` and our DB-driven route discovery.
- Build process: `vite build` → SWC bundles client → `closeBundle` hook runs `prerenderSeoHtml` (writes static HTML per route + `_redirects`) → `generateSitemap` → `verifyPrerenderedSeo` (fails build on any SEO regression).

## What I need from you to proceed
Approve this plan and I'll run the Step 1 verification against the live URL. Based on what the raw HTML shows, I'll either confirm it's fixed or apply the minimal Step 2 patch — without touching the helmet/prerender architecture.
