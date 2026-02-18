

# Add Goal Achievement Toggle to All 3 Notification Settings + Fix Admin Panel

## What's Missing

The goal achievement notification exists but has no toggle in any of the three settings sections. Users can't turn it on or off. All three settings must always have the same list of notification types.

Additionally, the admin Mobile Push Targeting panel is missing the scheduled workout/program reminder entries that already exist in the user-facing toggles.

## Changes

### 1. Dashboard Notification Settings
**File:** `src/components/DashboardNotificationSubscriptionManager.tsx`

- Add `dashboard_goal_achievement: boolean` to the interface and defaults (default: `true`)
- Add a new entry to `NOTIFICATION_OPTIONS`:
  - Key: `dashboard_goal_achievement`
  - Label: "Goal Achievements"
  - Description: "Get notified when you reach your fitness goals"
  - Icon: Trophy (import from lucide-react)
- Add the preference read/write for `dashboard_goal_achievement` in `fetchPreferences`

### 2. Mobile Push Notification Settings
**File:** `src/components/MobilePushNotificationManager.tsx`

- Add `mobile_push_goal_achievement: boolean` to the interface and defaults (default: `true`)
- Add a new entry to `NOTIFICATION_OPTIONS`:
  - Key: `mobile_push_goal_achievement`
  - Label: "Goal Achievements"
  - Description: "Get notified when you reach your fitness goals"
  - Icon: Trophy
- Add it to the `fetchPreferences` parsing
- Add it to the `toggleAllPreferences` master toggle logic (so turning all off/on includes goal achievements)

### 3. Admin Mobile Push Targeting Panel
**File:** `src/components/admin/MobilePushTargetingPanel.tsx`

- Add `mobile_push_goal_achievement`, `mobile_push_scheduled_workout_reminders`, and `mobile_push_scheduled_program_reminders` to the `PushStats` interface
- Add matching entries to `PREFERENCE_OPTIONS`:
  - Goal Achievements (Trophy icon)
  - Scheduled Workout Reminders (CalendarClock icon)
  - Scheduled Program Reminders (CalendarClock icon)
- Add them to the `fetchStats` count logic

### 4. Backend: Respect the preference
**File:** `supabase/functions/send-system-message/index.ts`

- When `messageType` is `goal_achievement`, check the user's `notification_preferences.dashboard_goal_achievement`
- If `false`, skip the dashboard message insert
- The email preference check already exists -- just ensure it also respects the specific type

### 5. Frontend: Check preference before calling backend
**File:** `src/hooks/useGoalAchievementCheck.ts`

- Before calling `send-system-message`, fetch the user's profile and check `notification_preferences.dashboard_goal_achievement`
- If `false`, skip the notification entirely (saves a backend call)

## Result

All three notification settings (Dashboard, Mobile Push, Email) will have the same complete list of toggleable notification types, including Goal Achievements. The admin panel will also show targeting stats for all notification types consistently.

