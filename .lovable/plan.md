

## What's actually happening

Your data is **100% safe and correct** in the database. Manos Christofi's paid Gold subscription, Maria's Platinum, and Applab's Gold are all there:

| Name | Plan | Status | Stripe Paid |
|---|---|---|---|
| Manos Christofi | Gold | active | ✅ Yes (real Stripe payment) |
| Maria | Platinum | active | No (manual/comp) |
| Applab Projects | Gold | active | No (manual/comp) |

**Total active paid + manual subs: 3. Plus 12 free users. Plus standalone purchases.**

## The bug

The Admin Analytics dashboard reads `user_subscriptions` directly from the browser. The Row-Level Security policy on that table is:

```
USING (auth.uid() = user_id)
```

Translation: **"users can only see their own subscription row."** There is no exception for admins. So when you (as admin) load the analytics page, the query returns only your own row (or zero if you have none) — not all 16 subscriptions. That's why you see 0 active subscribers, 0 gold, €0 revenue.

Same problem applies to `user_purchases` (standalone revenue) — needs the same check.

## The fix

Add an admin-bypass RLS policy on both tables, so admins can read everything but normal users still only see their own data:

```sql
CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all purchases"
ON public.user_purchases FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
```

Non-admins keep their existing privacy. Admins immediately see real numbers.

## Steps after approval

1. Migration: add the 2 admin-SELECT policies (subscriptions + purchases). Audit other admin-read tables (profiles, user_purchases, social_media_analytics) for the same gap and patch any found.
2. Reload admin analytics → numbers should now show:
   - Active Subscribers: 3 (paid+manual gold/platinum)
   - Gold: 2 (1 paid Manos, 1 manual Applab)
   - Platinum: 1 (Maria, manual)
   - Paid Revenue: €9.99/mo (Manos) + standalone purchases sum
3. Cross-check Stripe MRR via the existing `get-stripe-revenue` edge function (which uses service role and already works correctly server-side) to confirm the live numbers match.
4. Report back with screenshots of the now-populated dashboard.

## Why this happened
When the analytics dashboard was built, it queries tables client-side instead of going through a `SECURITY DEFINER` admin function. The RLS was correctly locked down for user privacy, but the admin-view exception was never added. This is a 1-migration fix.

