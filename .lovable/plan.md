## Problem

On mobile, every page shows a large empty gap between the page content and the footer. The amount varies (more empty space when the "Join SmartyGym Now" CTA is hidden for logged-in/premium users), but it appears on **every page** — homepage, workouts, training programs, logbook, measurements, all 500+ dynamic pages.

## Root cause

In `src/App.tsx`, the layout wrapper uses:

```tsx
<div className="flex flex-col min-h-screen">
  <Navigation />
  <div className="md:flex-1" style={{ paddingTop: '...' }}>
    <Routes />
  </div>
  <Footer />
</div>
```

- `min-h-screen` forces the column to be at least 100vh tall.
- `md:flex-1` only makes the content area grow on screens ≥768px (tablet/desktop).
- On mobile, no child has `flex-1`, so the leftover space inside the `min-h-screen` column appears as a gap, and the footer is pushed away from the content.

This is exactly the same "sticky footer" pattern problem — the growing child must exist at every breakpoint, not only desktop.

## Fix

Change one class in `src/App.tsx`:

- `md:flex-1` → `flex-1`

That makes the content area absorb all leftover vertical space on mobile too. Result:
- **Short content pages** (e.g. homepage logged-in as premium): footer sits at the bottom of the viewport with no awkward gap above it.
- **Long content pages** (e.g. a full workout, training program, blog article): footer sits naturally right after the content, as it does today.

Tablet and desktop behavior is unchanged because `flex-1` already applied there.

## Scope

- **One file:** `src/App.tsx`
- **One class change:** `md:flex-1` → `flex-1`
- No changes to Navigation, Footer, or any individual page.
- No CSS, no responsive breakpoint changes.
- Applies automatically to all 500+ pages because they all render inside this wrapper.

## Out of scope

- The page-count question is answered in chat (≈70 static routes + hundreds of dynamic ones — every workout, program, and article is its own URL).
- No design or content changes.
