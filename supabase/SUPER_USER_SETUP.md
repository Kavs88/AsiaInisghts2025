# Super User Access Setup Guide

This guide explains how to enable full super user access for the site owner in Supabase.

## Overview

Super users have full access to all data (market days, vendors, etc.) regardless of their admin role status. This is useful for site owners who need full access even if they don't have the 'admin' role in the `users` table.

## Files Created

1. **`setup_super_user_access.sql`** - Main setup script that creates the super_users table and updates RLS policies
2. **`verify_user_and_add_super_user.sql`** - Helper script to find your user ID and add yourself as super user
3. **`test_super_user_access.sql`** - Test script to verify super user access is working
4. **`lib/auth/super-user.ts`** - Frontend utilities to check super user status

## Setup Steps

### Step 1: Run the Main Setup Script

1. Open Supabase SQL Editor
2. Run `supabase/setup_super_user_access.sql`
   - This creates the `super_users` table
   - Creates `is_super_user()` and `is_current_user_super_user()` functions
   - Updates RLS policies for `market_days` and `vendors` tables

### Step 2: Find Your User ID

1. Run `supabase/verify_user_and_add_super_user.sql`
2. Look at the results from Step 1 to find your user ID (from `auth.users` table)
3. Copy your user ID

### Step 3: Add Yourself as Super User

1. In the same script (`verify_user_and_add_super_user.sql`), uncomment Step 4
2. Replace `'YOUR_USER_ID_HERE'` with your actual user ID
3. Run the INSERT statement

Alternatively, you can run this directly:

```sql
INSERT INTO public.super_users (uid, email, full_name, notes, created_by)
SELECT 
    u.id as uid,
    u.email,
    COALESCE(pu.full_name, u.email) as full_name,
    'Site owner - full access' as notes,
    u.id as created_by
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.id = 'YOUR_USER_ID_HERE'
ON CONFLICT (uid) DO UPDATE
SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW()
RETURNING *;
```

### Step 4: Verify Access

1. Run `supabase/test_super_user_access.sql`
2. Replace `'YOUR_USER_ID_HERE'` with your actual user ID
3. Uncomment and run the test queries
4. Verify you can:
   - View unpublished market days
   - View inactive vendors
   - Insert/update/delete market days
   - Insert/update/delete vendors

## How It Works

### Database Level (RLS Policies)

The RLS policies check for super users using the `is_super_user(auth.uid())` function:

- **Market Days**: Super users can view all market days (including unpublished), and can insert/update/delete
- **Vendors**: Super users can view all vendors (including inactive), and can insert/update/delete

These policies work alongside existing admin policies. PostgreSQL RLS combines multiple policies with OR, so super users have access even if they're not admins.

### Frontend Level

The frontend includes utilities in `lib/auth/super-user.ts`:

- `isSuperUser()` - Check if current user is super user (client-side)
- `isSuperUserServer()` - Check if current user is super user (server-side)
- `isAdminOrSuperUser()` - Check if user is admin OR super user (useful for UI checks)

## Important Notes

1. **Super User vs Admin**: Super users have full database access via RLS, but may not have admin role. If you want to access admin pages in the frontend, you may also need to:
   - Set your role to 'admin' in the `users` table, OR
   - Update admin page checks to also allow super users

2. **Security**: The `super_users` table has RLS enabled. Only super users and admins can view/manage it.

3. **Auditability**: All super users are tracked in the `super_users` table with creation timestamps and notes.

## Troubleshooting

### "Permission denied" errors

- Verify you're added to `super_users` table
- Check that `is_super_user(YOUR_UID)` returns `true`
- Verify RLS policies exist on `market_days` and `vendors` tables

### Can't see unpublished market days

- Check that the "Super users can view all market days" policy exists
- Verify `is_super_user(auth.uid())` returns `true` for your user

### Can't edit vendors

- Check that the "Super users can update all vendors" policy exists
- Verify you're authenticated (check `auth.uid()` is not null)

## Maintenance

### Adding More Super Users

```sql
INSERT INTO public.super_users (uid, email, full_name, notes, created_by)
SELECT 
    u.id,
    u.email,
    COALESCE(pu.full_name, u.email),
    'Additional super user',
    'YOUR_UID'  -- Your UID as the creator
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.id = 'NEW_USER_UID'
ON CONFLICT (uid) DO NOTHING;
```

### Removing Super User Access

```sql
DELETE FROM public.super_users WHERE uid = 'USER_UID_TO_REMOVE';
```

### List All Super Users

```sql
SELECT 
    su.uid,
    su.email,
    su.full_name,
    su.notes,
    su.created_at,
    pu.role as user_role
FROM public.super_users su
LEFT JOIN public.users pu ON su.uid = pu.id
ORDER BY su.created_at DESC;
```

## Acceptance Criteria Checklist

- ✅ Super user can fully edit market days and vendor information
- ✅ Other vendors still have their normal restricted access
- ✅ RLS policies remain secure and auditable
- ✅ Super users are tracked in `super_users` table
- ✅ Policies work alongside existing admin policies


