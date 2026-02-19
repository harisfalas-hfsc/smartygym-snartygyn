

# Fix: Trial Not Showing on Stripe Checkout

## The Problem

The edge function logs confirm the issue. When you checked out just now, the log showed:

```
Request received - {"priceId":"price_1SJ9q1IxQYg9inGKZzxxqPbD"}
```

The `trial` parameter is missing entirely. This means the **deployed** version of `create-checkout` does not include the `trial_period_days` logic, even though the source code does. The function needs to be redeployed.

## The Fix

**Redeploy the `create-checkout` edge function.** No code changes needed -- the source code already has the correct trial logic:

```typescript
// Already in create-checkout/index.ts (line ~101)
subscription_data: {
  ...(trial ? { trial_period_days: 7 } : {}),
}
```

## Steps

1. Redeploy the `create-checkout` edge function to sync the deployed version with the source code
2. Verify by checking logs -- the "Request received" log should now show `{"priceId":"...","trial":true}`

## What Stripe Will Show After the Fix

Once `trial_period_days: 7` is properly passed to Stripe, the checkout page will automatically display:
- "7-day free trial" prominently at the top
- "EUR 0.00 due today"
- "Then EUR 9.99/month starting [date 7 days from now]"
- "Your trial ends on [specific date]"

No frontend changes needed. No Stripe dashboard changes needed. Just the redeployment.

## Files Changed

| Action | File |
|--------|------|
| Redeploy | `supabase/functions/create-checkout/index.ts` (no code changes) |

