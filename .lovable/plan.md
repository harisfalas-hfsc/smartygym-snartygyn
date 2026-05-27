To be crystal clear: this applies to **every single page** on the site, not one workout. That means:

- **All ~500+ workouts** (free and premium, existing and any added in the future)
- **All training programs** (free and premium, existing and future)
- **All blog articles** (existing and future, auto-included on next publish)
- **All Smarty Tools** (`/tools`, `/1rmcalculator`, `/bmrcalculator`, `/macrocalculator`, `/caloriecalculator`, `/caloriecounter`, `/workouttimer`)
- **All category and static pages** (`/workout`, `/workout/strength`, `/trainingprogram`, `/trainingprogram/weight-loss`, `/blog`, `/about`, `/coach-profile`, etc.)

No page is skipped. No page keeps the homepage title. No page is hand-picked.

## What every page will have after this fix

For every URL above:
- A unique `<title>` based on the actual content name.
- A unique `<meta description>`.
- A correct canonical URL pointing to that exact page.
- Open Graph + Twitter tags matching the page.
- JSON-LD schema appropriate to the type (Article, ExercisePlan, Course, WebApplication, etc.).
- The actual content (H1, body text, workout sections, article text, tool description) inside the raw HTML — visible in `view-source:` before any JavaScript runs.

## What I will change

### 1. Readable, standardized URLs for dynamic content
Move workouts and programs off serial-ID URLs and onto readable slugs based on the content name:

```text
/blog/<article-slug>
/workout/<category>/<workout-slug>
/trainingprogram/<category>/<program-slug>
/tools, /1rmcalculator, /bmrcalculator, /macrocalculator,
/caloriecalculator, /caloriecounter, /workouttimer
```

Slugs are derived from the visible name (with a numeric suffix only if two items collide). Old ID-based URLs keep working, but canonical URLs point to the readable slug version so Google indexes one clean URL per item.

### 2. Update app navigation links
Workout/program list and detail components will link using the readable slug URLs so users and crawlers land directly on the canonical pages.

### 3. Prerender every public page, automatically
The build process already queries the backend for every published article, every visible workout, every visible program. I will make sure the route generator covers 100% of those plus every Smarty Tool and every static page, and that each one writes its own `dist/<route>/index.html` containing:

- Unique `<title>` and meta description
- Canonical and OG/Twitter tags
- JSON-LD
- Full H1 + body text (workout sections, article content, program structure, tool description) inside `<div id="root">`

This runs on every publish. **Any new blog article, workout, program, or tool is automatically included on the next publish — no manual step.**

### 4. Force every clean URL to its prerendered file
`_redirects` will explicitly map every public clean URL to its own `index.html` so the static host cannot fall back to the homepage shell.

### 5. Hard verification — the build fails if any page is wrong
`scripts/verify-prerender.ts` will fail the build if **any** route:
- Still has the homepage title
- Has a serial ID where the content name should be
- Has a missing or wrong canonical
- Is missing its actual body content in raw HTML
- Is missing its `_redirects` rule

If even one workout, one program, one article, or one tool is broken, the build stops. Nothing partial ever ships.

### 6. Live deployed-source verification script
After publish, a script fetches the raw HTML of representative URLs from each category (multiple workouts, multiple programs, multiple articles, every tool, key static pages) and confirms each one returns its own unique title and content — not the homepage. Failures are reported clearly.

## Files affected
- `scripts/lib/seo-routes.ts` (route + slug generation)
- `scripts/lib/seo-render.ts` (per-page body and JSON-LD)
- `scripts/prerender.ts` (file output)
- `scripts/verify-prerender.ts` (strict checks)
- `scripts/generate-sitemap.ts` (URL format alignment)
- New: `scripts/verify-deployed-seo.ts`
- Workout/program list/detail link generation in `src/pages` and related components

## Acceptance test — must pass for ALL types
After publish, `view-source:` on these patterns must show the page's own title and content, not the homepage:

```text
https://smartygym.com/blog/<any published article slug>
https://smartygym.com/workout/<category>/<any workout slug>
https://smartygym.com/trainingprogram/<category>/<any program slug>
https://smartygym.com/1rmcalculator
https://smartygym.com/bmrcalculator
https://smartygym.com/macrocalculator
https://smartygym.com/caloriecounter
https://smartygym.com/workouttimer
https://smartygym.com/tools
```

This must be true for **every** published article, **every** visible workout, **every** visible program, and **every** tool — current and future.