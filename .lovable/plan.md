## Why heights differ today

In `src/pages/Community.tsx`, all mobile carousel slides (Leaderboard, Ratings, Comments, Testimonials) are sized to match the **Leaderboard card** via `leaderboardCardRef` → `mobileCarouselCardHeight`.

- Logged out / non-premium: Leaderboard renders the small `LockedLeaderboardBody` → short reference height → every slide is short.
- Logged in (premium / purchaser): Leaderboard renders the full ranked table (10 rows) → tall reference height → every slide is tall.

That's why the carousel "shrinks" for visitors and "grows" once you log in.

## Fix

Stop using the leaderboard card as the height reference. Use a single deterministic height for the mobile carousel that does not depend on auth state or leaderboard contents.

Approach: use a viewport-based fixed height for all mobile carousel slides.

- Replace the `leaderboardCardRef` + ResizeObserver measurement with a constant:
  `const MOBILE_CAROUSEL_HEIGHT = "70vh";` (clamped, e.g. `min(640px, 70vh)` via Tailwind arbitrary value `h-[min(640px,70vh)]`).
- Apply this height to every mobile carousel `<Card>` (Leaderboard, Ratings, Comments, Testimonials) instead of the inline `style={{ height: mobileCarouselCardHeight }}`.
- Keep the existing `min-h-0 overflow-auto` on each `CardContent` so inner content scrolls within the fixed card.
- Remove now-unused state: `mobileCarouselCardHeight`, `setMobileCarouselCardHeight`, `leaderboardCardRef`, and the measurement `useEffect`.

Result: identical card size for guests, free subscribers, subscribers-with-purchase, and premium users. Tall content (full leaderboard, long comments list) scrolls inside the card, exactly like the Comments slide already does.

## Files touched

- `src/pages/Community.tsx` (only)

## Out of scope

- Desktop layout (columns already have their own heights; user only reported mobile inconsistency).
- Any access-control / data-fetching changes.
