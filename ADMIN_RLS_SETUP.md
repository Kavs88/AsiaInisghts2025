# Admin RLS Policies Setup

## Issue Found

The admin pages are using **real Supabase data** (not hardcoded), but the **RLS (Row Level Security) policies** don't allow admins to view all data.

Currently:
- ✅ Admin pages query Supabase correctly
- ✅ Tables exist (`vendors`, `products`, `orders`, `users`)
- ❌ RLS policies block admin access to all data

## Solution

Run the SQL script `supabase/add_admin_rls_policies.sql` in your Supabase SQL Editor to add admin bypass policies.

## What This Does

Adds RLS policies that allow users with `role = 'admin'` to:
- **View all vendors** (including inactive ones)
- **View all products** (including unavailable ones)
- **View all orders** (from all customers)
- **View all users**
- **Update/Delete** vendors, products, and orders (for management)

## How to Apply

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/add_admin_rls_policies.sql`
3. Copy and paste the entire script
4. Click "Run"
5. Verify the policies were created (the script includes a verification query)

## Current Data Status

### ✅ Using Real Supabase Data
All admin pages are querying Supabase:
- Dashboard: `supabase.from('vendors').select('id', { count: 'exact', head: true })`
- Vendors: `supabase.from('vendors').select('*')`
- Products: `supabase.from('products').select('*')`
- Orders: `supabase.from('orders').select('*')`
- Users: `supabase.from('users').select('id', { count: 'exact', head: true })`

### ❌ RLS Blocking Access
Without the admin policies, admins can only see:
- Active vendors (public policy)
- Available products (public policy)
- Their own orders (user policy)
- Their own user record (user policy)

### ✅ After Running SQL
After running `add_admin_rls_policies.sql`, admins will see:
- **All vendors** (active and inactive)
- **All products** (available and unavailable)
- **All orders** (from all customers)
- **All users**

## Verification

After running the SQL, check the admin dashboard:
1. Go to `/admin`
2. Check if statistics show correct counts
3. Go to `/admin/vendors` - should see all vendors
4. Go to `/admin/products` - should see all products
5. Go to `/admin/orders` - should see all orders

If you see "No vendors/products/orders found" or counts are 0, the RLS policies may not be applied correctly.

## Troubleshooting

If admin access still doesn't work:

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

4. **Check RLS is enabled**:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public' AND tablename IN ('vendors', 'products', 'orders');
   ```





