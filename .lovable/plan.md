

## Issue

The text on Stripe's checkout page comes from the **Stripe Product `description` field** (set in Stripe, not in our code). Both products have wrong/typo'd descriptions:

**Gold Plan (`prod_TFfAcybp438BH6`)** — current:
> "Ome month is perfect if you want to test the Smarty Gym experience or need a quick push to get back on track. In just 60 days, you'll have access to a wide variety of workouts..."

Problems: typo "Ome", says "60 days" (nonsense for a monthly plan), generic.

**Platinum Plan (`prod_TFfAPp1tq7RdUk`)** — current:
> "One full year, one powerful decision. This transformation **GOLD Plan** is the ultimate commitment..."

Problem: calls itself "GOLD Plan" — wrong, this is the Platinum/yearly plan.

## Fix

Update both Stripe product descriptions via the Stripe API. No code changes — just metadata on the Stripe products. Zero impact on subscriptions, prices, billing, or auto-renewal.

**New Gold Plan description (monthly, €9.99/mo):**
> "Smarty Gym Gold — your monthly all-access pass. Unlimited workouts, training programs, the daily Workout of the Day, and all Smarty Tools. Perfect if you want flexibility month-to-month with no long commitment. Cancel anytime."

**New Platinum Plan description (yearly, €89.99/yr):**
> "Smarty Gym Platinum — your full-year all-access pass. 12 months of unlimited workouts, training programs, the daily Workout of the Day, and all Smarty Tools at the best value (save vs monthly). Built for lasting results and consistent progress year-round."

## Steps

1. Call `stripe--stripe_api_execute` → `PostProductsId` for `prod_TFfAcybp438BH6` with the new Gold description.
2. Call `stripe--stripe_api_execute` → `PostProductsId` for `prod_TFfAPp1tq7RdUk` with the new Platinum description.
3. Confirm both updates by re-fetching the products.
4. Tell the user to refresh / re-open the Stripe checkout page to see the corrected text.

## Safety

- Only the `description` field changes. Name, price, currency, billing interval, trial settings — all untouched.
- No code/files changed. No deploy needed.
- Existing and new subscribers are unaffected. Auto-renewal pipeline is unchanged.

