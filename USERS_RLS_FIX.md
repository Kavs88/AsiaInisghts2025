# Users Table RLS Policies - Conflict Fix

## Problem Found

Your `users` table has **conflicting RLS policies**:

1. ❌ **"Users can view all users"** with `true` - This is a security issue! It allows everyone to see all users.
2. ❌ **Duplicate UPDATE policies** - "Users can update their own profile" and "Users can update own profile"
3. ⚠️ **Complex condition** in "Users can view their own profile" that might not work correctly

## Solution

Run this SQL script to clean up and fix all policies:

**File**: `supabase/fix_users_rls_conflicts.sql`

This will:
1. ✅ Drop all conflicting policies
2. ✅ Create clean, correct policies
3. ✅ Ensure admins can read their own record (for `isAdmin()` check)
4. ✅ Ensure regular users can only read their own record
5. ✅ Remove the security issue (everyone can view all users)

## What This Fixes

### Before (Broken):
- ❌ "Users can view all users" with `true` - **Security vulnerability!**
- ❌ Conflicting policies causing unpredictable behavior
- ❌ `isAdmin()` check might fail due to policy conflicts

### After (Fixed):
- ✅ Users can only view their own profile
- ✅ Admins can view all users (including themselves)
- ✅ `isAdmin()` check works correctly
- ✅ No security vulnerabilities

## Steps

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase/fix_users_rls_conflicts.sql`
3. Copy and paste the entire script
4. Click **Run**
5. **Refresh the admin dashboard** (hard refresh: Ctrl+Shift+R)

## Policy Structure After Fix

### SELECT Policies:
1. **"Users can view their own profile"** - `id = auth.uid()`
   - Allows any user to read their own record
   - Works for both admin and non-admin users

2. **"Admins can view all users"** - `EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')`
   - Allows admins to read any user record
   - Includes their own record (so `isAdmin()` works)

### UPDATE Policies:
1. **"Users can update their own profile"** - `id = auth.uid()`
2. **"Admins can update all users"** - Admin check

### INSERT Policies:
1. **"Users can insert their own profile"** - For signup

## Why This Works

The key insight is that **both policies can apply**:

- When an admin queries their own record:
  - Policy 1 ("Users can view their own profile") applies: ✅ `id = auth.uid()` = true
  - Policy 2 ("Admins can view all users") also applies: ✅ Admin check = true
  - **Result**: Admin can read their own record ✅

- When an admin queries another user's record:
  - Policy 1 doesn't apply: ❌ `id = auth.uid()` = false
  - Policy 2 applies: ✅ Admin check = true
  - **Result**: Admin can read other users ✅

- When a regular user queries their own record:
  - Policy 1 applies: ✅ `id = auth.uid()` = true
  - Policy 2 doesn't apply: ❌ Not an admin
  - **Result**: User can read their own record ✅

- When a regular user queries another user's record:
  - Policy 1 doesn't apply: ❌ `id = auth.uid()` = false
  - Policy 2 doesn't apply: ❌ Not an admin
  - **Result**: User cannot read other users ✅

## Verification

After running the SQL:

1. **Check the verification query** at the end of the script
2. **Go to `/admin/debug`** - Should show "Is Admin: ✅ Yes"
3. **Go to `/admin`** - Should show dashboard (not "Access Denied")
4. **Check browser console** - Should see `[isAdmin] Admin check result: { isAdmin: true }`

## Security Note

The old "Users can view all users" policy with `true` was a **major security vulnerability**. It allowed:
- ❌ Any logged-in user to see all other users' emails
- ❌ Any logged-in user to see all other users' roles
- ❌ Privacy violation

The new policies ensure:
- ✅ Users can only see their own data
- ✅ Admins can see all data (as intended)
- ✅ No privacy leaks





