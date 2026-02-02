
# Workout Assistant Toolbar - Test Implementation for "Summit Forge"

## Overview

Adding a floating toolbar with three quick-access tools (Timer, 1RM Calculator, Exercise Library) to the "Summit Forge" workout (ID: `WOD-CH-B-1769985007209`) as a test. If you like it, we can easily extend this to all workouts and training programs.

---

## What You'll Get

A compact toolbar appearing above the workout content with three icon buttons:

| Tool | Icon | Function |
|------|------|----------|
| Timer | Clock | Work/rest interval timer with customizable rounds |
| 1RM Calculator | Calculator | Quick strength estimation with training percentages |
| Exercise Library | Dumbbell | Search exercises and view GIF demonstrations |

Each button opens a popup dialog, so users never leave the workout page.

---

## Implementation Approach

### For Testing Only on "Summit Forge"

Instead of modifying the shared `WorkoutDisplay.tsx` component (which would affect all workouts), we'll:

1. Create the toolbar components
2. Add the toolbar specifically in `IndividualWorkout.tsx` only when the workout ID matches "Summit Forge"
3. This lets you test without affecting other content

### Files to Create

| New File | Purpose |
|----------|---------|
| `src/components/WorkoutToolbar.tsx` | Main toolbar with 3 icon buttons |
| `src/components/WorkoutTimerPopup.tsx` | Timer dialog (same functionality as current inline timer) |
| `src/components/OneRMCalculatorPopup.tsx` | Compact 1RM calculator dialog |
| `src/components/ExerciseLibraryPopup.tsx` | Searchable exercise library dialog |

### File to Modify

| File | Change |
|------|--------|
| `src/pages/IndividualWorkout.tsx` | Add conditional WorkoutToolbar for Summit Forge workout |

---

## Component Details

### WorkoutToolbar
- Horizontal bar with 3 buttons: Timer, Calculator, Library
- Each button has an icon and opens its respective popup
- Responsive: icons only on mobile, icons + labels on desktop
- Styled to match existing design (primary color accents)

### WorkoutTimerPopup
- Extracts timer logic from `WorkoutDisplay.tsx` (lines 146-220)
- Dialog wrapper using Radix Dialog
- Same work/rest/rounds inputs and start/stop/reset controls
- Audio beep on interval changes

### OneRMCalculatorPopup
- Simplified version of `src/pages/OneRMCalculator.tsx`
- Exercise selector, weight input, reps input
- Calculate button shows result and training percentages
- Save to history button for logged-in users
- Compact grid layout for popup format

### ExerciseLibraryPopup
- Uses existing `useExerciseLibrary` hook for search
- Search input with debounced live results
- Exercise cards showing name, target muscle, equipment
- Clicking an exercise opens `ExerciseDetailModal` (reused) with GIF
- Limited to 15 results for performance

---

## User Experience

1. User opens "Summit Forge" workout
2. Sees new toolbar above the workout content
3. Clicks "Exercise Library" button
4. Popup opens with search bar
5. Types "squat" and sees matching exercises
6. Clicks "Goblet Squat"
7. Sees GIF demonstration, target muscles, instructions
8. Closes popup and continues workout

---

## Technical Notes

- Exercise Library popup only loads data when opened (lazy loading)
- Search is debounced by 300ms to avoid excessive filtering
- GIFs use white background container (per existing pattern from ExerciseDetailModal)
- All popups can be closed with Escape key or clicking outside
- Mobile-friendly with full-width popups on small screens

---

## After Testing

Once you approve, expanding to all workouts/programs is simple:
- Move the toolbar from `IndividualWorkout.tsx` into `WorkoutDisplay.tsx`
- Remove the "Summit Forge" ID check
- All content using WorkoutDisplay automatically gets the toolbar

---

## Estimated Changes

- Create 4 new component files
- Modify 1 page file (add ~20 lines)
- Reuse existing hooks, modals, and UI components
