## The problem
Right now SmartyGym is a Vite/React single-page app. Many URLs exist only after JavaScript runs. Google may crawl `/blog/why-ai-fitness-apps-are-dangerous` and initially see the same generic `index.html` metadata instead of the real article/workout/program content.

This is why the sitemap alone is not enough. The sitemap can list 600+ URLs, but each URL must also return unique HTML before JavaScript loads.

## What I will build

### 1. Create one shared SEO route source of truth
I will create a shared script module that fetches and builds the full public URL list from:

- Static public pages: home, about, FAQ, tools, calculators, blog index, workout categories, program categories, legal pages, etc.
- Blog articles from `blog_articles` where `is_published = true`
- Public visible workouts from the existing public workout metadata function
- Public visible training programs from the existing public program metadata function

This shared source will be used by both:

- `sitemap.xml`
- the new pre-rendering system

That prevents the future problem where sitemap and HTML generation drift apart.

### 2. Fix the sitemap system permanently
I will refactor `scripts/generate-sitemap.ts` so it uses the shared route source.

The sitemap will continue to regenerate automatically on every publish/build and will include:

- Every existing published blog article
- Every existing visible workout
- Every existing visible training program
- Every public tool page
- Every public static page
- Future new articles/workouts/programs automatically, as long as they are in the existing content types

I will keep the existing safety guard: if dynamic content suddenly drops back to a tiny number like 58 URLs, the build fails instead of publishing a broken sitemap.

### 3. Add build-time pre-rendering for every public URL
I will add a `postbuild` script that runs after Vite builds the app.

It will create real static HTML files in `dist/` for every public route, for example:

```text
/blog/why-ai-fitness-apps-are-dangerous/index.html
/workout/strength/<id>/index.html
/trainingprogram/weight-loss/<id>/index.html
/1rmcalculator/index.html
/macrocalculator/index.html
/about/index.html
/tools/index.html
```

Each generated HTML file will contain real crawlable content inside the HTML response before JavaScript loads.

### 4. Add unique SEO tags for every generated page
Each public URL will get its own server-readable head tags:

- Unique `<title>`
- Unique `<meta name="description">`
- Unique canonical URL
- Unique Open Graph title/description/url
- Twitter title/description
- Correct robots tag
- JSON-LD structured data where appropriate

Examples:

```text
/blog/why-ai-fitness-apps-are-dangerous
Title: Why AI Fitness Apps Are Dangerous | SmartyGym
Description: A human-coaching article by Haris Falas explaining why automated fitness apps can create unsafe training decisions.
```

```text
/workout/strength/<id>
Title: <Workout Name> | Workout by Haris Falas | SmartyGym
Description: <duration>, <format>, <difficulty>, <equipment>, and summary from the workout.
```

```text
/trainingprogram/weight-loss/<id>
Title: <Program Name> | Training Program by Haris Falas | SmartyGym
Description: <weeks>, <days per week>, category, equipment, and program summary.
```

### 5. Render real page content before JavaScript loads
For Google without JavaScript, the generated HTML will include:

#### Blog articles
- H1 article title
- Author: Haris Falas
- Credentials if available
- Category
- Published/updated date
- Excerpt
- Cover image with alt text
- Full article HTML body
- Internal links preserved
- Article JSON-LD
- Breadcrumb JSON-LD

#### Workouts
- H1 workout name
- Category, difficulty, duration, format, equipment
- Description
- Warm-up
- Activation
- Main workout
- Finisher
- Cool-down
- Visible workout content available to the public
- ExercisePlan JSON-LD
- HowTo JSON-LD where possible
- Breadcrumb JSON-LD

#### Training programs
- H1 program name
- Category, weeks, days per week, difficulty, equipment
- Description
- Overview
- Target audience
- Program structure/content fields available publicly
- Course JSON-LD
- ExercisePlan JSON-LD
- Breadcrumb JSON-LD

#### Tool pages and static pages
- Unique title and description
- H1
- Crawlable explanatory content for the tool/page
- Canonical URL
- WebPage or SoftwareApplication JSON-LD where appropriate

The interactive app will still load normally after JavaScript hydrates.

### 6. Fix existing wrong canonical URLs on workout/program pages
I found an existing SEO bug:

- Individual workout pages currently build canonical URLs like `/individualworkout/<id>`
- Individual program pages currently build canonical URLs like `/individualtrainingprogram/<id>`

But the real app routes are:

- `/workout/:type/:id`
- `/trainingprogram/:type/:id`

I will fix those so Google does not receive wrong canonical signals.

### 7. Keep React metadata, but make static HTML the SEO source
The current React pages already use Helmet, but Helmet only updates metadata after JavaScript loads.

I will keep that for users and JS-capable crawlers, but the new pre-rendered files will be the reliable source for Google when JavaScript is not available.

### 8. Add automated verification so this does not break again
I will add a verification script that checks the generated output after build/pre-render.

It will verify:

- Sitemap URL count is not suspiciously low
- Every sitemap URL has a matching generated HTML file
- Blog article HTML contains the article title and body text
- Workout HTML contains workout-specific content
- Program HTML contains program-specific content
- Each tested page has a unique title
- Each tested page has a unique meta description
- Each tested page has a canonical URL matching the sitemap URL
- No generated page falls back to only the generic homepage metadata
- No broken internal links in the generated crawlable content where they can be checked safely

If the SEO generation breaks in the future, the build will fail instead of silently publishing broken pages.

## What this fixes for existing published content
After implementation and the next publish:

- Existing blog articles will have static crawlable HTML
- Existing workouts will have static crawlable HTML
- Existing training programs will have static crawlable HTML
- Existing tool/static pages will have unique SEO HTML
- The sitemap will point to those same URLs
- Google URL Inspection should show the real page-specific title, description, and body content

## What this fixes for future content
For future content inside existing content types:

- New published blog article: automatically added to sitemap and pre-rendered HTML on the next publish
- New visible workout: automatically added to sitemap and pre-rendered HTML on the next publish
- New visible training program: automatically added to sitemap and pre-rendered HTML on the next publish

For brand-new route types added later, for example a completely new `/challenges` section, a one-time code update is still required so the new route type is included in the shared SEO route source.

## Important truth
This will be build-time pre-rendering, not live server-side rendering on every request.

That means the fix becomes live when the site is published. New database content created after a publish will appear in the app for users through JavaScript, but Google-readable static HTML for that new content appears after the next publish.

Given the current hosting/app architecture, this is the safest fix without migrating the whole app to a true SSR framework.

## Files I expect to change

- `package.json` — add `postbuild` for pre-rendering and optional SEO verification
- `scripts/generate-sitemap.ts` — refactor to use shared route source
- `scripts/lib/seo-routes.ts` — new shared public route/content source
- `scripts/lib/seo-render.ts` — new SEO/head/content rendering helpers
- `scripts/prerender.ts` — new build-time HTML generator
- `scripts/verify-prerender.ts` — new safety checker
- `src/pages/IndividualWorkout.tsx` — fix canonical/OG URL route
- `src/pages/IndividualTrainingProgram.tsx` — fix canonical/OG URL route

## Final validation before I tell you it is done
I will verify the generated output contains real HTML for representative pages:

- One blog article, including `why-ai-fitness-apps-are-dangerous`
- One workout page
- One training program page
- Several tool pages
- Sitemap count and sitemap URL matching
- Correct canonical URLs
- No generic homepage title/description on dynamic content pages

If you approve this plan, I will implement it.