I found the remaining causes: some code still creates public workout/program URLs with IDs, and old ID URLs are still accepted without automatically moving the browser/canonical source to the readable slug URL.

## Final fix scope

This will apply globally, not to one workout:

- All workouts, current and future
- All training programs, current and future
- All blog articles, current and future
- All Smarty Tools and static public pages
- All app links, coach suggestion links, sitemap links, prerendered HTML, canonicals, and redirects

## What I will change

### 1. Replace every remaining ID-based public link
Update all remaining URL helpers and callers so they build URLs from the content name, not the database ID.

Examples:

```text
Wrong:
/workout/strength/FREE-int-strength-E-1777866547411
/trainingprogram/weight-loss/PROGRAM-12345

Correct:
/workout/strength/bedrock-lift
/trainingprogram/weight-loss/<program-name-slug>
```

Known remaining sources to fix:

- `src/utils/smarty-coach/routes.ts` currently returns `/workout/<category>/<id>` and `/trainingprogram/<category>/<id>`.
- `SmartyCoachModal` and `ProgramSuggestionFlow` pass IDs into those helpers.
- Any stale/legacy `individualworkout` route references will be removed or redirected to canonical URLs.
- Old schema/helper references like `/individualworkout/<id>` will be updated to canonical `/workout/<category>/<name-slug>`.

### 2. Add a single canonical URL helper used everywhere
Create/extend shared helpers so every part of the app uses the same logic:

```text
getWorkoutPath(workout) -> /workout/<category>/<unique-name-slug>
getProgramPath(program) -> /trainingprogram/<category>/<unique-name-slug>
getArticlePath(article) -> /blog/<slug>
```

This prevents different components from generating different URLs for the same content.

### 3. Redirect old ID URLs automatically
If someone opens an old URL like:

```text
/workout/strength/FREE-int-strength-E-1777866547411
```

then after the workout is resolved, the app will immediately replace the browser URL with:

```text
/workout/strength/bedrock-lift
```

Same for training programs.

### 4. Generate host-level redirects for every existing workout/program ID URL
During prerender/publish, generate redirect rules for every visible workout and program:

```text
/workout/<category>/<id>              /workout/<category>/<name-slug> 301!
/trainingprogram/<category>/<id>      /trainingprogram/<category>/<name-slug> 301!
```

This means old public ID URLs do not stay indexable and crawlers are pushed to the readable URL.

### 5. Keep readable slug pages fully prerendered
For every canonical URL, keep writing:

```text
dist/workout/<category>/<name-slug>/index.html
dist/trainingprogram/<category>/<name-slug>/index.html
dist/blog/<article-slug>/index.html
```

Each must contain its own:

- unique title
- unique meta description
- canonical URL
- OG/Twitter tags
- JSON-LD
- H1 and crawlable body text inside raw HTML

### 6. Strengthen verification so this cannot return
Update the verification script to fail if any of these exist:

- `/workout/<category>/<database-id>` in generated routes, sitemap, or redirects as a final canonical URL
- `/trainingprogram/<category>/<database-id>` as a final canonical URL
- any `individualworkout` or `individualtrainingprogram` public SEO URL
- any workout/program canonical using the ID instead of the name slug
- any app source code helper returning ID-based public URLs
- any prerendered page showing homepage title/content instead of page-specific title/content

## Acceptance test after implementation

These must be true after publish:

```text
https://smartygym.com/workout/strength/bedrock-lift
```

shows source with:

```text
<title>Bedrock Lift | Online Workout by Haris Falas | SmartyGym</title>
<h1>Bedrock Lift</h1>
<link rel="canonical" href="https://smartygym.com/workout/strength/bedrock-lift" />
```

and the old ID URL:

```text
https://smartygym.com/workout/strength/FREE-int-strength-E-1777866547411
```

redirects or replaces to:

```text
https://smartygym.com/workout/strength/bedrock-lift
```

Same rule for every workout, every training program, every blog article, and every tool.