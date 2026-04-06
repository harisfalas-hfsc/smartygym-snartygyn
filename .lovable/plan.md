

# Fix: New Gold User Missing Welcome Message & Messages Panel

## Problem Analysis

Two issues reported for user "App Lab Projects" who was granted Gold access via admin:

### Issue 1: No Welcome Message
The welcome message trigger lives in `Auth.tsx` (line 58-71). It fires **only** when:
- The user goes through auth state change on the `/auth` page
- The profile's `welcome_sent` flag is `false`

If this user signed up earlier and already had `welcome_sent = true` on their profile, the welcome message won't re-trigger. Or if they signed up but something failed silently during the welcome flow, they'd have no messages at all.

**Fix**: The `manage-subscription` edge function (which grants Gold/Platinum) should also send a welcome message if the user hasn't received one yet. After granting the subscription, check `welcome_sent` on their profile — if false, invoke `send-system-message` with `messageType: 'welcome'`.

### Issue 2: Tabs Bar Not Visible
The inner tabs (All, System, Requests, Settings) in `UserMessagesPanel.tsx` are always rendered at line 775. However, with zero messages, the counts show `All (0)`, `System (0)`, `Requests (0)` — the tabs bar IS there but may appear disconnected from the empty state visually.

This is likely a perception issue because there are genuinely zero messages. Once the welcome message is delivered, the user will see content and the tabs will make sense.

No code change needed for the tabs — they already render unconditionally.

## Changes

### File: `supabase/functions/manage-subscription/index.ts`
After the successful grant upsert (around line 131), add a check:
1. Query the user's `profiles` table for `welcome_sent`
2. If `welcome_sent` is false/null, call `send-system-message` with `messageType: 'welcome'` and the `user_id`
3. This ensures any user granted a subscription who never received a welcome message gets one

```
// After successful grant, around line 131:
// Check if user needs a welcome message
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select('welcome_sent')
  .eq('user_id', user_id)
  .maybeSingle();

if (!profile?.welcome_sent) {
  // Insert welcome system message directly
  // (calling edge function from edge function is unreliable)
  // ... insert into user_system_messages using the welcome template
}
```

### Immediate Fix for "App Lab Projects"
Run a one-time script via `code--exec` to manually send the welcome message to this specific user by invoking the `send-system-message` edge function with their user ID.

## Summary
- **Root cause**: The welcome message only triggers on the Auth page during first login. Admin-granted users who already passed that gate (or had a glitch) never receive it.
- **Fix**: Make `manage-subscription` grant flow also deliver the welcome message when `welcome_sent` is false.
- **Immediate action**: Manually trigger the welcome message for the affected user.

