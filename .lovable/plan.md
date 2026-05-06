## Mobile native-style bottom navigation bar

A persistent bottom bar that appears **only on mobile (< 768px)** across all pages, styled to feel like a native app's bottom toolbar — but using your brand palette (deep navy + electric blue).

### Layout (left → right)

```text
┌─────────────────────────────────────────────────┐
│   ◀ Back      🧠 Coach     🏠 Home    Forward ▶ │
└─────────────────────────────────────────────────┘
```

- **Back** (far left) — same logic as the existing back system: pops the in-app `NavigationHistoryContext` history stack, falls back to `/`. Disabled (dimmed, non-clickable) when there's nothing to go back to.
- **Smarty Coach** (center-left) — opens the existing `SmartyCoachModal`. Uses the brand icon already in `src/assets/smarty-coach-icon.png`.
- **Home** (center-right) — navigates to `/` (homepage).
- **Forward** (far right) — mirrors Back: re-navigates to a path that was popped via Back. Disabled when there's nothing to go forward to.

### Forward button — exact behavior

You asked it to behave like the swipe-forward gesture but as a physical button. To support this we extend `NavigationHistoryContext` with a forward stack:

- When the user clicks **Back**, the popped path is pushed onto a `forwardStack`.
- When the user clicks **Forward**, the top of `forwardStack` is popped and navigated to (and pushed back onto `history`).
- Any **new navigation** (clicking a link, opening a workout, etc.) clears `forwardStack` — exactly like browser/native behavior.
- New context API: `goForward()`, `canGoForward`.

### Styling — native feel, brand colors

- Fixed to bottom, full width, `safe-area-inset-bottom` respected (iOS notch/home-bar safe).
- Background: deep navy `hsl(var(--background))` with subtle top border in `hsl(var(--primary) / 0.2)` and a soft backdrop blur.
- Icons: `lucide-react` (`ChevronLeft`, `Home`, `ChevronRight`) + the Smarty Coach PNG, all in electric blue `hsl(var(--primary))` when active, muted when disabled.
- 4 equal columns, ~56 px tall (native tab-bar height), large touch targets, tap feedback (active scale).
- Visible **only below 768 px** (`md:hidden`). Desktop stays exactly as it is today.
- The page content gets `padding-bottom` reserved via a CSS variable so the bar never covers content.

### Where it doesn't show

- Hidden on `/auth`, `/reset-password`, `/payment-success`, `/payment-cancelled` (same exclusion list already used by `NavigationHistoryContext`).
- Otherwise visible on every page on mobile.

### Files to add / change

- **New** `src/components/MobileBottomNav.tsx` — the bar component.
- **Edit** `src/contexts/NavigationHistoryContext.tsx` — add `forwardStack`, `goForward`, `canGoForward`; clear forward stack on new (non-back) navigation.
- **Edit** `src/App.tsx` — mount `<MobileBottomNav />` once inside `AppContent` (next to `<FixedBackButton />`), and add `padding-bottom: var(--mobile-bottom-nav-h, 0px)` to the main content wrapper. The CSS var is set to ~64 px on mobile, 0 on desktop.
- **Edit** `src/index.css` — define `--mobile-bottom-nav-h` responsively.

### What is NOT changed

- Desktop layout, top navigation, and the existing `FixedBackButton` (desktop-only) are untouched.
- The existing floating Smarty Coach button behavior is preserved on desktop; on mobile it can stay or be hidden in favor of the bar — I'll keep the floating one hidden on mobile to avoid duplication, since the bar already exposes Coach.
- No changes to routing, auth, or any business logic.
