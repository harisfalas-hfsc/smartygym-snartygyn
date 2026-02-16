

# Fix ALL Exercises: Zero Unmatched, View Buttons Everywhere

## What I Found

### Problem 1: Corrupted HTML
Previous regex replacements left `$3` text artifacts scattered throughout workout content (visible in Flow Restore, Glute Core Foundation, and likely many others). These corrupt strings break all subsequent pattern matching, causing real exercises to fail.

### Problem 2: Real Library Exercises Logged as "Unmatched"
At least 18 exercises in the "unmatched" log EXIST in your library and should have View buttons:
- dead bug (ID: 0276)
- sphinx (ID: 1362)
- air bike (ID: 0003)
- barbell bent over row (ID: 0027)
- cable pulldown (ID: 0198)
- decline crunch (ID: 0277)
- dumbbell seated curl (ID: 0391)
- dumbbell seated shoulder press (ID: 0405)
- cable straight arm pulldown (ID: 0238)
- inchworm (ID: 1471)
- iron cross stretch (ID: 1419)
- bench hip extension (ID: 0130)
- split squats (ID: 2368)
- standing calves (ID: 1397)
- balance board (ID: 0020)
- hanging pike (ID: 0473)
- suspended split squat (ID: 0809)
- upward facing dog (ID: 1366)
...and likely more

These are matching at 100% confidence in theory, but the corrupted HTML prevents the replacement from working.

### Problem 3: Section Restriction Blocking View Buttons
The current system only puts View buttons in Main Workout and Finisher sections. Your instruction is clear: EVERY exercise EVERYWHERE must have a View button. Exercises in Activation and Cool Down that exist in the library should also get View buttons.

## The Fix (4 Steps)

### Step 1: Clean ALL HTML Corruption

Run a database update to strip all `$3` artifacts from every workout's main_workout, warm_up, cool_down, activation, and finisher fields. This fixes the broken HTML that prevents matching.

### Step 2: Remove Section Restriction

Change `processContentSectionAware` so it processes ALL sections (Soft Tissue, Activation, Main Workout, Finisher, Cool Down) for exercise matching. Every section gets View buttons if the exercise exists in the library. No more "strip markup from non-main sections."

### Step 3: Re-Run Reprocessor on ALL 214 Workouts

Call `reprocess-wod-exercises` with `processAll=true` in batches. With clean HTML and no section restriction, every real exercise will match and get a View button.

### Step 4: Re-Run Reprocessor on ALL 28 Programs

Call `reprocess-program-exercises` on all programs. Same fix applies.

### Step 5: Verify Zero Real Unmatched

After reprocessing, check the mismatched log. Any remaining items should only be structural text (section headers like "Flow Sequence 1", instructions like "Repeat this sequence 2 times", or rep counts like "Reps: 6-8") -- NOT exercise names. If any real exercise name remains, it means the library needs that exercise added or the matching needs another pattern.

## What Changes

| Area | Change |
|------|--------|
| Database content | Strip `$3` artifacts from all workout fields |
| `_shared/exercise-matching.ts` | `processContentSectionAware` now processes ALL sections for View buttons |
| `reprocess-wod-exercises` | Process ALL fields (main_workout, warm_up, cool_down, activation, finisher) |
| All 214 workouts | Re-linked with clean HTML |
| All 28 programs | Re-linked |

## What Does NOT Change

- Workout structure, philosophy, formatting, styling
- Section order and emoji headers
- Periodization, coaching logic, RPE rules
- The exercise library itself
- The library-first generation architecture for future workouts
- Category-specific exercise rules
- Equipment/bodyweight filtering

## After This

- Every exercise in every workout and program that exists in the library will have a View button
- No exercise will exist anywhere that is not from the library (enforced by the library-first architecture for future generation)
- The mismatched log will contain only structural/instructional text, not exercise names

