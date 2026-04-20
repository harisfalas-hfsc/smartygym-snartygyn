

## Plan: Change 7-day trial → 3-day trial everywhere

### Code changes (all visible copy + Stripe trial length)

**1. `supabase/functions/create-checkout/index.ts`** (line 110)
- Change `trial_period_days: 7` → `trial_period_days: 3`
- This affects only NEW checkout sessions. Existing active subscriptions (already on a 7-day trial or paying) are untouched. No risk to Stripe — same field, just a different number. Auto-renewal behavior is identical.

**2. `src/pages/SmartyPlans.tsx`**
- Line 342: "🎉 Try free for 7 days. Cancel anytime." → "🎉 Try free for 3 days. Cancel anytime."
- Line 524 (Gold card): "🎉 7 days free trial included" → "🎉 3 days free trial included"
- Line 542 (Gold button): "Start 7-Day Free Trial" → "Start 3-Day Free Trial"
- Line 563 (Platinum card): "🎉 7 days free trial included" → "🎉 3 days free trial included"
- Line 581 (Platinum button): "Start 7-Day Free Trial" → "Start 3-Day Free Trial"

**3. `src/pages/TakeATour.tsx`**
- Line 500: "🎉 Try free for 7 days — cancel anytime. No commitment." → "🎉 Try free for 3 days — cancel anytime. No commitment."
- Line 596: "Start 7-Day Free Trial" → "Start 3-Day Free Trial"

**4. `src/components/growth/FreeTrialPopup.tsx`** (the popup announcement)
- Line 112 badge: "7-Day Free Trial" → "3-Day Free Trial"
- Line 117 heading: "Try Premium Free for 7 Days" → "Try Premium Free for 3 Days"
- Line 121 body: "No charge for 7 days — cancel anytime." → "No charge for 3 days — cancel anytime."

### Intentionally NOT changed
- `src/utils/socialMediaContent.ts` — historical/launch copy in admin Social Media tool, not user-facing on site. Leaving avoids rewriting past campaign archives. (Can change if you want — say the word.)
- All other "7 days" matches are unrelated (analytics filters, check-in windows, periodization, backups, app review timelines, etc.).
- FAQ / JoinPremium — already do not mention "7 days" specifically.
- `send-renewal-reminders` — already uses 3 days (renewal reminder timing), unrelated to trial length.
- DB message templates — none mention the trial length.

### Stripe safety
Trial length lives only in `subscription_data.trial_period_days` at checkout-session creation. Changing 7 → 3 is a one-character edit with zero side effects:
- Existing subscribers: unaffected (their trial/billing cycle was set when their session was created).
- New subscribers: get a 3-day trial, then auto-charged exactly as before via the same hardened pipeline (forced card collection + hourly auto-finalize fallback).
- Stripe products and prices are unchanged.

### Verification after implementation
1. Visit `/plans` → confirm all copy says "3 days" / "3-Day".
2. Visit `/take-a-tour` → confirm the green banner and CTA button say "3 days" / "3-Day".
3. Trigger the Free Trial popup → confirm badge, heading, and body say "3 days".
4. Test a checkout in Stripe test mode → confirm Stripe shows a 3-day trial on the new subscription.

