

# Fix: Welcome Workout Not Being Generated for New Users

## Root Cause

The `generate-welcome-workout` function call in `Auth.tsx` (line 227) is **fire-and-forget** -- it's not `await`ed. Immediately after (line 244), `setShowAvatarSetup(true)` triggers a React state change and re-render. The browser likely cancels the outgoing HTTP request before it completes, so the function is never actually invoked on the server.

Evidence: analytics logs show literally **zero** calls to `generate-welcome-workout` -- ever. The function itself works fine when called directly.

## Fix

### 1. `await` the welcome workout call in `Auth.tsx`

Change the fire-and-forget pattern to an awaited call, just like the welcome message above it:

```typescript
// Before (fire-and-forget, gets cancelled by re-render):
supabase.functions.invoke('generate-welcome-workout', {
  body: { user_id: data.user.id }
}).then(...)

// After (properly awaited):
const { error: welcomeWorkoutError } = await supabase.functions.invoke('generate-welcome-workout', {
  body: { user_id: data.user.id }
});
if (welcomeWorkoutError) {
  console.error('Welcome workout generation failed:', welcomeWorkoutError);
}
```

### 2. Fix `send-system-message` to not return 500 on duplicates

Currently this function throws a 500 when the welcome message already exists (inserted by the DB trigger). It should handle the duplicate key error gracefully and return 200 instead, since this is expected behavior.

These are the only two changes needed. One file (Auth.tsx) and one edge function (send-system-message).

