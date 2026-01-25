# Admin Access Fix - Step by Step

## Current Status
- ✅ Server Client: Available
- ❌ Is Admin: No (because not signed in)
- ❌ User Info: null (NOT SIGNED IN)
- ❌ User Role: null (because not signed in)

## The Problem
**You are NOT signed in.** The admin page requires you to be signed in first.

## Solution - Step by Step

### Step 1: Sign In First
1. Go to `/auth/login`
2. Enter your email and password
3. Click "Sign In"
4. You should be redirected after login

### Step 2: Verify You're Signed In
1. After signing in, visit `/admin/debug` again
2. Check "User Info" - should now show your email
3. Check "User Role" - should show your role

### Step 3: Set Admin Role (If Needed)
If "Is Admin" is still ❌ after signing in, run this SQL in Supabase:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Or if your user record doesn't exist, run:

```sql
-- First, get your user ID from auth.users
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then create/update the user record (replace USER_ID with the id from above)
INSERT INTO public.users (id, email, full_name, role)
VALUES ('USER_ID', 'your-email@example.com', 'Your Name', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Step 4: Test Admin Access
1. Sign out and sign back in (to refresh session)
2. Visit `/admin/debug` - "Is Admin" should be ✅ Yes
3. Visit `/admin` - should now load the dashboard

## Quick Fix SQL Script

If you know your email, run this in Supabase SQL Editor:

```sql
-- Set admin role for your email
UPDATE users 
SET role = 'admin' 
WHERE email = 'sam@kavsulting.com';

-- Or if you have multiple accounts
UPDATE users 
SET role = 'admin' 
WHERE email IN ('sam@kavsulting.com', 'sam@asia-insights.com');
```

## Troubleshooting

### "User Info is null" after signing in
- Clear browser cookies
- Sign out and sign back in
- Check browser console for errors

### "Is Admin is ❌" after setting role
- Sign out and sign back in (session needs refresh)
- Wait a few seconds for database update
- Check database directly: `SELECT * FROM users WHERE email = 'your-email@example.com';`

### Can't sign in
- Check if account exists in Supabase Auth
- Try password reset if needed
- Check browser console for errors

## Files to Check

1. `supabase/make_admin.sql` - SQL to set admin role
2. `supabase/create_both_users.sql` - SQL to create user records
3. `/admin/debug` - Diagnostic page





