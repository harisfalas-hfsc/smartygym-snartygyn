## Plan

### 1. Add Subscription Plans section to `src/pages/About.tsx`
Port the "Section 10: Subscription Plans" block from `AboutSmartyGym.tsx` (lines 775-907) into `About.tsx`, placed right before the final CTA (line 525). Includes:
- Gold / Platinum clickable cards (same styling, prices, copy)
- `handlePlanClick` handler invoking Stripe checkout via `STRIPE_PRICE_IDS`
- "Not Ready for a Plan?" standalone-purchase block with Browse Workouts / Programs buttons
- Required imports: `useState`, `STRIPE_PRICE_IDS`, `supabase`, `toast`, `Crown`, `Check`, `Loader2`, `Badge`, `Card*` (already imported)
- Replace the inline "Read More About SmartyGym" link (line 434-440) — point it to `/the-smarty-method` instead (since target page is being deleted), or remove it.

### 2. Delete `/about-smartygym`
- Delete file `src/pages/AboutSmartyGym.tsx`
- Remove from `src/App.tsx`:
  - lazy import (line 65)
  - prefetch (line 155)
  - routes: `/about-smartygym`, `/takeatour`, `/take-a-tour` (lines 342-344)
  - redirects on lines 258-259 (`/why-smartygym`, `/human-performance`) → repoint to `/about`

### 3. Update all references from `/about-smartygym` → `/about`
- `src/components/Navigation.tsx` line 267
- `src/pages/Auth.tsx` line 429
- `src/components/smarty-coach/SmartyCoachModal.tsx` line 380
- `src/components/growth/FreeTrialPopup.tsx` line 40 (path list)
- `src/components/ui/html-content.tsx` line 19 (whitelist)
- `src/pages/WhyInvestInSmartyGym.tsx` line 199
- `public/llms.txt` line 10
- `public/sitemap.xml` line 28

### 4. No backend / DB / design-token changes.