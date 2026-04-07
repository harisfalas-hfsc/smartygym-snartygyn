

# Hide "BUY €X.XX" Badge for Premium Users and Users Who Already Purchased

## Problem
The green "BUY €X.XX" badge on workout and training program cards is visible to **all users**, including premium subscribers (who already have access to everything) and users who already purchased that specific item. It should only show for visitors, free subscribers who haven't purchased that item.

## Affected Files
Three pages render the buy badge:
1. **`src/pages/WODCategory.tsx`** — workout cards in category listings (line ~203)
2. **`src/pages/WorkoutDetail.tsx`** — workout cards in the detail/listing view (line ~682)
3. **`src/pages/TrainingProgramDetail.tsx`** — program cards in program listings (line ~629)

None of these currently import `useAccessControl`.

## Changes

### All 3 files: Import `useAccessControl` and conditionally hide the badge

In each file:
1. Import `useAccessControl` from `@/hooks/useAccessControl`
2. Destructure `{ userTier, hasPurchased }` from the hook
3. Wrap the buy badge condition with an additional check:

```
// Current:
{item.is_standalone_purchase && item.price && ( <BuyBadge /> )}

// New:
{item.is_standalone_purchase && item.price && 
 userTier !== "premium" && 
 !hasPurchased(item.id, "workout"|"program") && ( <BuyBadge /> )}
```

This ensures:
- **Premium users**: badge hidden (everything included in their plan)
- **Users who purchased this specific item**: badge hidden (already owns it)
- **Visitors / free subscribers without purchase**: badge visible (can use it)
- **Free subscribers who purchased item A but not B**: badge hidden on A, visible on B

No backend changes needed — `useAccessControl` already provides `userTier` and `hasPurchased()`.

