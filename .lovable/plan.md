
# Reliability Improvements: WOD Generation and Future-Proofing

## What Happened Last Night

The workout generation system has TWO scheduled jobs:

1. **Primary (22:30 UTC / 00:30 Cyprus)**: Calls the orchestrator, which tries up to 3 times with 30-second gaps. Last night, all 3 attempts failed -- likely due to a temporary AI provider outage.
2. **Backup (01:00 UTC / 03:00 Cyprus)**: Calls `generate-workout-of-day` directly. This SUCCEEDED and created both WODs.

So the workouts WERE generated. The failure email you received was from the primary run. The backup saved the day, but you were correctly alarmed by the email.

This is NOT related to the naming/formatting bugs we fixed earlier -- those were code logic issues. This was an infrastructure/AI provider availability issue.

## Root Causes

1. **Tight retry window**: The orchestrator retries 3 times with only 30-second gaps. If the AI provider is down for even 2 minutes, all 3 attempts fail.
2. **No AI provider failover**: The system uses a single AI model. If that model has issues, there is no fallback.
3. **Alarm fatigue**: The failure email fires even though the backup job later succeeds, causing unnecessary worry.

## Proposed Fixes

### Fix 1: Increase Retry Delay (Quick Win)
Change the orchestrator retry delay from 30 seconds to 120 seconds. This gives 3 attempts spread over ~6 minutes instead of ~1.5 minutes, greatly increasing the chance of success during brief outages.

**File**: `supabase/functions/wod-generation-orchestrator/index.ts`
- Change `RETRY_DELAY_MS` from `30000` to `120000`

### Fix 2: Smarter Failure Email (Prevent False Alarms)
Before sending the failure email, check if the backup verification job is scheduled. If a backup exists within a few hours, delay the admin alert or add context saying "a backup attempt is scheduled at 03:00 Cyprus time."

Alternatively, modify the email to say: "Primary generation failed. Backup attempt scheduled at 03:00 Cyprus time. You will receive a second alert only if the backup also fails."

**File**: `supabase/functions/wod-generation-orchestrator/index.ts`
- Update `sendAdminAlert` to include backup job information

### Fix 3: Backup Job Should Also Send Status Email
When the `verify-wod-generation` backup succeeds after a prior failure, send a "Recovery: WODs Generated Successfully" email so you know the backup worked.

**File**: `supabase/functions/generate-workout-of-day/index.ts`
- After successful retry generation, check if a failed orchestrator run exists for the same date and send a recovery notification

### Fix 4: AI Provider Failover
Add a secondary AI model as fallback. If the primary model fails, automatically retry with a different model.

**File**: `supabase/functions/generate-workout-of-day/index.ts`
- Add a `FALLBACK_MODELS` array with alternative model names
- Wrap the AI call in a try/catch that falls back to the next model

### Fix 5: Comprehensive Post-Generation Validation (Already Partially Done)
The exercise matching improvements and name collision guards from earlier fixes are now deployed. These prevent the formatting and naming issues from recurring.

## Summary of Changes

| Change | Impact | File |
|--------|--------|------|
| Increase retry delay to 120s | Handles brief provider outages | `wod-generation-orchestrator/index.ts` |
| Add "backup scheduled" context to failure email | Reduces unnecessary alarm | `wod-generation-orchestrator/index.ts` |
| Send recovery email when backup succeeds | Gives you peace of mind | `generate-workout-of-day/index.ts` |
| AI model failover | Handles provider outages | `generate-workout-of-day/index.ts` |

## What This Means for Tomorrow

- The naming collision guard is deployed -- no more duplicate names
- The exercise matching improvements are deployed -- better "View" button coverage
- The Stripe sync is deployed -- names will match between your app and Stripe
- After these reliability fixes, even if one AI provider goes down, the system will try alternatives and retry over a longer window
- You will only get alarmed if BOTH the primary and backup runs fail
