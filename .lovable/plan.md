
# Fix: Goal Achievement Sends Wrong WOD Email

## What Went Wrong (Simple Explanation)

Your goal achievement triggered a notification, but it was labeled as "announcement_update" -- the same label used by the Workout of the Day. The backend found the WOD template and sent that instead of a congratulations message. Your custom text was ignored because the backend didn't know how to use it.

## The Fix (3 Steps)

### Step 1: Create a dedicated "Goal Achievement" notification type

Register a new `GOAL_ACHIEVEMENT: 'goal_achievement'` in the central notification types registry. This gives goal achievements their own identity -- completely separate from WOD or any other notification.

**File:** `supabase/functions/_shared/notification-types.ts`

### Step 2: Update the backend function to accept custom subject and content

Right now the `send-system-message` function only knows how to replace `[Plan]`, `[Date]`, `[Amount]`, `[Content]` placeholders. It ignores `subject` and `content` in customData.

The fix: after loading the template, check if customData includes `subject` or `content`. If yes, use those instead of the template values. This way the congratulations text actually gets through.

**File:** `supabase/functions/send-system-message/index.ts`
- Add `subject?: string` and `content?: string` to the `customData` interface
- After template lookup, override with custom values if provided
- Update the email CTA link to `/calculator-history?tab=measurements` when messageType is `goal_achievement` (so the button says "Set New Goals" and goes to the right page)

### Step 3: Update the goal achievement code to use the new type

Change `messageType` from `'announcement_update'` to `'goal_achievement'` so it never touches the WOD template again.

**File:** `src/hooks/useGoalAchievementCheck.ts` (line 111)

### Step 4: Create a database template for goal achievements

Insert a new template row so the backend has a fallback even if custom text isn't provided:
- **message_type:** `goal_achievement`
- **template_name:** `Goal Achievement Celebration`
- **subject:** `Goal Achieved! You did it!`
- **content:** Congratulations message with a gold "Set New Goals" button linking to `/calculator-history?tab=measurements`
- **is_default:** true
- **is_active:** true

## Summary of Changes

| File | What Changes |
|------|-------------|
| `supabase/functions/_shared/notification-types.ts` | Add `GOAL_ACHIEVEMENT` constant |
| `supabase/functions/send-system-message/index.ts` | Support `subject`/`content` overrides in customData; use goals link for goal_achievement type |
| `src/hooks/useGoalAchievementCheck.ts` | Change messageType from `announcement_update` to `goal_achievement` |
| Database migration | Insert new `goal_achievement` template |

## What This Fixes

- Goal achievements will NEVER trigger the WOD email again
- Your custom congratulations text will actually be delivered
- The email and dashboard message will say "Congratulations!" with a "Set New Goals" button
- The morning WOD email remains completely untouched and unaffected
