# Admin Check - Session Issue Fix

## 🔴 Problem Found

The SQL test shows `auth.uid() = null` - this is **EXPECTED** because:
- SQL Editor runs queries **without a user session**
- `auth.uid()` only works when you're **signed in to the web app**
- The SQL test is just checking function syntax, not your actual session

## ✅ Real Issue

The problem is likely that:
1. Your browser session might not be properly authenticated
2. The `isAdmin()` function can't get your user ID from the session
3. The session might have expired

## Solution Steps

### Step 1: Verify You're Actually an Admin

Run this in SQL Editor to check your admin role directly:

```sql
SELECT 
  id,
  email,
  role,
  CASE 
    WHEN role = 'admin' THEN '✅ This user is an admin'
    ELSE '❌ This user is NOT an admin'
  END as status
FROM public.users
WHERE role = 'admin';
```

**If your email is NOT in this list:**
- You're not set as admin in the database
- Run: `supabase/create_both_users.sql` or `VERIFY_ADMIN_ROLE.sql`

**If your email IS in this list:**
- You ARE an admin in the database
- The issue is with the browser session (continue to Step 2)

### Step 2: Fix Browser Session

1. **Sign out completely:**
   - Go to your app
   - Click "Sign Out"
   - Clear browser cookies for your domain

2. **Sign back in:**
   - Go to `/auth/login`
   - Sign in with your admin email
   - Wait for redirect

3. **Check browser console (F12):**
   - Look for `[isAdmin]` logs
   - Should see: `Checking admin role for authenticated user: { id: '...', email: '...' }`

4. **Go to `/admin/debug`:**
   - Should show "Is Admin: ✅ Yes"
   - Should show your user info

### Step 3: Verify Session is Working

Open browser console (F12) and run:

```javascript
// Check if you're signed in
const { createClient } = await import('/lib/supabase/client');
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Check your role
const { data } = await supabase
  .from('users')
  .select('id, email, role')
  .eq('id', user.id)
  .single();
console.log('User role:', data);
```

**Expected output:**
- `Current user:` should show your user object with id and email
- `User role:` should show `{ role: 'admin' }`

**If you see errors:**
- Session might be expired
- Sign out and sign back in
- Clear browser cache

## Common Issues

### Issue 1: Session Expired
**Symptoms:**
- `auth.uid()` returns null
- `isAdmin()` returns false
- "Access Denied" message

**Fix:**
- Sign out and sign back in
- Check if session cookie exists in browser DevTools → Application → Cookies

### Issue 2: User Not in Database
**Symptoms:**
- `isAdmin()` logs: "User record not found in public.users table"

**Fix:**
- Run `supabase/create_both_users.sql` to create your user record
- Or manually insert your user record

### Issue 3: Role Not Set to Admin
**Symptoms:**
- User exists but `role != 'admin'`

**Fix:**
- Run `VERIFY_ADMIN_ROLE.sql` to set your role to admin
- Or manually update: `UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com'`

### Issue 4: RLS Policies Blocking
**Symptoms:**
- `isAdmin()` logs: "Database query error: PGRST301" or "row-level security"

**Fix:**
- Run `supabase/fix_admin_rls_circular_dependency.sql`
- This fixes the circular dependency issue

## Verification Checklist

After fixing:

- [ ] Your email appears in admin users query
- [ ] Browser console shows `[isAdmin] Checking admin role` with your user ID
- [ ] Browser console shows `[isAdmin] Admin check result: { isAdmin: true }`
- [ ] `/admin/debug` shows "Is Admin: ✅ Yes"
- [ ] `/admin` shows dashboard (not "Access Denied")
- [ ] Dashboard shows statistics (not all zeros)

## Why SQL Test Shows Null

The SQL Editor test showing `auth.uid() = null` is **completely normal**:
- SQL Editor doesn't have a browser session
- `auth.uid()` only works in authenticated contexts (browser, API calls)
- The function syntax is correct, it just needs a session to work

**The real test is in the browser**, not SQL Editor!

## Next Steps

1. **Verify admin role in database** (Step 1 above)
2. **Fix browser session** (Step 2 above)
3. **Check browser console** for `[isAdmin]` logs
4. **Go to `/admin/debug`** to see detailed info
5. **Try accessing `/admin`** - should work now!





