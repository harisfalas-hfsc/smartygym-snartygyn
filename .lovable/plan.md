

# Deploy and Test the 7-Day Free Trial

## What Needs to Happen

The code changes are already in place, but the `create-checkout` edge function needs to be redeployed so Stripe actually receives the `trial_period_days: 7` parameter and displays the trial information on the checkout page.

## Steps

### 1. Redeploy the `create-checkout` edge function
The updated code already includes the trial logic -- it just needs to be deployed to production so the live Stripe checkout reflects the 7-day trial.

### 2. Test the full flow end-to-end
- Navigate to Smarty Plans as a free user
- Click "Start 7-Day Free Trial" on the Gold plan
- Verify the Stripe checkout page shows "7 days free, then EUR 9.99/month"
- Confirm the trial messaging is visible on Smarty Plans, Take a Tour, and the popup

### 3. Verify returning member behavior
- Test with an existing customer (like hfsc.nicosia@gmail.com) to confirm Stripe does not grant a second trial to returning members

## No Code Changes Needed
All the code is already correct. This is purely a deployment step.

