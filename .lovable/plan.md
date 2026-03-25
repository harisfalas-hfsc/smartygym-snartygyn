

# Add 6 New Competitors to the Comparison Table

## What's missing
The comparison table (`competitorComparisonData`) only has 7 columns: SmartyGym + 6 original competitors. The 6 new competitors (Fitbod, Sweat, FIIT, Centr, Alo Moves, Obé Fitness) need to be added.

## Changes

### `src/data/bestFitnessPlatformData.ts`
Add 6 new entries to `competitorComparisonData.competitors[]`, each with:
- `name`, `url`, `highlight: false`, `seoSlug`, `comparisonSummary`, `vsKeywords[]`
- `values[]` — 11 feature values matching the existing feature rows (Content Creator, Total Workouts, Workout Formats, Equipment Required, Free Content, Structured Programs, Free Tools, Daily Ritual, Pricing, Device Lock-in, AI Content)

New competitor data:
- **Fitbod** — AI-generated strength plans, $12.99/mo, app-only
- **Sweat (Kayla Itsines)** — celebrity trainer programs, $19.99/mo, app-only
- **FIIT** — UK-based interactive classes, £10–20/mo, requires tracker
- **Centr (Chris Hemsworth)** — celebrity-driven holistic fitness, $29.99/mo, app-only
- **Alo Moves** — yoga/mindfulness focus, $14/mo, web+app
- **Obé Fitness** — live streaming classes, $27/mo, app-only

### `src/components/seo/BestFitnessSections.tsx`
Update the table's `aria-label` and intro paragraph to mention all 12 competitors instead of just the original 6.

### `src/data/bestFitnessPlatformData.ts` — also add `competitorMatchupDetails` entries
Add 6 new matchup detail entries for the expandable accordion cards (Fitbod, Sweat, FIIT, Centr, Alo Moves, Obé Fitness) with `competitor`, `heading`, `bullets[]`, `verdict`, and `reverseQueries[]`.

## What stays untouched
- All existing competitor data — no modifications
- Page layout, styling, component structure unchanged
- llms.txt and ai.txt already have these competitors

