
# Fix Workout Timer Input Behavior

## The Problem
There are two issues with the workout timer inputs:

1. **Cannot delete all digits**: When you try to clear the field (e.g., delete "20" to type "5"), the fallback logic immediately forces it back to the default value (20, 10, or 8). This makes editing frustrating.

2. **Timer display does not update**: After changing the work/rest/rounds values, the timer display still shows the old number until you press "Start". There is no need for a refresh button; it should update automatically.

## Where the Fix Applies
The same bug exists in **two separate files**:
- **Smarty Tools page** (`src/pages/WorkoutTimer.tsx`) - the full-page timer
- **Workout popup timer** (`src/components/WorkoutTimerPopup.tsx`) - the floating timer used inside workouts and training programs

Both files will be fixed with the same approach, so the fix applies everywhere across the website.

## The Solution

### 1. Allow empty input while typing
Instead of storing only numbers, use a string state for the input display so users can freely clear and retype values. The actual numeric value is applied when the user finishes editing (on blur) or when they press Start.

For each input (work, rest, rounds):
- Store input as a string while the user is typing
- Allow the field to be completely empty
- On blur (when the user taps/clicks away), convert to a number and apply a sensible minimum (e.g., 1 second for work/rest, 1 round minimum)
- If the field is left empty or zero, reset to a reasonable default

### 2. Auto-sync the timer display
When the timer is NOT running and the user changes the work time, automatically update the `timeLeft` display to match the new work time. This removes the need to press any refresh button.

A `useEffect` will watch `workTime` and update `timeLeft` whenever the timer is idle (not running and round is 0).

## Technical Details

**Both files** (`WorkoutTimer.tsx` and `WorkoutTimerPopup.tsx`) will get these changes:

- Add string states: `workTimeInput`, `restTimeInput`, `roundsInput` for display
- Input `value` binds to the string state (allows empty)
- `onChange` updates the string state freely
- `onBlur` parses the value, clamps to minimum, updates both the string and numeric state
- Add a `useEffect`: when `workTime` changes and timer is not running, set `timeLeft = workTime`
- Remove the `|| defaultValue` fallback from `onChange` handlers
