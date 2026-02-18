

# Add Workouts & Programs Completed to Active Goals

## Why This Is Easy

The data already exists in the database:
- **Workouts completed**: counted from `workout_interactions` where `is_completed = true`
- **Programs completed**: counted from `program_interactions` where `is_completed = true`

No new database tables or columns are needed. We just need to:
1. Add target fields to the existing `user_measurement_goals` table
2. Add input fields to the goal-setting dialog
3. Fetch the actual counts and display them in the Active Goals card

## Changes

### 1. Database Migration
Add two new nullable columns to `user_measurement_goals`:
- `target_workouts_completed` (integer, nullable)
- `target_programs_completed` (integer, nullable)

### 2. Goal-Setting Dialog (`src/components/logbook/MeasurementGoalDialog.tsx`)
Add two new input fields:
- "Target Workouts Completed" (number input)
- "Target Programs Completed" (number input)

These appear alongside the existing weight/body fat/muscle mass fields.

### 3. Goals Summary Card (`src/components/dashboard/GoalsSummaryCard.tsx`)
- Fetch actual completed counts from `workout_interactions` and `program_interactions` (where `is_completed = true`)
- Add "Workouts" and "Programs" rows to the active goals list with a Dumbbell and Calendar icon
- Progress bar shows current completed count vs target (e.g., "12 / 20")
- Trophy icon appears when target is reached

### 4. Update Type Definitions
- Update the `MeasurementGoal` interface in `GoalsSummaryCard.tsx` to include the new fields
- Update the `MeasurementGoalDialog` props interface accordingly

## How It Works
- User sets a target like "Complete 20 workouts" and "Complete 3 programs" in the goal dialog
- The dashboard card counts how many workouts/programs they've marked as completed
- Progress bar fills up as they complete more
- Same target date applies to all goals

## Technical Details

### Database
```sql
ALTER TABLE user_measurement_goals 
  ADD COLUMN target_workouts_completed integer,
  ADD COLUMN target_programs_completed integer;
```

### GoalsSummaryCard.tsx
- Add two new queries counting `workout_interactions` and `program_interactions` where `is_completed = true`
- Add entries to the `activeGoals` array for workouts and programs
- Progress calculation: simple `(current / target) * 100`

### MeasurementGoalDialog.tsx
- Add state for `targetWorkoutsCompleted` and `targetProgramsCompleted`
- Add two number input fields
- Include in the save payload

