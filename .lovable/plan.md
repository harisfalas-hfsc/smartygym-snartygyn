

# Make Exercise Library Popup More Compact on Mobile

## Summary

Two changes to improve the Exercise Library tool in workout pages:

1. **More compact popup on mobile** - Reduce the popup height so it doesn't take the full screen, making it clearer where the popup ends and the workout content is
2. **Rename button** - Change "Exercises" to "Exercise Library" for clarity

---

## Changes

### 1. Make Exercise Library Popup More Compact (Mobile Only)

**File:** `src/components/ExerciseLibraryPopup.tsx`

Current styling takes too much screen space on mobile:
- `max-h-[85vh]` - Uses 85% of screen height
- `h-[50vh]` for ScrollArea - Uses 50% of screen height

New responsive styling for mobile only:
- `max-h-[70vh] sm:max-h-[85vh]` - Reduces to 70% on mobile, keeps 85% on desktop
- `h-[35vh] sm:h-[50vh]` for ScrollArea - Reduces to 35% on mobile, keeps 50% on desktop
- Add visible border styling to make the popup boundaries clearer in dark mode

### 2. Rename Button from "Exercises" to "Exercise Library"

**File:** `src/components/WorkoutToolsMobile.tsx`

Change the button text:
- From: `<span className="text-xs sm:text-sm">Exercises</span>`
- To: `<span className="text-xs sm:text-sm">Exercise Library</span>`

---

## Why This Works Globally

Since both files are shared components used by `WorkoutDisplay.tsx`, these changes automatically apply to:

- All 184 existing workouts
- All 28 existing training programs
- All future AI-generated or manually-created content

No individual updates needed - the component-based architecture handles this.

---

## Technical Details

| Change | File | Line(s) |
|--------|------|---------|
| Compact popup height | `ExerciseLibraryPopup.tsx` | Line 66 (DialogContent), Line 103 (ScrollArea) |
| Button rename | `WorkoutToolsMobile.tsx` | Line 47 |
| Dark mode visibility | `ExerciseLibraryPopup.tsx` | Line 66 (add border styling) |

