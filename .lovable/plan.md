

## Immediate Fix: Done

Both WODs for April 11, 2026 are now live:
- **Circuit Cascade** (EQUIPMENT) - generated at 22:30 UTC
- **Apex Protocol** (BODYWEIGHT) - just generated via retryMissing

## Root Cause

The BODYWEIGHT generation failed during the primary orchestrator run at 22:30 UTC. The orchestrator retried once (MAX_ATTEMPTS = 2, 30s delay), but the retry also failed. The backup at 01:00 UTC and watchdog at 01:05 UTC both also failed -- all hitting the same transient AI generation error.

The problem: **only 2 retries with 30s gaps, and the backup/watchdog systems re-call the same function that already failed, with no independent retry logic per variant.**

## Reliability Improvements

### 1. Increase orchestrator retry count and delay
**File:** `supabase/functions/wod-generation-orchestrator/index.ts`
- Change `MAX_ATTEMPTS` from 2 to **3**
- Change `RETRY_DELAY_MS` from 30000 to **45000** (45s) -- gives the AI provider more recovery time between attempts
- On attempt 2+, pass `retryMissing: true` (already done)

### 2. Add per-variant retry inside the generator
**File:** `supabase/functions/generate-workout-of-day/index.ts`
- Inside the `for (const equipment of equipmentTypes)` loop (line 769), wrap the AI call in a retry loop of **2 attempts** with a 15-second delay
- Currently if the AI call fails once per variant, it's immediately added to `failedEquipmentTypes` and skipped
- This means a single transient AI error kills that variant for the entire run

### 3. Make the backup function retry each missing variant independently
**File:** `supabase/functions/backup-wod-generation/index.ts`
- Currently calls `generate-workout-of-day` once with `retryMissing: true`
- Change to: if the first call fails, wait 30s and try **one more time**
- This gives a total of 3 orchestrator + 2 backup = 5 independent generation windows

### 4. Make the watchdog also retry once before alerting
**File:** `supabase/functions/watchdog-wod-check/index.ts`
- Currently triggers one recovery call and sends an alert
- Add: wait 60s after the first trigger, re-verify, and if still missing, trigger once more before sending the final alert

These changes create **7+ independent generation attempts** across a 2.5-hour window (22:30 - 01:05 UTC), making total failure extremely unlikely.

### Files to modify
1. `supabase/functions/wod-generation-orchestrator/index.ts` -- bump MAX_ATTEMPTS to 3, delay to 45s
2. `supabase/functions/generate-workout-of-day/index.ts` -- add per-variant AI call retry (2 attempts, 15s delay)
3. `supabase/functions/backup-wod-generation/index.ts` -- add second attempt if first fails
4. `supabase/functions/watchdog-wod-check/index.ts` -- add verify-retry-verify loop

No database changes needed.

