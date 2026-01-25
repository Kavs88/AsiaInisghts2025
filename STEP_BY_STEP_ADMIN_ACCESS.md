# Step-by-Step: Get Admin Access Working

## Current Problem
- ❌ **User Info: null** = You are NOT signed in
- ❌ **User Role: null** = Because you're not signed in
- ❌ **Is Admin: No** = Because you're not signed in

## Solution (3 Simple Steps)

### Step 1: Sign In First ⭐ MOST IMPORTANT
1. **Go to**: `http://localhost:3001/auth/login`
2. **Enter your email**: `sam@kavsulting.com` or `sam@asia-insights.com`
3. **Enter your password**
4. **Click "Sign In"**

### Step 2: Set Admin Role
After signing in, run this SQL in **Supabase SQL Editor**:

```sql
-- Set admin role for your accounts
UPDATE public.users
SET role = 'admin'
WHERE email IN ('sam@kavsulting.com', 'sam@asia-insights.com');

-- Verify it worked
SELECT id, email, full_name, role
FROM public.users
WHERE email IN ('sam@kavsulting.com', 'sam@asia-insights.com');
```

**OR** use the file I created: `QUICK_ADMIN_FIX.sql` - just copy and paste it into Supabase SQL Editor.

### Step 3: Refresh and Test
1. **Sign out** (if still on login page)
2. **Sign back in** (to refresh your session)
3. **Visit** `/admin/debug` - should now show:
   - ✅ User Info: {your email}
   - ✅ User Role: {role: "admin"}
   - ✅ Is Admin: Yes
4. **Visit** `/admin` - should now load the dashboard!

## Quick Reference

### If User Record Doesn't Exist
Run this SQL instead:

```sql
-- Create user records and set as admin
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', 'Admin User'),
  'admin'
FROM auth.users
WHERE email IN ('sam@kavsulting.com', 'sam@asia-insights.com')
ON CONFLICT (id) DO UPDATE SET
  role = 'admin';
```

### Files Created
- `QUICK_ADMIN_FIX.sql` - Quick SQL to set admin role
- `STEP_BY_STEP_ADMIN_ACCESS.md` - This file
- `ADMIN_ACCESS_FIX.md` - Detailed troubleshooting

## Common Issues

### "I can't sign in"
- Check if your password is correct
- Try password reset: `/auth/reset-password/custom`
- Check browser console for errors

### "Is Admin still shows ❌ after setting role"
- **Sign out and sign back in** (session needs refresh)
- Wait 2-3 seconds after running SQL
- Check database directly: `SELECT * FROM users WHERE email = 'your-email@example.com';`

### "User Role is null after signing in"
- Your user record doesn't exist in `public.users` table
- Run `supabase/create_both_users.sql` in Supabase SQL Editor
- Then sign out and sign back in

## Summary
1. ✅ **Sign in** at `/auth/login`
2. ✅ **Run SQL** to set admin role (use `QUICK_ADMIN_FIX.sql`)
3. ✅ **Sign out and back in** to refresh session
4. ✅ **Visit** `/admin` - should work!





