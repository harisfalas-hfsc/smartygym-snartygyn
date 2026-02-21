

# Protect All Workouts From Deletion: Archive Instead of Delete

## Problem Found

There is a **critical destructive bug** in the admin panel. The "Regenerate" button in the WOD Manager permanently deletes the current Workout of the Day before generating a new one. This destroys the Stripe product, breaks purchase records for customers who already bought it, and removes it from leaderboards, logbooks, and community pages.

### Danger Zones Identified

| Location | Risk | Current Behavior |
|----------|------|------------------|
| WODManager.tsx "Regenerate" button (line 1200) | **CRITICAL** | Calls `.delete()` on current WODs, permanently destroying them |
| WorkoutsManager.tsx single delete (line 190) | Partial protection | Only protects WODs that have BOTH `is_standalone_purchase` AND `stripe_product_id` -- others get permanently deleted |
| WorkoutsManager.tsx bulk delete (line 413) | Partial protection | Same partial check as single delete |
| SettingsManager.tsx "Regenerate WOD" button (line 316) | Safe | Calls `generate-workout-of-day` which is idempotent (skips if WODs exist) |
| archive-old-wods function | Safe | Archives correctly, never deletes |
| select-wod-from-library function | Safe | Skips if WODs already exist for today |

## Fix Plan

### Fix 1: WODManager.tsx "Regenerate" Button (CRITICAL)

Replace the destructive `.delete()` call with a call to `archive-old-wods` (which safely clears flags without deleting).

**Before:**
```
await supabase
  .from("admin_workouts")
  .delete()
  .eq("is_workout_of_day", true)
  .eq("generated_for_date", today);
```

**After:**
```
await supabase.functions.invoke("archive-old-wods", {});
```

This reuses the existing archive function that already handles both AI-generated and library-selected WODs correctly.

### Fix 2: WorkoutsManager.tsx -- Never Delete Any Workout That Has a Stripe Product or Purchases

Expand the protection in the single-delete handler: instead of only protecting WODs with `is_standalone_purchase && stripe_product_id`, protect ANY workout that has a `stripe_product_id` OR has entries in `user_purchases`. These workouts will be archived (set `is_workout_of_day = false`, `generated_for_date = null`) instead of deleted.

### Fix 3: WorkoutsManager.tsx -- Same Protection for Bulk Delete

Apply the same expanded protection logic to the bulk delete handler: any workout with a `stripe_product_id` or existing purchases gets archived to the gallery, never permanently deleted.

### Fix 4: SettingsManager.tsx "Regenerate WOD" Button

Add an archive step before calling generation, so the old WODs are safely moved to the gallery first. This matches how `handleGenerateWOD` in WODManager already works with its `archiveFirst` parameter.

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/WODManager.tsx` | Replace `.delete()` with `archive-old-wods` call in the Regenerate button |
| `src/components/admin/WorkoutsManager.tsx` | Expand delete protection: archive any workout with Stripe product or purchases instead of deleting |
| `src/components/admin/SettingsManager.tsx` | Add archive-first step before regeneration |

## What This Guarantees

- No workout is ever permanently deleted if it has a Stripe product or customer purchases
- Switching between AI mode and Library mode always archives, never deletes
- Manual regeneration always archives first, never deletes
- All customer purchase records, leaderboard entries, and logbook data remain intact
- Stripe products are preserved for accounting and refund purposes

