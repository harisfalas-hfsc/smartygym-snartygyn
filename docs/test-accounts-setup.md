# Test Accounts Setup Guide

## Overview

This guide helps you create a comprehensive set of test accounts to validate all access control scenarios in SmartyGym. These accounts are essential for QA testing and development.

## Required Test Accounts

### 1. Guest Account (No Registration)

- **Purpose:** Test public content access and authentication walls
- **Setup:** No account needed, just browse without logging in
- **Can Access:**
  - Marketing pages
  - Exercise library
  - Blog articles
  - About/FAQ pages
- **Cannot Access:**
  - Workouts
  - Training programs
  - User dashboard
  - Tools/calculators

### 2. Free Subscriber Account

**Email:** `free@test.smartygym.com`  
**Password:** `FreeTest123!`

**Setup:**
```sql
-- User created through normal signup flow
-- No additional database changes needed
-- This account has default "free" plan_type
```

**Can Access:**
- Everything guests can access
- Free workouts (where `is_premium = false`)
- Free training programs
- User dashboard
- Fitness tools and calculators

**Cannot Access:**
- Premium workouts (unless purchased individually)
- Premium training programs (unless purchased individually)

**Testing Scenarios:**
- ✅ View free content
- ✅ Purchase standalone premium content
- ❌ Access premium content without purchase
- ❌ Access admin panel

### 3. Premium Gold Member

**Email:** `premium-gold@test.smartygym.com`  
**Password:** `GoldTest123!`

**Setup:**
```sql
-- 1. Create user through signup first
-- 2. Get user_id from auth.users
-- 3. Run this SQL:

INSERT INTO public.user_subscriptions (
  user_id, 
  plan_type, 
  status,
  current_period_start,
  current_period_end
)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user_id
  'gold',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days'
);
```

**Can Access:**
- Everything free subscribers can access
- ALL premium workouts
- ALL premium training programs
- Advanced features

**Cannot Access:**
- Standalone purchase options (everything included)
- Admin panel

**Testing Scenarios:**
- ✅ Access all premium content without purchasing
- ✅ See "Included in Premium" on purchase buttons
- ❌ Complete standalone purchase (should be blocked)
- ❌ See purchase buttons (should be hidden)

### 4. Premium Platinum Member

**Email:** `premium-platinum@test.smartygym.com`  
**Password:** `PlatinumTest123!`

**Setup:**
```sql
INSERT INTO public.user_subscriptions (
  user_id, 
  plan_type, 
  status,
  current_period_start,
  current_period_end
)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user_id
  'platinum',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days'
);
```

**Features:** Same as Gold + additional platinum-only features

### 5. Admin Account

**Email:** `admin@test.smartygym.com`  
**Password:** `AdminTest123!`

**Setup:**
```sql
-- 1. Create user through signup
-- 2. Get user_id
-- 3. Assign admin role:

INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

**Can Access:**
- Everything (all content)
- Admin dashboard (`/admin`)
- Content management
- User management
- Analytics

### 6. Moderator Account (Optional)

**Email:** `moderator@test.smartygym.com`  
**Password:** `ModTest123!`

**Setup:**
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'moderator');
```

## Test Data Setup

### Create Test Workouts

```sql
-- Free workout (accessible to all authenticated users)
INSERT INTO admin_workouts (
  id, name, type, category, 
  is_premium, is_standalone_purchase, 
  difficulty_stars, duration, equipment,
  description, instructions
)
VALUES (
  'test-free-workout-1',
  'Test Free Workout',
  'HIIT',
  'Strength',
  false,  -- Not premium
  false,  -- Cannot be purchased
  3,
  '30 min',
  'Bodyweight Only',
  'A free test workout for all users',
  '<p>Test instructions</p>'
);

-- Premium workout (standalone purchase enabled)
INSERT INTO admin_workouts (
  id, name, type, category,
  is_premium, is_standalone_purchase, price,
  stripe_product_id, stripe_price_id,
  difficulty_stars, duration, equipment,
  description, instructions
)
VALUES (
  'test-premium-workout-1',
  'Test Premium Workout (Purchasable)',
  'Strength',
  'Strength',
  true,   -- Premium content
  true,   -- Can be purchased individually
  29.99,  -- Price
  'prod_test123',  -- Stripe product ID (use test mode)
  'price_test123', -- Stripe price ID (use test mode)
  4,
  '45 min',
  'Dumbbells, Barbell',
  'A premium workout available for purchase',
  '<p>Advanced workout instructions</p>'
);

-- Premium workout (members-only, no standalone purchase)
INSERT INTO admin_workouts (
  id, name, type, category,
  is_premium, is_standalone_purchase,
  difficulty_stars, duration, equipment,
  description, instructions
)
VALUES (
  'test-premium-workout-2',
  'Test Premium Members Only',
  'Cardio',
  'Cardio',
  true,   -- Premium content
  false,  -- NOT available for purchase
  5,
  '60 min',
  'Treadmill, Rower',
  'Exclusive to premium members only',
  '<p>Elite cardio workout</p>'
);
```

