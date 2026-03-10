

## Improve User Management Filters and Status Clarity

### Problem
The current status labels ("Active", "Canceled", etc.) are confusing. There's no way to distinguish trial users from paying subscribers, no sorting options, and the filter categories mix unrelated concepts (roles, purchase history, subscription status).

### What Changes

**1. Clearer Status Labels**
Replace the vague statuses with meaningful labels:
- **"Trial"** — user is on 7-day free trial (Stripe status = `trialing`)
- **"Paying"** — user is actively paying (Stripe status = `active`, past trial)
- **"Expired"** — subscription ended or was canceled
- **"Revoked"** — admin manually revoked access
- **"Free"** — never subscribed
- **"Purchase Only"** — bought individual items, no plan

This requires the `get-users-with-emails` edge function to also return the raw Stripe subscription status (`trialing` vs `active`), which it currently doesn't distinguish.

**2. Add Sort Options**
Add a "Sort by" dropdown with:
- Newest registered (default) — by account creation date
- Oldest registered
- Newest subscriber — by subscription start date
- Oldest subscriber
- Plan (Platinum → Gold → Free)

**3. Reorganize Filters**
Keep existing filters but make the status filter clearer:
- **Plan filter**: All / Free / Gold / Platinum / Corporate
- **Status filter**: All / Trial / Paying / Expired / Free / Purchase Only
- **Role filter** (new, separate): All / Admins / Corporate Admins / Corporate Members
- **Source filter**: All / Stripe / Admin Granted / Corporate
- **Sort by** (new): Registration date / Subscription date / Plan tier

**4. Update Stats Bar**
Replace "Active Subscribers" with split counts:
- Total Users | Trial | Paying | Gold | Platinum | Purchases | Admins

### Technical Changes

1. **`supabase/functions/get-users-with-emails/index.ts`** — Include the raw Stripe `status` field (trialing vs active) in the response, and also fetch `current_period_start` from Stripe during sync to help determine trial vs paid.

2. **`src/components/admin/UsersManager.tsx`** — 
   - Update `getUserStatus()` to distinguish trial vs paying using subscription dates and status
   - Add sort state and sort logic
   - Reorganize filter dropdowns
   - Update stats cards

3. **`src/hooks/useAdminUserData.ts`** — Add `stripe_status` field to `AdminUserData` interface.

### No database changes needed
All data already exists — we just need to surface the `trialing` vs `active` distinction that Stripe provides.

