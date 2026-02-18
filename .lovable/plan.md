
# Wire Up Celebration Animation and Notifications for Workout/Program Completion Goals

## Overview

When a user marks a workout or program as completed and that action causes them to reach their target goal (e.g., "Complete 20 workouts"), the system will:
1. Show the confetti celebration animation with a trophy dialog
2. Send a dashboard notification and email via the `send-system-message` edge function

Currently, celebrations only fire for body measurement goals (weight, body fat, muscle mass) inside `MeasurementDialog.tsx`. We need to add the same logic to `WorkoutInteractions.tsx` and `ProgramInteractions.tsx`.

## Changes

### 1. Expand GoalAchievementCelebration types

**File:** `src/components/dashboard/GoalAchievementCelebration.tsx`

- Expand the `AchievedGoal` type to include `"workouts_completed"` and `"programs_completed"`
- Add labels: "Workouts Completed Goal", "Programs Completed Goal"
- Add units: "workouts", "programs"
- Use `.toFixed(0)` instead of `.toFixed(1)` for integer-based goals (workouts/programs)

### 2. Add goal-check logic to WorkoutInteractions

**File:** `src/components/WorkoutInteractions.tsx`

Inside the `toggleCompleted` function, after the workout is successfully marked as completed:
- Fetch the user's active goal from `user_measurement_goals` (specifically `target_workouts_completed`)
- If a target exists, count all `workout_interactions` where `is_completed = true` for this user
- If the count equals or exceeds the target, show the celebration dialog and send a notification via `send-system-message`
- Add `GoalAchievementCelebration` component to the render output
- Add state for `showCelebration` and `achievedGoals`

### 3. Add goal-check logic to ProgramInteractions

**File:** `src/components/ProgramInteractions.tsx`

Inside the `markComplete` function, after the program is successfully marked as completed:
- Same pattern as workouts: fetch goal, count completions, trigger celebration if target met
- Add `GoalAchievementCelebration` component to the render output
- Add state for `showCelebration` and `achievedGoals`

### 4. Create a shared helper hook (optional but clean)

**File:** `src/hooks/useGoalAchievementCheck.ts` (new file)

A small reusable hook that:
- Takes `userId` and `goalType` ("workouts_completed" or "programs_completed")
- Fetches the target from `user_measurement_goals`
- Counts actual completions from the relevant table
- Returns a function `checkAndCelebrate()` that compares and returns achieved goals if target is met

This avoids duplicating the fetch/count/compare logic in both interaction components.

## Technical Details

### GoalAchievementCelebration.tsx changes
```
// Expand type
type: "weight" | "body_fat" | "muscle_mass" | "workouts_completed" | "programs_completed"

// Add to GOAL_LABELS
workouts_completed: "Workouts Completed Goal"
programs_completed: "Programs Completed Goal"

// Add to GOAL_UNITS
workouts_completed: " workouts"
programs_completed: " programs"

// Use conditional formatting for integer vs decimal display
```

### useGoalAchievementCheck.ts (new hook)
```typescript
// Fetches user goal target and current count
// Returns { checkGoalAchievement } function
// On match, returns AchievedGoal object for celebration
```

### WorkoutInteractions.tsx flow (inside toggleCompleted, after success)
```
1. Fetch user_measurement_goals.target_workouts_completed
2. If target exists, count workout_interactions where is_completed = true
3. If count >= target --> setAchievedGoals, setShowCelebration(true)
4. Call send-system-message with goal achievement details
```

### ProgramInteractions.tsx flow (inside markComplete, after success)
```
1. Fetch user_measurement_goals.target_programs_completed
2. If target exists, count program_interactions where is_completed = true
3. If count >= target --> setAchievedGoals, setShowCelebration(true)
4. Call send-system-message with goal achievement details
```

### Notification message format
Same pattern as existing body measurement goals:
- Subject: "Goal Achieved!"
- Content: "Congratulations! You've completed X workouts, reaching your target of Y! Keep up the amazing work!"

## What Won't Change
- The existing body measurement celebration in `MeasurementDialog.tsx` stays exactly as-is
- The `send-system-message` edge function needs no changes (it already supports custom content)
- No database migration needed
