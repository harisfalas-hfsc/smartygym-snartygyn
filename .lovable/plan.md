# Landing Router Page — "What do you want to do today?"

## Goal
Add a new first-screen landing page where users pick a destination from a single prominent dropdown and get routed to the corresponding flow. Existing homepage (`Index.tsx`) remains untouched and reachable.

## Routing change
- New route `/start` → `LandingRouter` page.
- Keep `/` → `Index` (current homepage) unchanged so existing SEO, links, and marketing are preserved.
- Optional follow-up (not in this plan): make `/start` the default for first-time visitors via a localStorage flag. We will NOT auto-redirect `/` by default to avoid breaking SEO and existing user flows.

If you'd rather have `/` itself become the new dropdown landing and move the current homepage to `/home`, say the word and I'll swap it in implementation.

## The Page (`src/pages/LandingRouter.tsx`)
Clean, centered, full-height hero:
- SmartyGym logo + headline: "What do you want to do today?"
- Sub-line: "Pick a destination and we'll take you there."
- A single large `Select` (shadcn `@/components/ui/select`) with grouped options.
- Primary `Button` "Go" → navigates to chosen route.
- Secondary link: "Or browse the full homepage" → `/`.
- Uses existing brand styling (dark theme, electric blue accent #29B6D2), no new colors.
- `Helmet` with title/description for SEO.

### Dropdown options (label → route)
Grouped via `SelectGroup` / `SelectLabel`:

Train
- Workout of the Day → `/workout/wod`
- Daily Smarty Ritual → `/daily-ritual`
- Browse Workouts → `/workout`
- Training Programs → `/trainingprogram`
- WOD Archive → `/wod-archive`

Tools
- Smarty Tools (all) → `/tools`
- Workout Timer → `/workouttimer`
- 1RM Calculator → `/1rmcalculator`
- BMR Calculator → `/bmrcalculator`
- Macro Calculator → `/macrocalculator`
- Calorie Counter → `/caloriecounter`
- Exercise Library → `/exerciselibrary`

Learn
- Blog → `/blog`
- The Smarty Method → `/the-smarty-method`
- About / Coach → `/about`
- FAQ → `/faq`

Account & More
- My Dashboard → `/userdashboard`
- Join Premium → `/joinpremium`
- Shop → `/shop`
- Community → `/community`
- Contact → `/contact`

All routes verified against `src/App.tsx` route table.

## Behavior
- On selection + "Go" click → `navigate(route)`.
- Pressing Enter while focused on the Select also triggers navigation.
- "My Dashboard" route is protected; the existing `ProtectedRoute` will handle redirect to `/auth` if not signed in. No extra logic needed here.

## Files
- Add: `src/pages/LandingRouter.tsx`
- Edit: `src/App.tsx` — import `LandingRouter`, add `<Route path="/start" element={<LandingRouter />} />` above the catch-all.

## Out of scope
- No changes to `Index.tsx`, navigation bar, or footer.
- No analytics/tracking changes beyond the existing global `AnalyticsTracker`.
- No DB or backend changes.
