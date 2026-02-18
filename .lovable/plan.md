

# Add Goal Achievements Toggle to Email Notification Settings

## Current State

I verified all three files:
- Dashboard Notification Settings: has Goal Achievements toggle -- DONE
- Mobile App Push Notification Settings: has Goal Achievements toggle -- DONE
- Email Notification Settings: MISSING Goal Achievements toggle -- needs fix

## The Fix

### File: `src/components/EmailSubscriptionManager.tsx`

1. Import `Trophy` icon from lucide-react (line 6)
2. Add `email_goal_achievement: boolean` to the `EmailPreferences` interface (after line 19)
3. Add `email_goal_achievement: true` to `DEFAULT_PREFERENCES` (after line 33)
4. Add a new entry to the `EMAIL_OPTIONS` array (after the scheduled program reminders entry, before the closing bracket):
   - Key: `email_goal_achievement`
   - Label: "Goal Achievements"
   - Description: "Get notified when you reach your fitness goals"
   - Timing: "Sent when you achieve a goal"
   - Icon: Trophy
5. Add `email_goal_achievement: prefs.email_goal_achievement !== false` to `fetchPreferences` (after line 147)

One file. One toggle. After this, all three cards will have the same 11 notification types.
