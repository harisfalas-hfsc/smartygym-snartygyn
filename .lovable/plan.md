
# 7-Day Free Trial System + Remove Welcome Workout

## What This Does

1. Removes the "Complimentary Workout" popup and the welcome workout generation feature entirely
2. Adds a 7-day free trial for ALL new subscribers (both from popup and from pricing pages)
3. Creates a new visitor popup announcing the free trial (10s delay, repeats every 5 minutes)
4. Adds "Try free for 7 days" messaging on Smarty Plans, Take a Tour, and the "Transform Your Fitness" header
5. On the Take a Tour page, the popup appears immediately (no 10s delay)
6. Stripe Checkout will show users they get 7 days free before being charged

## How the Free Trial Works

Every first-time subscriber -- whether they click the popup or go directly to choose a plan -- gets a 7-day free trial through Stripe. They enter their credit card, Stripe gives them 7 days free, then auto-charges. They can cancel anytime from their dashboard. Your existing subscription check already recognizes "trialing" status as premium, so no backend subscription logic changes are needed.

## What Gets Deleted

- **Exit-Intent Popup** (`src/components/growth/ExitIntentPopup.tsx`) -- replaced with new Free Trial popup
- **Welcome Workout Edge Function** (`supabase/functions/generate-welcome-workout/index.ts`) -- completely removed
- **Welcome workout code in Auth.tsx** (lines 74-82) -- the code that generates a free workout on first login

## What Gets Created / Modified

### 1. New Free Trial Popup (replaces ExitIntentPopup)
**File**: `src/components/growth/FreeTrialPopup.tsx`

- Shows for non-logged-in visitors only
- Professional design with the existing background image, dark overlay style
- Message: "Try Premium Free for 7 Days"
- Trust signals: "Cancel anytime", "No commitment"
- CTA: "Start Your Free Trial" links to `/auth?mode=signup&trial=true`
- **Timing**: 10 seconds after page load, then every 5 minutes if dismissed
- **Special case**: On `/takeatour` page, appears immediately (0 delay)
- No long cooldown -- reappears on new tab/window opens after 10 seconds

### 2. Update App.tsx
- Replace `ExitIntentPopup` import with `FreeTrialPopup`

### 3. Update Auth.tsx
- Remove welcome workout generation code (lines 74-82)
- When `?trial=true` is in the URL, after first login redirect to Stripe Checkout with the Gold Monthly plan and 7-day trial
- Users who sign up without `?trial=true` follow the normal free signup flow (no credit card needed)

### 4. Update create-checkout Edge Function
**File**: `supabase/functions/create-checkout/index.ts`

- Accept an optional `trial` boolean parameter
- When `trial: true`, add `subscription_data.trial_period_days: 7` to the Stripe Checkout session
- This makes Stripe show "7 days free, then EUR 9.99/month" on the checkout page
- **Every first-time checkout gets the trial** -- the `trial` flag will be passed from both the popup flow AND the pricing page buttons

### 5. Update Smarty Plans Page
**File**: `src/pages/SmartyPlans.tsx`

- Add a "Try free for 7 days -- cancel anytime" badge below "Join thousands of members..." text
- Add "7 days free trial included" mention on both Gold and Platinum plan cards
- Pass `trial: true` to the `create-checkout` function call so every new subscriber gets the trial
- Update button text from "Start Monthly Plan" / "Start Yearly Plan" to "Start 7-Day Free Trial"

### 6. Update Take a Tour Page
**File**: `src/pages/TakeATour.tsx`

- Add "Try free for 7 days -- cancel anytime" text in the Subscription Plans section
- Add a trial CTA button alongside existing "View All Plans" button
- The Free Trial popup appears immediately on this page (0-second delay instead of 10)

### 7. Update "Transform Your Fitness Journey" Header (Smarty Plans)
**File**: `src/pages/SmartyPlans.tsx`

- Update the subtitle below "Join thousands of members..." to include: "Try free for 7 days. Cancel anytime."

### 8. Delete Welcome Workout Function
- Delete `supabase/functions/generate-welcome-workout/index.ts`
- Remove from `supabase/config.toml` if present

## Auto-Renewal Confirmation
Your existing Gold and Platinum subscriptions are already auto-renewing. Stripe subscriptions renew automatically by default -- this is built into `mode: "subscription"` in your checkout. No changes needed for auto-renewal.

## Abuse Prevention
- Credit card required at checkout (Stripe collects it)
- Stripe natively prevents the same customer from having duplicate subscriptions
- Your existing `create-checkout` function already blocks users with active subscriptions

## Technical Details

### Stripe trial_period_days
The key change in `create-checkout`:
```typescript
const session = await stripe.checkout.sessions.create({
  // ...existing config...
  subscription_data: {
    trial_period_days: 7,  // NEW: 7-day free trial
    metadata: { project: "SMARTYGYM", user_id: user.id }
  },
});
```
Stripe handles everything: shows "7 days free" on checkout page, delays first charge by 7 days, auto-charges after trial ends.

### Popup Timing Logic
```text
Page load --> wait 10 seconds (or 0 on /takeatour) --> show popup
User dismisses --> start 5-minute timer --> show again
User closes tab --> next visit: 10-second timer starts fresh
```
No localStorage cooldown (unlike the old 3-hour cooldown). The popup is persistent for visitors.

## Files Summary

| Action | File |
|--------|------|
| Delete | `supabase/functions/generate-welcome-workout/index.ts` |
| Create | `src/components/growth/FreeTrialPopup.tsx` |
| Modify | `src/App.tsx` (swap popup component) |
| Modify | `src/pages/Auth.tsx` (remove welcome workout, add trial redirect) |
| Modify | `supabase/functions/create-checkout/index.ts` (add trial_period_days) |
| Modify | `src/pages/SmartyPlans.tsx` (trial messaging + pass trial flag) |
| Modify | `src/pages/TakeATour.tsx` (trial messaging + immediate popup) |

## No Database Changes
Everything is handled by Stripe natively. No new tables or migrations needed.
