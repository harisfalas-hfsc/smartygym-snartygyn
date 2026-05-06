## Goal

Rename the **Take a Tour** page to **About SmartyGym**, add four new sections (Smarty Tools, Exercise Library, Community, Blog) using the exact same card/icon/description pattern as the existing sections, place the menu link first in the hamburger order, and keep everything mobile-friendly.

## Changes

### 1. Rename page file & route
- Rename `src/pages/TakeATour.tsx` → `src/pages/AboutSmartyGym.tsx` (rename component to `AboutSmartyGym`).
- New canonical route: `/about` (matches the page name).
- Keep `/takeatour` and `/take-a-tour` as **aliases** that render the same component (zero broken external links / SEO redirects).
- Update import in `src/App.tsx` and add the alias routes.

### 2. Page content updates (`AboutSmartyGym.tsx`)
- Update `<title>`, meta description, OG tags, canonical, breadcrumb label, and H1 from "Take a Tour" → "About SmartyGym".
- Keep existing section order: What is SmartyGym → Workout of the Day → Smarty Workouts → Smarty Programs → Smarty Ritual → Logbook & Progress Tracking.
- **Insert four NEW cards** between Logbook and Subscription Plans, using the exact same `Card / CardHeader / CardTitle (icon + name) / CardContent` pattern with description paragraph, supporting mini-grid where useful, and a "Explore" outline button at the bottom:
  1. **Smarty Tools** — `Wrench` icon (orange-500). Description of the free fitness calculators (1RM, BMR, Macro, Calorie Counter). CTA → `/tools`.
  2. **Exercise Library** — `BookOpen` icon (emerald-500). Description of the searchable exercise database with descriptions, instructions, and video demos. CTA → `/exerciselibrary`.
  3. **Community** — `Users` icon (cyan-500). Description of leaderboards, ratings, and member interactions. CTA → `/community`.
  4. **Blog** — `Newspaper` icon (red-500). Description of expert fitness/nutrition articles by Haris Falas. CTA → `/blog`.
- Same color/spacing tokens, same `mb-6 border border-border` card styling, same responsive grids (`grid-cols-1 md:grid-cols-2/3`), same prose color (`text-muted-foreground`).
- Update breadcrumb: `Home › About SmartyGym`.

### 3. Navigation reorder (`src/components/Navigation.tsx`)
- Move the menu item to **first position** in `discoveryItems`, before "Smarty Workouts".
- Rename label "Take a Tour" → "About SmartyGym", path → `/about`, keep `Info` icon + teal-500 color.
- This single array drives both desktop and mobile hamburger menus → mobile parity automatic.

### 4. Touch-up other references
- `src/pages/Auth.tsx` line 386: `navigate("/take-a-tour")` → `navigate("/about")`.
- `src/components/growth/FreeTrialPopup.tsx`: include `/about` in the `isTakeATour` (rename to `isAboutPage`) check so the trial popup behavior is preserved on the renamed page.
- `public/sitemap.xml`: update `/takeatour` entry to `/about` (keep alias also indexed).

## Out of scope / preserved

- No visual restyling of existing 6 sections.
- No layout/structure changes elsewhere on the site.
- Mobile breakpoints unchanged (existing responsive classes already mobile-first).
- Existing SEOEnhancer, breadcrumbs, and trial popup logic preserved.

## Files touched

- `src/pages/TakeATour.tsx` → renamed to `src/pages/AboutSmartyGym.tsx` (content updates + 4 new cards)
- `src/App.tsx` (import + routes)
- `src/components/Navigation.tsx` (reorder + rename)
- `src/pages/Auth.tsx` (navigate path)
- `src/components/growth/FreeTrialPopup.tsx` (path check)
- `public/sitemap.xml` (URL entry)
