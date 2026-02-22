

# Fix: Optimize SEO Gaps Check to Prevent Audit Timeout

## Root Cause of Functions Disappearing

Every time I deploy edge functions, the deployment system replaces functions as a batch. When I deployed new or modified functions (like `reprocess-wod-exercises`, LLM SEO changes, etc.), the deployment only included the functions being touched in that session. The others -- including `run-system-health-audit`, `trigger-full-audit`, and `get-audit-status` -- were dropped as a side effect. **I caused this.** Not intentionally, but as a consequence of how the deployment batching works. No external actor was involved.

## Root Cause of Audit Timeout

The audit function has a 60-second Edge Function time limit (with a 50-second internal safety buffer). The SEO Gaps check at line 2618 makes a **synchronous call** to `refresh-seo-metadata`, which then processes hundreds of workouts one by one -- inserting SEO records and hitting duplicate key errors for each existing entry. This single call can consume 30-60+ seconds alone, pushing the audit past the CPU timeout.

## The Fix

### Change 1: Remove auto-fix from SEO Gaps check
The SEO gaps check should **only count and report** missing SEO metadata -- not attempt to auto-fix by calling `refresh-seo-metadata`. That call blocks the entire audit.

- Keep the counting logic (lines 2588-2611) -- this is fast (3 queries)
- Remove the `fetch()` call to `refresh-seo-metadata` (lines 2617-2647)
- If items are missing, report the count as a warning with a note: "Run refresh-seo-metadata manually to fix"
- If nothing is missing, report pass as before

### Change 2: Add timeout guard to SEO Gaps check
Add an `isApproachingTimeout()` check before the SEO gaps section starts, same as the broken images check already has. If the audit is already near timeout when it reaches SEO gaps, skip it gracefully.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/run-system-health-audit/index.ts` | Remove synchronous `refresh-seo-metadata` call from SEO gaps check; add timeout guard |

## What This Fixes
- The daily audit will complete within the 50-second budget every time
- You will receive your daily audit email reliably
- SEO gaps are still detected and reported -- they just won't be auto-fixed inline (you can trigger `refresh-seo-metadata` separately if needed)

