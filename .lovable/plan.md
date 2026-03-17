

## Analysis: Trial vs. Invoice Finalization Issue

**Short answer: No, removing the trial won't fix the root problem.** But there's a code-side fix we can apply.

### What Actually Happened

When Manos's 7-day trial ended, Stripe created a draft invoice for €9.99. That invoice was never auto-finalized, so payment was never collected. This is **not caused by the trial itself** — it's a Stripe account-level setting issue where invoices require manual finalization instead of being processed automatically.

If you removed the trial, the same problem could still occur on regular subscription renewals — any invoice Stripe generates could get stuck in "draft" if the account setting is wrong.

### The Stripe Setting You're Looking For

The setting is buried in: **Stripe Dashboard → Settings → search "invoices"** → look for **"Invoice default"** or **"Invoice creation"** → set to **"Automatically finalize draft invoices"**. It's not under Subscriptions — it's under the **Invoices** section of settings.

### Code-Side Fix (Recommended)

Instead of relying on the Stripe dashboard setting (which you're having trouble finding), we can **force automatic payment collection in our checkout code**. This overrides any account-level default and guarantees invoices are finalized and charged automatically.

**Changes:**

1. **`supabase/functions/create-checkout/index.ts`** — Add `payment_settings` to the `subscription_data` in the checkout session to explicitly set `collection_method` behavior and ensure invoices auto-finalize:

```typescript
subscription_data: {
  ...(trial ? { trial_period_days: 7 } : {}),
  metadata: {
    project: "SMARTYGYM",
    user_id: user.id,
  }
},
payment_method_collection: 'always',
```

This ensures Stripe always collects a payment method upfront and charges it automatically when the trial ends — regardless of account-level invoice settings.

### Recommendation

- **Keep the 7-day trial** — it's your primary conversion tool
- **Apply the code fix** to guarantee auto-charging after trial
- **Try to find the Stripe setting** when you have time (search "finalization" in Stripe settings search bar) as a belt-and-suspenders approach

