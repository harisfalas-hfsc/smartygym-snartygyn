

# Fire-Once Goal Celebrations + Post-Achievement "Set New Goals" Prompt

## Problem

Currently, when a user achieves any goal (weight, body fat, muscle mass, workouts, or programs):
- The celebration fires on **every** subsequent completion, not just the first time
- There is no prompt asking the user to set new goals
- The progress bar just stays at 100% with a trophy icon indefinitely
- The notification email/dashboard message has no link to set new goals

## Solution

### Part 1: Fire-Once Safeguard

Add a `goal_achieved_at` timestamp column to `user_measurement_goals`. When a goal is achieved for the first time, record the timestamp. On subsequent completions, skip the celebration and notification if the timestamp is already set.

**Database migration:**
- Add columns: `workouts_goal_achieved_at`, `programs_goal_achieved_at`, `weight_goal_achieved_at`, `body_fat_goal_achieved_at`, `muscle_mass_goal_achieved_at` (all nullable timestamps) to `user_measurement_goals`

**Logic change in all achievement checks:**
1. Before triggering celebration, check if the corresponding `*_goal_achieved_at` is already set
2. If not set: trigger celebration + notification + update the timestamp
3. If already set: skip entirely

### Part 2: Post-Achievement Prompt

When a goal is achieved, enhance the experience:

**A. Celebration Dialog Enhancement**
- Change the "Continue Your Journey" button to "Set New Goals"
- Add a clickable link/button that navigates to `/calculator-history?tab=measurements` (the goals section)
- Show a motivational message like "Ready for your next challenge? Set new goals to keep pushing forward!"

**B. Dashboard GoalsSummaryCard Enhancement**
- When a goal is at 100% (achieved), show an "Achieved" badge and a "Set New Goal" button next to it
- This gives the user a persistent visual cue on the dashboard

**C. Notification/Email Enhancement**
- Update the notification content to include a call-to-action: "Set your next goals and keep upgrading your life!"
- The dashboard CTA button in the email already links to `/userdashboard` -- update it to link to `/calculator-history?tab=measurements` so users land directly on the goals section

### Part 3: Goal Reset Flow

When a user edits goals (changes a target value after achieving it), the corresponding `*_goal_achieved_at` timestamp is cleared, allowing the celebration to fire again when the new target is reached.

## Files to Change

1. **Database migration** -- add 5 `*_goal_achieved_at` columns to `user_measurement_goals`

2. **`src/hooks/useGoalAchievementCheck.ts`** -- check `workouts_goal_achieved_at` / `programs_goal_achieved_at` before firing; update timestamp after firing

3. **`src/components/logbook/MeasurementDialog.tsx`** -- check `weight_goal_achieved_at` / `body_fat_goal_achieved_at` / `muscle_mass_goal_achieved_at` before firing; update timestamp after firing

4. **`src/components/dashboard/GoalAchievementCelebration.tsx`** -- change button text to "Set New Goals", navigate to goals page on click

5. **`src/components/dashboard/GoalsSummaryCard.tsx`** -- show "Achieved" badge + "Set New Goal" button for 100% goals

6. **`src/components/logbook/MeasurementGoalDialog.tsx`** -- clear the relevant `*_goal_achieved_at` timestamp when a user changes a target value

7. **`src/hooks/useGoalAchievementCheck.ts`** (notification content) -- update the message to include "Set your next goals!" with a link to the goals section

## Technical Details

### Database Migration
```sql
ALTER TABLE user_measurement_goals
  ADD COLUMN weight_goal_achieved_at timestamptz,
  ADD COLUMN body_fat_goal_achieved_at timestamptz,
  ADD COLUMN muscle_mass_goal_achieved_at timestamptz,
  ADD COLUMN workouts_goal_achieved_at timestamptz,
  ADD COLUMN programs_goal_achieved_at timestamptz;
```

### Fire-Once Check (pseudocode)
```text
1. Fetch goal row including *_goal_achieved_at
2. If target exists AND achieved_at is NULL:
   a. Check if current count >= target
   b. If yes: show celebration, send notification, SET achieved_at = now()
3. If achieved_at is already set: skip
```

### Celebration Dialog Button Change
```text
Current:  "Continue Your Journey" (just closes dialog)
New:      "Set New Goals" (navigates to /calculator-history?tab=measurements)
          + secondary "Close" button for dismissal
```

### Goal Reset on Edit
```text
When saving MeasurementGoalDialog:
- If target_weight changed -> SET weight_goal_achieved_at = NULL
- If target_body_fat changed -> SET body_fat_goal_achieved_at = NULL
- (same for all 5 goal types)
```

### Notification Content Update
```text
Current:  "Congratulations! You've completed 8 workouts, reaching your target of 2!"
New:      "Congratulations! You've completed 8 workouts, reaching your target of 2!
           Ready for your next challenge? Set new goals and keep upgrading your life!"
```

