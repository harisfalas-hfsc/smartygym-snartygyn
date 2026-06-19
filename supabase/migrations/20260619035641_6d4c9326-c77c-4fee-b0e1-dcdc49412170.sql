-- Add legacy_premium + premium values to plan_type enum (safety net for historical Stripe events).
-- IF NOT EXISTS prevents this from failing if rerun.
ALTER TYPE public.plan_type ADD VALUE IF NOT EXISTS 'legacy_premium';
ALTER TYPE public.plan_type ADD VALUE IF NOT EXISTS 'premium';

-- Note: cannot ALTER the helper functions in the same migration as enum-additions
-- because new enum values are not visible to functions until commit. The helper
-- updates happen in a follow-up migration.