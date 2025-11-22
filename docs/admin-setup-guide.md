# Admin User Setup Guide

## Overview

This guide walks you through setting up an admin user account for SmartyGym. Admin users have full access to the admin dashboard (`/admin` route) where they can manage workouts, programs, users, and more.

## Prerequisites

- Access to Supabase SQL Editor for your project
- A valid email address for the admin account
- Basic understanding of SQL (copy-paste is fine!)

## Step-by-Step Setup

### Step 1: Create User Account

1. Navigate to your SmartyGym website: `https://yourdomain.com/auth`
2. Click **"Sign Up"**
3. Enter your admin email (e.g., `admin@smartygym.com`)
4. Create a strong password (minimum 8 characters)
5. Complete the signup process
6. Verify your email if email verification is enabled

### Step 2: Get User ID

1. Open **Supabase Dashboard** → **SQL Editor**
2. Create a new query and paste:

```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-admin-email@example.com';
```

3. Replace `your-admin-email@example.com` with your actual email
4. Click **Run**
5. Copy the `id` value (UUID format like `a1b2c3d4-e5f6-...`)

### Step 3: Assign Admin Role

1. In Supabase SQL Editor, create a new query
2. Paste the following (replace `USER_ID_HERE` with the UUID from Step 2):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

3. Click **Run**
4. You should see: `Success. No rows returned`

### Step 4: Verify Admin Access

1. Run this verification query:

```sql
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
```

2. You should see your admin user listed with `role = 'admin'`

### Step 5: Test Admin Access

1. **Logout** from SmartyGym (important to refresh session)
2. **Login** again with your admin credentials
3. Navigate to `/admin` in your browser
4. ✅ You should now see the **Admin Dashboard**

## Security Best Practices

### Password Requirements

- ✅ Use a **unique** password (not used elsewhere)
- ✅ Minimum **12 characters** recommended
- ✅ Include uppercase, lowercase, numbers, and symbols
- ✅ Consider using a password manager

### Access Control

- ⚠️ **Limit admin users** - Only assign admin role to trusted staff
- ⚠️ **Regular audits** - Review admin users quarterly
- ⚠️ **Immediate revocation** - Remove admin access when staff leaves
- ⚠️ **Activity logging** - Monitor admin actions

### Two-Factor Authentication (if available)

Enable 2FA for admin accounts through Supabase Auth settings.

## Troubleshooting

### Issue: "Access Denied" when visiting /admin

**Possible Causes:**
1. Admin role not assigned correctly
2. Session not refreshed after role assignment
3. Browser cache issues

**Solutions:**
```sql
-- 1. Verify role exists
SELECT * FROM public.user_roles 
WHERE user_id = 'YOUR_USER_ID';

-- 2. Check has_role function
SELECT public.has_role('YOUR_USER_ID', 'admin');
-- Should return TRUE

-- 3. Re-insert admin role (if missing)
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

Then:
- Clear browser cache
- Logout and login again
- Try incognito/private window

### Issue: Admin role not persisting

**Check RLS policies:**
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_roles';
-- rowsecurity should be 't' (true)

-- Check has_role function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'has_role';
```

### Issue: Multiple admin accounts needed

```sql
-- Assign admin role to multiple users at once
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('uuid-of-admin-1', 'admin'),
  ('uuid-of-admin-2', 'admin'),
  ('uuid-of-admin-3', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

## Revoking Admin Access

If you need to remove admin access from a user:

```sql
DELETE FROM public.user_roles
WHERE user_id = 'USER_ID_TO_REVOKE'
AND role = 'admin';
```

**Important:** User will need to logout and login again for change to take effect.

## List All Admins (Audit)

To see all current admin users:

```sql
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at as admin_since
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
```

## Database Schema Reference

### user_roles Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users(id) |
| role | app_role | Enum: 'admin', 'moderator', 'user' |
| created_at | TIMESTAMPTZ | When role was assigned |

### app_role Enum

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
```

### has_role Function

```sql
-- Security definer function (bypasses RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

## Support

If you encounter issues not covered in this guide:

1. Check Supabase logs for errors
2. Review browser console for JavaScript errors
3. Verify database connection is working
4. Contact technical support with error details

## Next Steps

After setting up your admin account:

1. ✅ Review [Admin Dashboard Guide](./admin-dashboard-guide.md)
2. ✅ Setup test accounts for QA: [Test Accounts Setup](./test-accounts-setup.md)
3. ✅ Read [Access Control Rules](./access_rules.md)
4. ✅ Configure email templates for users
5. ✅ Start creating workouts and programs!
