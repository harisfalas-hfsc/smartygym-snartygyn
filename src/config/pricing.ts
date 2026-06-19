// ============================================================
// SmartyGym pricing — single source of truth.
// We sell ONE membership today: Lifetime Premium (€89.99 one-time).
// Plus standalone purchases and Corporate plans.
//
// Gold (€9.99/mo) and Platinum (€89.89/yr) are LEGACY products that
// remain in Stripe for historical/refund handling but are NOT offered
// for new purchases. Never reference them in new code paths.
// ============================================================

export const SUBSCRIPTION_PRICES = {
  lifetime: 89.99, // €89.99 one-time lifetime membership
} as const;

// Stripe price IDs — single source of truth.
// Edge functions have their own copy (Deno cannot import from src/).
export const STRIPE_PRICE_IDS = {
  lifetime: 'price_1ThP4MIxQYg9inGKAUQEJ0tD', // Lifetime One-Time €89.99

  // Corporate plans
  corporate_dynamic:    'price_1Sc28CIxQYg9inGKfoqZgtXZ',
  corporate_power:      'price_1Sc28EIxQYg9inGKCDUA4ii8',
  corporate_elite:      'price_1Sc28GIxQYg9inGKS8NkWB11',
  corporate_enterprise: 'price_1Sc28HIxQYg9inGK3YzEE4YR',
} as const;

export type StripePlanKey = keyof typeof STRIPE_PRICE_IDS;

export const SUBSCRIPTION_BILLING_PERIODS = {
  lifetime: 'one-time',
} as const;

// Legacy Stripe price IDs — kept for webhook/refund recognition only.
// Do NOT use these to initiate new checkouts.
export const LEGACY_STRIPE_PRICE_IDS = {
  gold:     'price_1SJ9q1IxQYg9inGKZzxxqPbD',
  platinum: 'price_1SJ9qGIxQYg9inGKFbgqVRjj',
} as const;

export const CORPORATE_PRICES = {
  dynamic: 399,      // €399/year
  power: 499,        // €499/year
  elite: 599,        // €599/year
  enterprise: 699,   // €699/year
} as const;

// Stripe Product IDs for SmartyGym products only
// Used to filter Stripe revenue to only SmartyGym sales
export const OUR_STRIPE_PRODUCT_IDS = [
  // Legacy subscription products (no longer offered; kept for revenue/refund analytics)
  'prod_TFfAcybp438BH6', // [LEGACY] Smarty Gym Gold Plan
  'prod_TFfAPp1tq7RdUk', // [LEGACY] Smarty Gym Platinum Plan
  // Lifetime membership (one-time)
  'prod_UgmdX60UPJxWeS', // Smarty Gym Lifetime Membership
  // Corporate products
  'prod_TZATAcAlqgc1P7', // Smarty Dynamic
  'prod_TZATDsKcDvMtHc', // Smarty Power
  'prod_TZATGTAsKalmCn', // Smarty Elite
  'prod_TZATUtaS2jhgtK', // Smarty Enterprise
  // Standalone Training Programs
  'prod_TiX1jpVVZtLG9C', // Run Your First 5K
  'prod_TiX1ILxJNwxNyv', // 90-Day Shred Challenge
  'prod_TiX1Bj3U8PC1Po', // 90-Day Mass Protocol
  // Micro-Workouts (5-min premium workouts)
  'prod_TjopnTQosm7AUQ', // Desk Breaker
  'prod_TjopExBHYK3UhQ', // Stairway Sprint
  'prod_Tjopvzgs8icm3z', // Burpee Blitz
  'prod_TjopTldP5F5Xwf', // Squat Storm
  'prod_TjopWbmTI878ef', // Climber Chaos
  'prod_TjopAbpxfOd6sE', // Jump Starter
  'prod_Tjopn2AbGW0NfY', // Push-Up Power
  'prod_TjoppqilBxhY6O', // Sofa Surge
  'prod_Tjop4dLWFq3KND', // Core Crusher
  'prod_TjopcVZXEkguxn', // Wall Warrior
] as const;
