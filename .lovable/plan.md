
# Fix: Health Audit Function Not Deployed (404 NOT_FOUND)

## Root Cause

The `run-system-health-audit` edge function is **not deployed** in the production environment. Every time the cron job fires (daily at 14:00 UTC), it hits a **404 NOT_FOUND** error and silently fails. This is why you haven't received any audit emails for the past 8 days (since February 14).

The `net._http_response` table shows dozens of 404 responses with the message `"Requested function was not found"` -- this confirms the function was removed from the deployed environment, likely as a side effect of recent batch deployments.

The last successful audit was **February 14, 2026**. Zero audit records exist after that date.

Additionally, there are other functions also returning 404 repeatedly, suggesting multiple functions were lost during recent deployments.

## What Needs to Be Done

### Step 1: Redeploy the `run-system-health-audit` function
The code is intact in the codebase (3,172 lines, all imports valid). It just needs to be redeployed.

### Step 2: Redeploy `trigger-full-audit` and `get-audit-status`
These companion functions should also be redeployed to ensure the full audit system works end-to-end.

### Step 3: Identify and redeploy other missing functions
Check which other cron-called functions are returning 404 and redeploy them too. Based on the `net._http_response` data, there are multiple 404s every 10 minutes, meaning other scheduled functions are also missing.

### Step 4: Verify the audit runs and email is sent
After deployment, manually trigger the audit with `sendEmail: true` to confirm the full pipeline works: audit runs, results are saved to database, and the email report is delivered.

## No Code Changes Required
The function code is correct. The only issue is that it was removed from the deployed environment. This is a deployment-only fix.

## Files to Redeploy
- `supabase/functions/run-system-health-audit/index.ts` -- the main audit function
- `supabase/functions/trigger-full-audit/index.ts` -- the trigger wrapper
- `supabase/functions/get-audit-status/index.ts` -- the status checker
- Any other functions identified as returning 404 in production
