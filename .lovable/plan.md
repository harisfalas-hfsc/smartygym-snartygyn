

# Suppress Notifications for Complimentary Welcome Workouts

## Problem
Every time a new user signs up, a complimentary workout is created and inserted into the `admin_workouts` table. The database trigger `queue_workout_notification` fires on every insert and queues a notification to ALL users. If 100 people sign up in one day, all existing users would receive 100 emails about workouts they didn't ask about.

## Fix
Update the `queue_workout_notification` database trigger function to also skip workouts where `type = 'welcome'`. Currently it only skips WOD workouts (`is_workout_of_day = true`). Adding one condition solves the problem at its root.

## Technical Details

### Database migration (single SQL change)
Update the `queue_workout_notification()` function to add a check:

```text
IF NEW.is_visible = true 
   AND (NEW.is_workout_of_day IS NULL OR NEW.is_workout_of_day = false)
   AND (NEW.type IS NULL OR NEW.type != 'welcome')   <-- NEW CONDITION
THEN ...
```

This means:
- Regular workouts created manually or via prompts: notifications sent as usual
- WOD workouts: skipped (existing behavior)
- Welcome/complimentary workouts (type = 'welcome'): skipped (new behavior)

No other files need to change. The welcome workout's own personal notification to the new user (sent directly in the edge function at line 361) is unaffected -- that one only goes to the specific new user, not to everyone.