### Create Test Training Programs

```sql
-- Free program
INSERT INTO admin_training_programs (
  id, name, category,
  is_premium, is_standalone_purchase,
  weeks, days_per_week, difficulty_stars,
  equipment, description, overview
)
VALUES (
  'test-free-program-1',
  'Test Free 4-Week Program',
  'Beginner Strength',
  false,  -- Free
  false,
  4,
  3,
  2,
  'Bodyweight',
  'Beginner-friendly 4-week program',
  '<p>Week-by-week progression</p>'
);

-- Premium program (purchasable)
INSERT INTO admin_training_programs (
  id, name, category,
  is_premium, is_standalone_purchase, price,
  stripe_product_id, stripe_price_id,
  weeks, days_per_week, difficulty_stars,
  equipment, description, overview
)
VALUES (
  'test-premium-program-1',
  'Test Premium 8-Week Program',
  'Advanced Hypertrophy',
  true,   -- Premium
  true,   -- Purchasable
  79.99,
  'prod_program_test',
  'price_program_test',
  8,
  5,
  4,
  'Full Gym Equipment',
  'Advanced muscle building program',
  '<p>Structured 8-week progression</p>'
);
```

## Testing Matrix

| Account Type | Free Content | Premium Content | Standalone Purchase | Admin Panel |
|--------------|--------------|-----------------|---------------------|-------------|
| Guest | ❌ Auth required | ❌ Auth required | ❌ Auth required | ❌ No access |
| Free Subscriber | ✅ Full access | ❌ Blocked | ✅ Can purchase | ❌ No access |
| Premium Gold | ✅ Full access | ✅ Full access | ❌ Hidden (included) | ❌ No access |
| Premium Platinum | ✅ Full access | ✅ Full access | ❌ Hidden (included) | ❌ No access |
| Admin | ✅ Full access | ✅ Full access | ✅ Can purchase* | ✅ Full access |

*Note: Admins can test purchase flows but should not complete real purchases.

## QA Test Checklist

### Authentication Tests

- [ ] Guest redirected to /auth when accessing workout
- [ ] Free user can signup and access free content
- [ ] Premium user can access all premium content
- [ ] Admin can access /admin panel

### Content Access Tests

- [ ] Free user sees free workout content
- [ ] Free user blocked from premium workout
- [ ] Free user can purchase standalone premium workout
- [ ] Premium user sees ALL workout content
- [ ] Premium user does NOT see purchase buttons

### Purchase Flow Tests

- [ ] Free user can initiate purchase
- [ ] Free user redirected to Stripe checkout
- [ ] Premium user CANNOT initiate purchase (button hidden)
- [ ] Premium user sees "Included in Premium" message
- [ ] After purchase, content becomes accessible

### Admin Panel Tests

- [ ] Only admin users can access /admin
- [ ] Admin can create new workout
- [ ] Admin changes reflect immediately on frontend
- [ ] Admin can toggle is_premium flag
- [ ] Admin can enable/disable standalone purchase

## Automated Test Commands

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run specific test suite
npm run test -- access-control.test.ts

# Run with coverage
npm run test:coverage
```

## Cleanup After Testing

```sql
-- Remove test workouts
DELETE FROM admin_workouts WHERE id LIKE 'test-%';

-- Remove test programs
DELETE FROM admin_training_programs WHERE id LIKE 'test-%';

-- Remove test user subscriptions
DELETE FROM user_subscriptions 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@test.smartygym.com'
);

-- Do NOT delete test user accounts (keep for future testing)
```

## Stripe Test Mode

For purchase testing, use Stripe test cards:

**Success:** `4242 4242 4242 4242`  
**Decline:** `4000 0000 0000 0002`  
**Requires 3D Secure:** `4000 0025 0000 3155`

- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any 5-digit ZIP code

## Support

For issues with test account setup:

1. Check Supabase logs for SQL errors
2. Verify RLS policies are not blocking inserts
3. Ensure user exists in auth.users before creating subscriptions
4. Contact dev team with error details

## Next Steps

1. ✅ Create all test accounts
2. ✅ Run through QA checklist manually
3. ✅ Run automated test suite
4. ✅ Document any bugs found
5. ✅ Repeat testing after bug fixes
