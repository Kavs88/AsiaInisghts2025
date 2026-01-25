# Admin Check Failing - Fix Guide

## Problem

The admin dashboard shows "Access Denied" even though:
- You were logged in
- You have admin role in the database
- It was working before

## Root Cause

The `isAdmin()` function queries the `users` table to check your role, but the RLS policy might be blocking it. The issue is that the "Users can view their own profile" policy might conflict with the admin check.

## Solution

Run this SQL script in Supabase SQL Editor:

**File**: `supabase/fix_users_rls_for_admin_check.sql`

This fixes the RLS policies so that:
1. **Admins can read their own record** (needed for `isAdmin()` check)
2. **Admins can read all users** (for admin dashboard)
3. **Regular users can only read their own record**

## Steps

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase/fix_users_rls_for_admin_check.sql`
3. Copy and paste the entire script
4. Click **Run**
5. **Refresh the admin dashboard** (hard refresh: Ctrl+Shift+R)

## What This Does

The fix creates two SELECT policies for the `users` table:

1. **"Users can view their own profile"** - For non-admin users only
2. **"Admins can view all users"** - For admin users (includes their own record)

This ensures that when `isAdmin()` runs:
- It can read your user record
- It can check your role
- It returns the correct result

## Verification

After running the SQL:

1. **Check browser console** (F12) - Look for `[isAdmin]` logs
2. **Go to `/admin/debug`** - Should show "Is Admin: ✅ Yes"
3. **Go to `/admin`** - Should show dashboard (not "Access Denied")

## Expected Console Logs

If working correctly, you should see in browser console:
```
[isAdmin] Checking admin role for authenticated user: { id: '...', email: '...' }
[isAdmin] Admin check result: { userId: '...', email: '...', roleInDatabase: 'admin', isAdmin: true }
```

If failing, you'll see:
```
[isAdmin] Database query error: { message: '...', code: 'PGRST301' }
```
or
```
[isAdmin] User record not found in public.users table
```

## Troubleshooting

### If still showing "Access Denied":

1. **Check browser console** for specific error messages
2. **Go to `/admin/debug`** to see detailed info
3. **Verify your admin role**:
   ```sql
   SELECT id, email, role FROM public.users WHERE role = 'admin';
   ```
4. **Sign out and sign back in** to refresh session
5. **Clear browser cache** and try again

### If console shows RLS errors:

The policies might not have been applied correctly. Re-run:
- `supabase/fix_users_rls_for_admin_check.sql`
- `supabase/add_admin_rls_policies.sql`

### If console shows "User record not found":

Your user might not exist in `public.users`. Run:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
SELECT id, email, role FROM public.users WHERE email = 'your-email@example.com';
```

If the first query returns a user but the second doesn't, run:
- `supabase/create_both_users.sql` (if it exists)
- Or manually create the user record

## Why This Happens

The `isAdmin()` function needs to:
1. Get the current user from session: `supabase.auth.getUser()`
2. Query `public.users` table: `supabase.from('users').select('role').eq('id', user.id)`
3. Check if `role === 'admin'`

Step 2 can fail if RLS policies don't allow reading your own record as an admin.

## Prevention

After fixing, the policies ensure:
- ✅ Admins can always read their own record (for admin checks)
- ✅ Admins can read all users (for admin dashboard)
- ✅ Regular users can only read their own record (security)





