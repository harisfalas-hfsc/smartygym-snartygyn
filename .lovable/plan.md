

# Upgrade Analytics: Full Event Tracking & Enhanced Dashboard

## Overview
Currently, your analytics only tracks a single "visit" event per session with the landing page. This upgrade adds comprehensive behavioral tracking (page navigation, scroll depth, CTA clicks, time on page, exit detection) and surfaces all this new data in the admin Website Analytics dashboard.

## What You'll Get
- **Page Navigation Tracking** — Every page change is recorded, so you can see user journeys (which pages they visit after landing, in what order)
- **Scroll Depth** — Know if visitors read 25%, 50%, 75%, or 100% of each page
- **CTA Click Tracking** — Track clicks on key buttons: "Join Premium", "View Plans", "Sign Up", "Contact", "Shop" etc.
- **Time on Page** — How long visitors spend on each page before navigating away
- **Exit Detection** — Which page users are on when they leave your website
- **Enhanced Dashboard** — New sections in admin analytics showing all this data with charts and tables

## Technical Plan

### Step 1: Add new event types to tracking system
**File: `src/utils/socialMediaTracking.ts`**
- Expand `TrackEventParams.eventType` to include: `page_view`, `scroll_depth`, `cta_click`, `time_on_page`, `exit`
- Add new tracking functions:
  - `trackPageNavigation(path)` — fires on every route change (not just first visit)
  - `trackScrollDepth(path, depth)` — fires at 25/50/75/100% scroll thresholds using IntersectionObserver
  - `trackCTAClick(ctaName, path)` — fires when key CTAs are clicked
  - `trackTimeOnPage(path, seconds)` — fires when user leaves a page
  - `trackExit(path)` — fires on `beforeunload` / `visibilitychange`
- Use `event_value` field for numeric data (scroll %, seconds) and `landing_page` for the page path
- Use `utm_content` field to store extra context (CTA name, scroll milestone) to avoid schema changes

### Step 2: Integrate tracking into the app
**File: `src/App.tsx`** (or a new `src/components/AnalyticsTracker.tsx` component)
- Create an `<AnalyticsTracker />` component that:
  - Listens to route changes via `useLocation()` and calls `trackPageNavigation`
  - Sets up scroll depth observers on each page
  - Tracks time on page using `performance.now()` or timestamps
  - Registers `beforeunload` and `visibilitychange` listeners for exit detection
- CTA click tracking: Add a utility `trackCTA(name)` that can be called from onClick handlers on key buttons, or use a data attribute approach with a global click listener for `[data-track-cta]` elements

### Step 3: Add data attributes to key CTAs
**Files: Various page components**
- Add `data-track-cta="join-premium"` to Join Premium buttons
- Add `data-track-cta="view-plans"` to pricing/plans buttons
- Add `data-track-cta="signup"` to sign up buttons
- Add `data-track-cta="contact"` to contact buttons
- The global click listener in AnalyticsTracker catches these automatically — no need to modify every component individually

### Step 4: Upgrade the admin analytics dashboard
**File: `src/components/admin/analytics/WebsiteAnalytics.tsx`**
- Add new sections after the existing ones:

1. **User Journey / Page Flow** — Show which pages users navigate to after landing (top page transitions, e.g., "/" → "/workout" → "/joinpremium"), with a flow table
2. **Scroll Depth by Page** — Bar chart showing average scroll depth per page (which pages get fully read vs. abandoned early)
3. **CTA Performance** — Table showing each CTA's click count, which pages they're clicked from, and conversion context
4. **Time on Page** — Average time spent per page, sorted by engagement
5. **Exit Pages** — Which pages users leave from most often (exit rate per page)

Each section follows existing pattern: chart + data table + CSV export button.

### Step 5: Database optimization
- Add a database index on `(event_type, landing_page)` for faster analytics queries on new event types
- No new tables needed — reuses existing `social_media_analytics` table with new event_type values

## Performance Safeguards
- Scroll tracking uses `IntersectionObserver` (no scroll event spam)
- Events are debounced/throttled — scroll depth fires max 4 times per page (25/50/75/100)
- Time on page only fires once per page navigation
- Exit event fires once via `visibilitychange` (reliable on mobile)
- All tracking respects existing `shouldExcludeFromTracking()` logic (no admin/preview/bot tracking)

## Files Changed
- `src/utils/socialMediaTracking.ts` — new tracking functions
- `src/components/AnalyticsTracker.tsx` — new component for automated tracking
- `src/App.tsx` — mount AnalyticsTracker
- `src/components/admin/analytics/WebsiteAnalytics.tsx` — 5 new dashboard sections
- Database migration — index on `(event_type, landing_page)`
- Minor edits to CTA buttons across pages (adding `data-track-cta` attributes)

