# Admin RLS Policies - Verification Guide

## ✅ Policies Successfully Created

Your admin RLS policies have been created! I can see all the policies in place:

- ✅ Admins can view all vendors
- ✅ Admins can view all products  
- ✅ Admins can view all orders
- ✅ Admins can view all users
- ✅ Admins can update/delete vendors and products
- ✅ Admins can update orders and users

## Next Steps

### 1. Test the Policies

Run this SQL in Supabase SQL Editor to verify everything works:

**File**: `supabase/test_admin_policies.sql`

This will test:
- Your admin role status
- Whether you can count vendors
- Whether you can count products
- Whether you can count orders
- Whether you can count users
- Whether the admin function works

### 2. Refresh Your Session

If the dashboard still shows 0 counts:

1. **Sign out** from the admin dashboard
2. **Sign back in** to refresh your session
3. **Hard refresh** the browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check the dashboard again

### 3. Check Browser Console

Open browser DevTools (F12) → Console and look for:
- ✅ No RLS errors = Policies working
- ❌ RLS errors = Session might need refresh

### 4. Verify Admin Role

Make sure your user has `role = 'admin'`:

```sql
SELECT id, email, role FROM public.users WHERE role = 'admin';
```

Your email should be in this list.

## Expected Results

After refreshing:

- ✅ Dashboard shows correct vendor count
- ✅ Dashboard shows correct product count
- ✅ Dashboard shows correct order count
- ✅ Dashboard shows correct user count
- ✅ All admin pages show all data (not just active/available)

## Troubleshooting

### If counts still show 0:

1. **Check your session**:
   - Sign out and sign back in
   - Clear browser cache
   - Try incognito/private window

2. **Verify admin role**:
   ```sql
   SELECT id, email, role FROM public.users WHERE id = auth.uid();
   ```
   Should show `role = 'admin'`

3. **Test policies directly**:
   Run `supabase/test_admin_policies.sql` to see which queries work

4. **Check for errors**:
   - Browser console (F12)
   - Network tab for failed requests
   - Supabase logs (Dashboard → Logs)

### If policies don't work:

The policies check `users.role = 'admin'`. Make sure:
- Your user record exists in `public.users`
- Your `role` column is exactly `'admin'` (case-sensitive)
- You're signed in (auth.uid() returns your user ID)

## Policy Details

The policies use this check:
```sql
EXISTS (
  SELECT 1 FROM public.users
  WHERE id = auth.uid() AND role = 'admin'
)
```

This means:
- ✅ Must be signed in (auth.uid() exists)
- ✅ Must have a record in `public.users`
- ✅ Must have `role = 'admin'` (exact match, case-sensitive)

## Success Indicators

You'll know it's working when:
- Dashboard totals show actual numbers (not 0)
- Vendor page shows all vendors (including inactive)
- Product page shows all products (including unavailable)
- Orders page shows all orders (from all customers)
- No RLS errors in browser console





