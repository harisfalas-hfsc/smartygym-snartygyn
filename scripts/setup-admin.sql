-- ============================================
-- SmartyGym Admin User Setup Script
-- ============================================
-- This script assigns admin role to a user account
-- Run this in your Supabase SQL Editor after creating a user account
--
-- SECURITY NOTE: Only assign admin role to trusted users
-- ============================================

-- STEP 1: Create a user account through the normal signup flow
-- Go to: https://yourdomain.com/auth
-- Enter email and password, complete signup

-- STEP 2: Get the user ID from auth.users table
-- Uncomment and run this query to find your user:
/*
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-admin-email@example.com';
*/

-- STEP 3: Insert admin role (replace USER_ID_HERE with actual UUID)
-- Copy the user ID from step 2 and paste it below:
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- STEP 4: Verify admin role was assigned successfully
-- This should return one row with your admin user details:
SELECT 
  ur.id as role_id,
  ur.user_id,
  ur.role,
  u.email,
  ur.created_at as role_assigned_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;

-- STEP 5: Test the has_role function
-- Replace USER_ID_HERE with your user ID:
SELECT public.has_role('USER_ID_HERE', 'admin') AS is_admin;
-- Should return TRUE if admin role is assigned correctly

-- ============================================
-- EXAMPLE: Assigning admin to multiple users
-- ============================================
/*
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('uuid-of-user-1', 'admin'),
  ('uuid-of-user-2', 'admin'),
  ('uuid-of-user-3', 'moderator')
ON CONFLICT (user_id, role) DO NOTHING;
*/

-- ============================================
-- REVOKING ADMIN ACCESS (if needed)
-- ============================================
/*
DELETE FROM public.user_roles
WHERE user_id = 'USER_ID_HERE' 
AND role = 'admin';
*/

-- ============================================
-- LIST ALL ADMINS (audit)
-- ============================================
/*
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at as role_assigned_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
*/
