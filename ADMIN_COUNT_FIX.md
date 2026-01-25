# Admin Dashboard Counts Not Showing - Fix Guide

## Problem

The totals on the admin dashboard show **0** even though there is data in the tables.

## Root Cause

The count queries are being **blocked by RLS (Row Level Security) policies**. Even though you're an admin, the RLS policies don't allow admins to count rows.

## Solution

You need to run the admin RLS policies SQL script:

**File**: `supabase/add_admin_rls_policies.sql`

### Steps

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `supabase/add_admin_rls_policies.sql`
3. Copy the entire script
4. Paste into SQL Editor
5. Click **Run**
6. Refresh the admin dashboard

## What This Does

The SQL script adds RLS policies that allow users with `role = 'admin'` to:
- **View all vendors** (including inactive)
- **View all products** (including unavailable)
- **View all orders** (from all customers)
- **View all users**
- **Count all rows** (needed for dashboard stats)

## Verification

After running the SQL:

1. **Check browser console** - Should see no RLS errors
2. **Check admin dashboard** - Totals should show correct counts
3. **Check individual pages** - Should see all data

## Alternative: Check Console Errors

If you open browser DevTools (F12) → Console, you might see errors like:
- `new row violates row-level security policy`
- `PGRST301` (RLS policy violation)
- `permission denied for table`

These confirm that RLS is blocking the queries.

## Why Count Queries Are Blocked

Supabase count queries (`{ count: 'exact', head: true }`) still apply RLS policies. Even though you're only counting, Supabase checks if you have permission to SELECT from the table.

Without admin RLS policies:
- ✅ You can see your own data
- ✅ Public can see active vendors/products
- ❌ Admins **cannot** see all data (including counts)

With admin RLS policies:
- ✅ Admins can see **all** data
- ✅ Admins can count **all** rows
- ✅ Dashboard totals work correctly

## Troubleshooting

If counts still show 0 after running the SQL:

1. **Verify your admin role**:
   ```sql
   SELECT id, email, role FROM public.users WHERE role = 'admin';
   ```

2. **Check if policies exist**:
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename = 'vendors' AND policyname LIKE '%Admin%';
   ```

3. **Test admin function**:
   ```sql
   SELECT is_admin(auth.uid());
   ```

4. **Check browser console** for specific error messages

5. **Sign out and sign back in** to refresh your session

## Expected Result

After running the SQL and refreshing:
- ✅ Dashboard shows correct vendor count
- ✅ Dashboard shows correct product count
- ✅ Dashboard shows correct order count
- ✅ Dashboard shows correct user count
- ✅ All admin pages show all data





