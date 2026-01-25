# ✅ Admin Setup - Complete Guide

## Status: Trigger is Active! ✅

Your database trigger is working:
- **Trigger Name**: `on_auth_user_created`
- **Event**: INSERT on `auth.users`
- **Function**: `handle_new_user()`

## Next Steps

### 1. Sign Up or Sign In
- Go to `/auth/signup` to create a new account
- OR go to `/auth/login` if you already have an account
- The trigger will automatically create your user record in `public.users`

### 2. Make Yourself Admin
After signing in, run this SQL in Supabase SQL Editor:

```sql
-- Make yourself admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, full_name, role
FROM public.users
WHERE email = 'your-email@example.com';
```

Replace `'your-email@example.com'` with your actual email.

### 3. Refresh Your Session
1. Sign out
2. Sign back in
3. Visit `/admin/debug` to verify:
   - ✅ Server Client: Available
   - ✅ Is Admin: Yes
   - ✅ User Info: (your data)
   - ✅ User Role: (role: 'admin')

### 4. Access Admin Panel
Go to `/admin` - you should now have full access!

## What the Trigger Does

When a user signs up:
1. Supabase Auth creates the user in `auth.users`
2. The trigger automatically fires
3. Creates a corresponding record in `public.users` with:
   - Same ID
   - Email from auth
   - Name from metadata (or 'User' as default)
   - Role from metadata (or 'customer' as default)

## Admin Features Available

Once you're admin, you can:
- ✅ View dashboard with statistics (`/admin`)
- ✅ Manage all vendors (`/admin/vendors`)
- ✅ Manage all products (`/admin/products`)
- ✅ View all orders (`/admin/orders`)
- ✅ See "Admin" link in navigation (only visible to admins)

## Troubleshooting

### "User Info is still null"
- Make sure you're signed in
- Clear browser cookies and try again
- Check browser console for errors

### "Is Admin is still No"
- Verify you ran the UPDATE SQL
- Check your email matches exactly (case-sensitive)
- Sign out and sign back in to refresh session

### "Can't access /admin"
- Visit `/admin/debug` to see current status
- Make sure you signed out and signed back in after setting role
- Verify role in database: `SELECT role FROM public.users WHERE email = 'your-email'`

## Quick Test

1. Sign up with a new account
2. Check if user record was created:
   ```sql
   SELECT * FROM public.users WHERE email = 'your-email@example.com';
   ```
3. If it exists, the trigger is working! ✅
4. Set role to admin and you're done!





