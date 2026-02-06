

## Fix: Duration Filters -- Complete Alignment Across All Pages + Mobile + Dark Mode

### Issues Found

**Issue 1: Duration filter options are completely out of sync with actual database data**

The database has workouts with these durations (excluding micro-workouts/recovery/pilates):
- 25 min: 2 workouts
- 30 min: 9 workouts
- 35 min: 28 workouts
- 40 min: 39 workouts (most common!)
- 45 min: 28 workouts
- 50 min: 21 workouts
- 55 min: 11 workouts
- 60 min: 10 workouts
- 65 min: 2 workouts
- 70 min: 6 workouts
- 75 min: 2 workouts
- VARIOUS: 1 workout

But the public filters show: 15 min, 20 min, 30 min, 45 min, 60 min, Various -- zero workouts exist at 15 min or 20 min. The filters literally show options that return nothing.

**Issue 2: Filters were only updated in WorkoutFilters.tsx (unused component)**

The previous fix updated `WorkoutFilters.tsx`, but that component is NOT used anywhere in the actual workout pages. The actual filters are in `WorkoutDetail.tsx` using `CompactFilters`. So the fix did nothing.

**Issue 3: Filter mismatch across 4 locations**

Duration filters exist in 4 separate places with different, inconsistent values:

| Location | Current Options | Used? |
|---|---|---|
| `WorkoutDetail.tsx` (public workout pages) | 15, 20, 30, 45, 60, Various | YES - main page |
| `WorkoutsManager.tsx` (admin table) | 15, 20, 30, 45, 60, Various | YES - admin |
| `WorkoutEditDialog.tsx` (admin create/edit) | 15, 20, 30, 45, 60, VARIOUS | YES - admin |
| `WorkoutFilters.tsx` (standalone component) | 30, 45, 50, 60, 75 | NOT USED |
| `SmartlySuggestModal.tsx` (AI suggest) | 15, 30, 45, 60+ | YES - suggest |

**Issue 4: Mobile layout -- filters overflow off-screen**

The `CompactFilters` component uses `flex items-center gap-2` with fixed-width selects (`w-[130px]`). With 7 filters (Equipment, Level, Format, Duration, Access, Status, Sort), they overflow horizontally on mobile. The Duration filter (4th in line) is off-screen.

**Issue 5: Dark mode -- black text on dark background when selecting filter options**

The `SelectItem` component uses `focus:bg-accent focus:text-accent-foreground`. In dark mode:
- `--accent` = `195 82% 55%` (blue)
- `--accent-foreground` = `0 0% 15%` (near-black, 15% lightness)

This means focused/highlighted items show near-black text on a blue background -- very hard to read. The `accent-foreground` should be white in dark mode.

**Issue 6: "Various" option was removed from WorkoutFilters.tsx**

The previous fix removed "Various" from the duration options, even though 1 workout has "VARIOUS" as its duration.

---

### The Solution

#### Part 1: Define correct duration options based on actual data

Since workouts range from 25-75 min, the logical filter buckets using ranges are:
- **30 min** (catches 25-34 min = 30 workouts)
- **40 min** (catches 35-44 min = 67 workouts)
- **50 min** (catches 45-54 min = 49 workouts)
- **60 min** (catches 55-64 min = 23 workouts)
- **75 min** (catches 65-75 min = 10 workouts)
- **Various** (catches anything else)

The filter logic needs to change from exact match to range match:
- "30" matches 25-34
- "40" matches 35-44
- "50" matches 45-54
- "60" matches 55-64
- "75" matches 65-79

#### Part 2: Update all 5 files with consistent options

**File 1: `src/pages/WorkoutDetail.tsx`** (public workout category pages)
- Update `DurationFilter` type to `"all" | "30" | "40" | "50" | "60" | "75" | "various"`
- Update filter options array: `30 min, 40 min, 50 min, 60 min, 75 min, Various`
- Update filter logic (lines 231-248) to use range matching instead of exact match
- Update `standardDurations` for "various" catch-all

**File 2: `src/components/admin/WorkoutsManager.tsx`** (admin workout table)
- Update duration filter options (lines 619-626) to: 30, 40, 50, 60, 75, Various
- Update filter logic (lines 105-122) to use range matching

**File 3: `src/components/admin/WorkoutEditDialog.tsx`** (admin create/edit form)
- Update `DURATION_OPTIONS` (lines 49-56) to: 30 min, 35 min, 40 min, 45 min, 50 min, 55 min, 60 min, 70 min, 75 min, VARIOUS
- This is a dropdown for setting exact duration, so it keeps specific values (not ranges)

**File 4: `src/components/WorkoutFilters.tsx`** (standalone - currently unused but should stay consistent)
- Update durations to match: 30, 40, 50, 60, 75

**File 5: `src/components/smartly-suggest/SmartlySuggestModal.tsx`** (AI workout suggestion)
- Update `durationOptions` (lines 62-67) to: 30 min, 45 min, 60 min, 75 min

#### Part 3: Fix mobile layout for CompactFilters

Update `src/components/CompactFilters.tsx` to wrap filters properly on mobile:
- Change container from `flex items-center gap-2` (single row, overflows) to `flex flex-wrap items-center gap-2` so filters wrap to the next line on small screens
- This ensures the Duration filter (and all others) are always visible and tappable

#### Part 4: Fix dark mode select highlight contrast

Update `src/index.css` dark mode variables:
- Change `--accent-foreground` in `.dark` from `0 0% 15%` (near-black) to `0 0% 100%` (white)
- This ensures that when a dropdown item is highlighted/focused, the text is white on blue -- clearly readable

---

### Files to Modify

1. `src/pages/WorkoutDetail.tsx` -- Fix duration type, filter options, and filter logic
2. `src/components/admin/WorkoutsManager.tsx` -- Fix duration filter options and logic
3. `src/components/admin/WorkoutEditDialog.tsx` -- Fix DURATION_OPTIONS for create/edit form
4. `src/components/WorkoutFilters.tsx` -- Fix durations array + add Various back
5. `src/components/smartly-suggest/SmartlySuggestModal.tsx` -- Fix duration options
6. `src/components/CompactFilters.tsx` -- Fix mobile wrapping
7. `src/index.css` -- Fix dark mode accent-foreground for readable select highlights

### What Will NOT Change
- The actual workout data in the database
- The generation logic (already updated in previous fix)
- Training program filters (those use weeks, not minutes -- already correct)
- The filter component structure or design pattern

