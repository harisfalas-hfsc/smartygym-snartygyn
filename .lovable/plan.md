
# Fix Dashboard Scroll Consistency + Universal Back Navigation

## Problem 1: Scroll Inconsistency

Currently:
- **Favorite Workouts** and **Completed Workouts** have `ScrollArea` with `max-h-[400px]`
- **Favorite Programs** and **Completed Programs** have **no** `ScrollArea` at all -- they grow unbounded

All four lists need the same treatment.

## Problem 2: Back Navigation

Currently, tapping a dashboard section card calls `setActiveTab("workouts")` which only updates React state without changing the URL. The browser has no history entry for it, so swiping back skips the dashboard entirely.

This same principle should work **everywhere** in the app -- swipe back always goes one step back in browser history. If there's no history, go to homepage. Simple.

## Changes

### 1. Consistent Scroll Areas (UserDashboard.tsx)

All four lists get the exact same treatment:

| List | Current | After |
|------|---------|-------|
| Favorite Workouts | `ScrollArea max-h-[400px]` | `ScrollArea max-h-[300px]` |
| Completed Workouts | `ScrollArea max-h-[400px]` | `ScrollArea max-h-[300px]` |
| Favorite Programs | No ScrollArea | `ScrollArea max-h-[300px]` |
| Completed Programs | No ScrollArea | `ScrollArea max-h-[300px]` |

All four cards: identical `ScrollArea` with `max-h-[300px]` and `pr-4` for scrollbar padding.

### 2. Dashboard Tab Navigation via URL (UserDashboard.tsx)

- Change card clicks from `setActiveTab(section.id)` to `navigate('/userdashboard?tab=' + section.id)` -- this creates a browser history entry
- Change desktop "Back to sections" button from `setActiveTab(null)` to `navigate('/userdashboard')` -- pops back to grid
- The existing `useEffect` that reads `searchParams.get('tab')` already syncs URL to state, so this just works

Result: tapping "Workouts" pushes `/userdashboard?tab=workouts` to history. Swiping back goes to `/userdashboard` (the grid). Swiping back again goes to wherever they came from (e.g., homepage).

### 3. Universal Back Behavior Verification

The `NavigationHistoryContext` already tracks navigation history app-wide. The `FixedBackButton` (desktop only) uses it. On mobile, users rely on native swipe-back which uses browser history. By ensuring all in-page navigation uses `navigate()` instead of local state changes, swipe-back naturally works everywhere -- dashboard tabs, messages, workouts, programs, all pages.

No changes needed to the navigation system itself -- it already works correctly. The only fix is making dashboard tab changes go through `navigate()` so they appear in browser history.

## Technical Details

### File: `src/pages/UserDashboard.tsx`

**Line 1156** -- Card grid click handler:
```
// Before
onClick={() => setActiveTab(section.id)}
// After
onClick={() => navigate('/userdashboard?tab=' + section.id)}
```

**Line 1184** -- Back to sections button:
```
// Before
onClick={() => setActiveTab(null)}
// After
onClick={() => navigate('/userdashboard')}
```

**Lines 1264, 1294** -- Workout ScrollAreas:
```
// Before
<ScrollArea className="max-h-[400px] pr-4">
// After
<ScrollArea className="max-h-[300px] pr-4">
```

**Lines 1392, 1410** -- Favorite Programs list: wrap in `ScrollArea className="max-h-[300px] pr-4"`

**Lines 1420, 1438** -- Completed Programs list: wrap in `ScrollArea className="max-h-[300px] pr-4"`
