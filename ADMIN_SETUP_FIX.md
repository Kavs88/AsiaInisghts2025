# Admin Setup - Fix Guide

## Problem
You're seeing:
- ✅ Server Client: Available
- ❌ Is Admin: No
- ❌ User Info: null
- ❌ User Role: null

## Root Cause
**You're not signed in!** The `User Info: null` means there's no authenticated session.

## Solution

### Step 1: Sign In First
1. Go to `/auth/login` or click "Sign In" in the navigation
2. Sign in with your email and password
3. If you don't have an account, sign up first at `/auth/signup`

### Step 2: After Signing In, Make Yourself Admin

Once you're signed in, run this SQL in Supabase SQL Editor:

```sql
-- Option 1: If you just signed up and user record was created
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

**OR** if your user record doesn't exist in `public.users`:

```sql
-- Option 2: Create user record and set as admin (one step)
INSERT INTO public.users (id, email, role, full_name)
SELECT 
  id,
  email,
  'admin'::text,
  COALESCE(raw_user_meta_data->>'name', 'Admin User')
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  email = EXCLUDED.email;
```

Replace `'your-email@example.com'` with your actual email.

### Step 3: Verify
1. Sign out and sign back in (to refresh your session)
2. Visit `/admin/debug` again
3. You should now see:
   - ✅ Server Client: Available
   - ✅ Is Admin: Yes
   - ✅ User Info: (your user data)
   - ✅ User Role: (role: 'admin')

### Step 4: Access Admin Panel
Once verified, go to `/admin` - it should work now!

## Quick Checklist
- [ ] Signed in to the application
- [ ] User record exists in `public.users` table
- [ ] Role is set to 'admin' in `public.users` table
- [ ] Signed out and signed back in (to refresh session)
- [ ] Visit `/admin/debug` to verify
- [ ] Access `/admin` dashboard

## Troubleshooting

### "User Info is still null after signing in"
- Clear browser cookies and try again
- Check browser console for errors
- Make sure you're using the same email in both auth and SQL

### "User Role is still null"
- Make sure you ran the SQL UPDATE or INSERT
- Verify the email matches exactly (case-sensitive)
- Check that the user record exists: `SELECT * FROM public.users WHERE email = 'your-email@example.com'`

### "Still can't access /admin"
- Make sure you signed out and signed back in after running the SQL
- Check `/admin/debug` to see current status
- Verify role in database: `SELECT role FROM public.users WHERE email = 'your-email@example.com'`





