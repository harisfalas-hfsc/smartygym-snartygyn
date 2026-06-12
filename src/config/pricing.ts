// CORRECT PRICES from actual Stripe products
// These are the REAL prices - not invented numbers

export const SUBSCRIPTION_PRICES = {
  gold: 9.99,        // €9.99/month
  platinum: 89.89,   // €89.89/year (NOT monthly!)
  lifetime: 89.99,   // €89.99 one-time lifetime membership
} as const;

// ============================================================
// STRIPE PRICE IDs — single source of truth
// Update here when prices change in Stripe.
// Edge functions have their own copy (Deno cannot import from src/).
// ============================================================
export const STRIPE_PRICE_IDS = {
  gold:     'price_1SJ9q1IxQYg9inGKZzxxqPbD', // Gold Monthly €9.99
  platinum: 'price_1SJ9qGIxQYg9inGKFbgqVRjj', // Platinum Yearly €89.89
  lifetime: 'price_1ThP4MIxQYg9inGKAUQEJ0tD', // Lifetime One-Time €89.99

  // Corporate plans
  corporate_dynamic:    'price_1Sc28CIxQYg9inGKfoqZgtXZ',
  corporate_power:      'price_1Sc28EIxQYg9inGKCDUA4ii8',
  corporate_elite:      'price_1Sc28GIxQYg9inGKS8NkWB11',
  corporate_enterprise: 'price_1Sc28HIxQYg9inGK3YzEE4YR',
} as const;

export type StripePlanKey = keyof typeof STRIPE_PRICE_IDS;

export const SUBSCRIPTION_BILLING_PERIODS = {
  gold: 'monthly',
  platinum: 'yearly',
  lifetime: 'one-time',
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
  // Subscription products
  'prod_TFfAcybp438BH6', // Smarty Gym Gold Plan
  'prod_TFfAPp1tq7RdUk', // Smarty Gym Platinum Plan
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
