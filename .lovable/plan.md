
# Fix Goal Achievement Email Link

## Problem
The goal achievement email contains a "Set New Goals" button that links to `/calculator-history?tab=measurements`, which loads a blank/black page. The link should instead direct to the main dashboard (`/userdashboard`) where the Active Goals card is visible.

## Fix

### File: `supabase/functions/send-system-message/index.ts` (line 171)

Change the CTA link for goal achievement emails from:
```
https://smartygym.com/calculator-history?tab=measurements
```
to:
```
https://smartygym.lovable.app/userdashboard
```

This is a one-line change. The "Set New Goals" button in the email will take the user directly to the dashboard where the Goals Summary Card is displayed, and from there they can click through to update their goals.

Also updating the CTA button text to stay as "Set New Goals" since the goals card on the dashboard has its own "Set New Goal" link.
