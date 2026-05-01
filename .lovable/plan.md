# Fix Google Search Console "Duplicate field FAQPage" on smartygym.com/

## What Google is telling you

Google Search Console scanned the homepage (`https://smartygym.com/`) and found **two separate FAQPage structured-data blocks** in the page's HTML. Google's spec only allows **one** FAQPage per URL. When it sees two, it rejects the FAQ rich result entirely — which is why it's marked "Critical."

Nothing is wrong with your content or your FAQ answers. It's purely a code-side duplication: two different files are each injecting their own `<script type="application/ld+json">` with `"@type": "FAQPage"` on the same page.

## Where the duplication is

I traced every `FAQPage` reference in the codebase. On the homepage `/`, two components inject FAQ schema:

1. **`src/components/seo/BackgroundSEO.tsx`** (line 213)
   - Rendered globally in `src/App.tsx` (line 123) — so it runs on **every** route, including `/`.
   - Builds a full `@graph` with Organization + FAQPage + HowTo + ItemList. The FAQ block uses route-specific FAQs from its internal page registry.

2. **`src/pages/Index.tsx`** (line 552, using `generateFAQSchema` from `src/utils/seoSchemas.ts`)
   - Injects a second standalone FAQPage script inside the homepage `<Helmet>`.

Result on `/`: two `FAQPage` JSON-LD blocks → "Duplicate field FAQPage."

Other pages that use `generateFAQSchema` (CalorieCounter, WorkoutFlow, CoachProfile, ExerciseLibrary, TrainingProgramFlow, Tools) and the standalone pages with their own inline FAQPage (FAQ, JoinPremium, SmartyPlans, BestOnlineFitnessPlatform) **all have the same duplication** because `BackgroundSEO` also renders an FAQ for each of those routes. Google has only flagged `/` so far, but the same warning will hit those pages next.

## Plan

**Single source of truth: keep `BackgroundSEO` as the only FAQ schema injector.** It already has per-route FAQs, it's centralized, and removing the page-level duplicates is a one-line change per page.

### Step 1 — Homepage (fixes the email immediately)
- `src/pages/Index.tsx`: remove the `<script type="application/ld+json">{JSON.stringify(generateFAQSchema(homepageFAQs))}</script>` line (~line 552) and the unused `generateFAQSchema` import.
- Keep the visible FAQ section on the page — only the duplicate JSON-LD is removed.

### Step 2 — Other pages with the same duplication (prevents future warnings)
Remove the duplicate FAQPage JSON-LD block from:
- `src/pages/CalorieCounter.tsx`
- `src/pages/WorkoutFlow.tsx`
- `src/pages/CoachProfile.tsx`
- `src/pages/ExerciseLibrary.tsx`
- `src/pages/TrainingProgramFlow.tsx`
- `src/pages/Tools.tsx`
- `src/pages/JoinPremium.tsx` (inline FAQPage at line 217)
- `src/pages/SmartyPlans.tsx` (inline FAQPage at line 259)
- `src/pages/BestOnlineFitnessPlatform.tsx` (inline FAQPage at line 179)

For each: delete only the FAQPage JSON-LD `<script>`. Keep all visible FAQ UI, all other schemas (Course, Product, ExercisePlan, etc.), and all meta tags untouched.

### Step 3 — `/faq` page
`src/pages/FAQ.tsx` is the canonical FAQ page. Two options:
- (a) Keep its own FAQPage schema and **exclude `/faq` from BackgroundSEO's FAQ injection** so this page remains the authoritative source. Recommended.
- (b) Remove the inline one and rely on BackgroundSEO.

I recommend (a) because the dedicated `/faq` page should own the richest, longest FAQ list, while BackgroundSEO carries shorter route-specific FAQs everywhere else.

### Step 4 — Verify
After publishing, paste `https://smartygym.com/` into Google's Rich Results Test (https://search.google.com/test/rich-results). It should report exactly one FAQPage. The Search Console warning will clear automatically on the next crawl (typically a few days).

## What you don't need to do

- No content changes — your FAQ answers are fine.
- No changes to `seoSchemas.ts` itself (the helper stays, just stops being called from pages).
- No SEO ranking risk — Google was already ignoring both blocks because of the duplication, so removing one only helps.

Once you approve, I'll switch to build mode and apply the edits.