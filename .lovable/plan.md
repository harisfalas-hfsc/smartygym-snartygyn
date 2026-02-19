

# Fix: Show Free Trial Popup to Free Subscribers (Never-Premium)

## The Problem

The Free Trial popup currently checks `if (session) return null` -- meaning it is completely invisible to any logged-in user. Free subscribers like `you@example.com` or Elsa, who registered but never subscribed to a premium plan, never see the trial announcement.

## Who Should See the Popup

| User Type | Should See Popup? | Why |
|-----------|-------------------|-----|
| Visitor (not logged in) | Yes | Current behavior, keep |
| Free subscriber (never been premium) | Yes | They need to discover the trial offer |
| Active premium user (Gold/Platinum/trial) | No | Already subscribed |
| Expired/cancelled premium user | No | Returning customer, already knows about premium |

## The Fix

Modify `FreeTrialPopup.tsx` to use the `useAccessControl` hook instead of raw session checks:

1. Import `useAccessControl` from the existing context
2. Check `userTier` and subscription history instead of just `session`
3. Query `user_subscriptions` to distinguish "never premium" from "expired premium"
4. For logged-in free subscribers, change the CTA button to navigate to `/smartyplans` (pricing page) instead of `/auth?mode=signup` since they're already logged in

## Technical Details

### File: `src/components/growth/FreeTrialPopup.tsx`

**Changes:**
- Replace the `session`-only check with `useAccessControl` to get `userTier` and `user`
- Add a query to check if the user has ever had a subscription record in `user_subscriptions` (any row with status `active`, `canceled`, `past_due`, etc. means they were previously premium)
- Show the popup when:
  - No session (visitor) -- existing behavior, OR
  - `userTier === "subscriber"` AND no record exists in `user_subscriptions`
- Adjust the CTA button: visitors go to `/auth?mode=signup&trial=true`, logged-in subscribers go to `/smartyplans`

### Logic Summary

```text
User lands on page
  |
  +--> Not logged in? --> Show popup (navigate to /auth?mode=signup&trial=true)
  |
  +--> Logged in?
        |
        +--> userTier === "premium"? --> Hide popup
        |
        +--> userTier === "subscriber"?
              |
              +--> Has ANY record in user_subscriptions? --> Hide popup (returning customer)
              |
              +--> No record in user_subscriptions? --> Show popup (navigate to /smartyplans)
```

### Key Decisions

- The `user_subscriptions` table is the source of truth for "ever been premium." If a row exists for a user, they were premium at some point (even if now expired/cancelled).
- The popup timing (10-second delay, 5-minute repeat) stays the same for both visitors and free subscribers.
- No database changes needed -- we just query the existing `user_subscriptions` table.

| Action | File |
|--------|------|
| Modify | `src/components/growth/FreeTrialPopup.tsx` |

