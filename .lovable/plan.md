

# Remove Duplicate Info Bar Card

## What's Wrong

Below the "Created by Haris Falas" credit line, there's a `WorkoutInfoBar` card that shows category, focus, difficulty, and duration as colored badges. Directly below that, all the same information is repeated in a more detailed format (Serial, Focus, Difficulty with stars, Type, Duration, Equipment). The card is redundant.

## The Fix

### File: `src/components/WorkoutDisplay.tsx`

Remove the `WorkoutInfoBar` component usage (lines 181-194) which renders the duplicate badge card. Keep the detailed info section below it (Serial, Focus, Difficulty stars, Type, Duration, Equipment) untouched.

Also remove the `WorkoutInfoBar` import (line 9) since it will no longer be used.

### File: `src/components/WorkoutInfoBar.tsx`

Can be deleted entirely since nothing else imports it.

### No other files affected

The `WorkoutInfoBar` is only used in `WorkoutDisplay.tsx`. Individual workout and training program pages all render through `WorkoutDisplay`, so removing it there covers all workouts and programs (existing and future).

