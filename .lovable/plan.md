## Problem

Three issues with the new `ActivityListSheet` on `/userdashboard`:

1. **No visible close/back button** inside the popup. Users only have the OS back gesture, which navigates away from the dashboard tab entirely.
2. **Mobile**: sheet is edge-to-edge (touches left, right and bottom of the screen). It should look like the mobile hamburger menu — a floating panel with rounded corners and margin from every edge, sitting above the screen edges.
3. **Desktop**: sheet is full-height flush to the right edge. It should also float with margin top/bottom/right, matching the elegance of the hamburger panel.

Also: closing the popup must keep the user on the exact same dashboard tab they were on (e.g. `?tab=workouts`), never navigate away.

## Solution

Edit only `src/components/dashboard/ActivityListSheet.tsx`. No changes to `UserDashboard.tsx` data wiring, routing, or any backend.

### 1. Replace shadcn `Sheet` with shadcn `Dialog`

`Dialog` gives us a true centered/floating modal on both viewports and ships with a built-in close (X) button in the top-right corner. Sheets are designed to dock to an edge, which is the opposite of what we want now.

- Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from `@/components/ui/dialog`.
- Keep the same prop signature (`open`, `onOpenChange`, `title`, `icon`, `items`, `onItemClick`) so `UserDashboard.tsx` does not change.

### 2. Floating panel styling (matches mobile hamburger menu)

Apply these classes to `DialogContent`:

- Mobile (default): `fixed inset-x-3 top-[max(env(safe-area-inset-top),0.75rem)+3.5rem] bottom-[max(env(safe-area-inset-bottom),0.75rem)+3.5rem] w-auto max-w-none translate-x-0 translate-y-0 left-3 right-3 rounded-2xl border border-border shadow-2xl p-0 flex flex-col gap-0 overflow-hidden`
  - `top` offset accounts for the app header; `bottom` offset accounts for the mobile bottom nav bar so the popup never touches it.
- Desktop (`sm:`/`md:`): `sm:inset-auto sm:right-6 sm:top-24 sm:bottom-6 sm:left-auto sm:w-[440px] sm:max-w-[440px] sm:rounded-2xl`
  - Floats on the right with breathing room from every edge, not flush to the screen edge.

### 3. Visible close button

Dialog already renders a top-right `X`. Make sure it stays visible and reachable:
- Header is `sticky top-0 bg-background z-10` with `pr-12` so the title never sits under the X.
- Ensure the close button has `min-h-11 min-w-11` for touch targets (it already does via shadcn defaults; verify).
- Add a secondary `Back` button at the bottom of the panel for mobile users who prefer that affordance: a full-width `<Button variant="outline">Back</Button>` inside a sticky footer that calls `onOpenChange(false)`. This guarantees the user never needs the OS back gesture and therefore never leaves the dashboard tab.

### 4. Preserve dashboard tab on close

The popup is purely local React state in `UserDashboard.tsx` (`activitySheet`). Closing it via the X or the new Back button only flips that state — it does not navigate. Confirmed by re-reading `UserDashboard.tsx`. No router changes needed; the current `?tab=workouts` URL stays intact.

Item rows still call `onItemClick(item)` then `onOpenChange(false)` — navigation happens only when the user explicitly taps a workout/program row, which is the intended behavior.

### 5. Internal scroll + safe-area

Body remains `flex-1 overflow-y-auto`, with `pb-4` (the panel itself already has bottom margin from the screen edge, so no need for `env(safe-area-inset-bottom)` padding inside).

## Verification

1. Build passes (no TS errors).
2. Open `/userdashboard?tab=workouts` at 390×844:
   - Tap any stat card → floating panel appears with rounded corners and visible gap on all four sides.
   - X button visible top-right; tap it → panel closes, URL still `?tab=workouts`.
   - Back button at bottom visible without scrolling → tap it → same result.
   - Panel does not overlap the mobile bottom nav bar.
3. Switch to 1280×800:
   - Panel floats on the right with margin from top/bottom/right edges (not flush).
   - X button visible; close keeps the dashboard tab.
4. Tap a workout row → navigates to workout page (existing behavior preserved).

Only after all four checks pass will I report done.
