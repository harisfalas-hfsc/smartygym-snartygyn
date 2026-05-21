# Plan — Clickable Activity Lists with Full Scrollable Views

## Problem

In `src/pages/UserDashboard.tsx`:
- **My Workouts / My Programs tabs**: Only Favorites and Completed are rendered as lists (and only the first ~4 visible without obvious scroll). Viewed and Rated have count cards but no list at all.
- **My Logbook tab**: Workout Activity and Program Activity show only counts. There is no way to drill in. Check-ins / Calculators / Measurements already have "View All" — Workouts/Programs do not.
- **My Purchases tab**: same drill-in is missing for the equivalent stat cards.

The user wants a single universal pattern: every stat card (Favorites / Completed / Viewed / Rated / In Progress / Purchased) becomes **clickable** and opens a **mobile-optimized scrollable popup** listing every item in that bucket. Remove the big duplicated "Favorite Workouts" / "Completed Workouts" list cards in favor of this.

## Solution

Build one reusable component and wire every stat card to it.

### 1. New component: `src/components/dashboard/ActivityListSheet.tsx`

A controlled Radix `Sheet` (shadcn) that:
- On desktop: opens as a right-side sheet, max width ~480px, full height.
- On mobile: opens as a bottom sheet, max height `85vh`, rounded top, with a drag handle. Internal body is a flex column with header + scrollable list (`overflow-y-auto`) so the X stays pinned and content never overlaps it. Safe-area padding bottom (`pb-[env(safe-area-inset-bottom)]`).
- Header: icon + title + count + close button (already provided by Sheet).
- Body: list of cards (workout or program) reusing the existing row markup from the current Favorites/Completed lists. Each row is clickable → navigates via existing `handleNavigateToWorkout` / `handleNavigateToProgram` and closes the sheet.
- Empty state: same "No X yet" muted copy currently used.
- Optional search/filter input at top when list length > 10 (nice-to-have, kept simple).

Props:
```ts
{ open, onOpenChange, title, icon, items, kind: 'workout' | 'program', onItemClick }
```

### 2. Wire stat cards as triggers (universal)

Convert every stat `Card` in these sections into `<button>` / `Card role="button"` that opens the sheet for that bucket. Add a tiny "View all" chevron in the corner so the affordance is obvious. Keyboard accessible (`Enter`/`Space`).

Sections to update in `src/pages/UserDashboard.tsx`:

- **My Workouts tab** (~lines 1241–1351):
  - Favorites, Completed, Viewed, Rated → all clickable.
  - **Delete** the duplicated "Favorite Workouts" + "Completed Workouts" big list cards (lines 1292–1351). The sheet replaces them.
- **My Programs tab** (~lines 1379–1488):
  - Favorites, Completed, Viewed, Rated (and any In Progress count) → clickable.
  - **Delete** the duplicated big list cards (lines 1430–1486).
- **My Logbook tab** — Workout Activity (~1624–1672) and Program Activity (~1678–1738): every count card becomes clickable into the same sheet. (Already-existing Check-ins/Calculators/Measurements row stays as-is.)
- **My Purchases tab**: same treatment for the equivalent stat cards there.

State: one `useState` per tab with `{ kind, bucket } | null`, or a single shared `activeSheet` state at page level. Selecting an item also handles `free-workout`/`free-program` types because navigation already does.

### 3. Data sources (already in component)

Reuse existing arrays already computed in `UserDashboard`:
- `favoriteWorkouts`, `completedWorkouts`, `viewedWorkouts`, `ratedWorkouts`
- `favoritePrograms`, `completedPrograms`, `viewedPrograms`, `ratedPrograms`, `inProgressPrograms`
- For Purchases: existing purchased list (`purchasedWorkoutIds` / matching enriched arrays already used in that section).

No new queries, no schema changes, no backend changes.

### 4. Access-level behavior (per existing rules in `docs/access_rules.md` and `AccessControlContext`)

- Free users with purchases: same buckets shown but lists are already filtered by `purchasedWorkoutIds` / `purchasedProgramIds` upstream. The sheet just shows whatever is in those arrays — so Favorites/Completed/Viewed/Rated for a free user will only contain their purchased items. No new gating logic needed.
- Premium-only tabs (Programs, Logbook) keep their existing premium gate Card above; sheet never opens for non-eligible users because the trigger cards live inside the gated branch.
- Rating / favoriting permissions are unchanged — this PR is read-only display.

### 5. Mobile optimization (universal)

- Sheet `side="bottom"` when `useIsMobile()` is true, `side="right"` otherwise.
- Max 92vh on mobile so the user always sees the browser chrome / back gesture area; internal body scrolls.
- Tap targets ≥ 44px. Close (X) has `min-h-11 min-w-11` and sits in a sticky header so list content cannot overlap it (the Edge/Samsung overlap issue from the prior thread does not repeat).
- No horizontal scroll; long names truncate with `line-clamp-2`.
- Test viewports during verification: 360, 390, 414, 768, 1024, 1280.

## Technical notes

- Use existing shadcn `Sheet`, `ScrollArea`, `Badge`, `Button`. No new deps.
- Keep all changes inside `src/pages/UserDashboard.tsx` plus one new file `src/components/dashboard/ActivityListSheet.tsx`. No DB, no edge functions, no RLS, no Stripe.
- Preserve the existing "Upgrade to Premium" banner for free users above the stat grid.
- Keep semantic tokens (no raw colors). Reuse the existing icon + color combos (`Heart text-red-500`, `CheckCircle text-green-500`, `Clock text-blue-500`, `Star text-yellow-500`, `Play text-purple-500`).

## Verification (will be done before reporting done)

After implementing, I will:
1. Run the build to confirm no TS / lint errors.
2. Open the preview at `/dashboard` (or wherever UserDashboard mounts) and click every stat card in: My Workouts, My Programs, My Logbook, My Purchases — confirming each opens a sheet with a fully scrollable list and a reachable close button.
3. Switch the preview to mobile viewport (390×844) and repeat — confirming the bottom sheet scrolls, the X is not overlapped, and no horizontal overflow.
4. Confirm clicking a row navigates to the workout/program and closes the sheet.
5. Confirm the duplicated big "Favorite Workouts"/"Completed Workouts" list cards are gone and layout doesn't break on desktop.
6. Only after all six checks pass will I report done.
