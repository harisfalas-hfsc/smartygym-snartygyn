// CORRECT PRICES from actual Stripe products
// These are the REAL prices - not invented numbers

export const SUBSCRIPTION_PRICES = {
  gold: 9.99,        // €9.99/month
  platinum: 89.89,   // €89.89/year (NOT monthly!)
} as const;

export const SUBSCRIPTION_BILLING_PERIODS = {
  gold: 'monthly',
  platinum: 'yearly',
} as const;

export const CORPORATE_PRICES = {
  dynamic: 399,      // €399/year
  power: 499,        // €499/year
  elite: 599,        // €599/year
  enterprise: 699,   // €699/year
} as const;

// Stripe Product IDs for YOUR products only
// Used to filter Stripe revenue to only YOUR website's sales
export const OUR_STRIPE_PRODUCT_IDS = [
  // Subscription products
  'prod_gold',           // Gold subscription (update with real ID)
  'prod_platinum',       // Platinum subscription (update with real ID)
  // Corporate products
  'prod_TZATAcAlqgc1P7', // Smarty Dynamic
  'prod_TZATDsKcDvMtHc', // Smarty Power
  'prod_TZATGTAsKalmCn', // Smarty Elite
  'prod_TZATUtaS2jhgtK', // Smarty Enterprise
  // Standalone Training Programs
  'prod_TiX1jpVVZtLG9C', // Run Your First 5K
  'prod_TiX1ILxJNwxNyv', // 90-Day Shred Challenge
  'prod_TiX1Bj3U8PC1Po', // 90-Day Mass Protocol
] as const;
