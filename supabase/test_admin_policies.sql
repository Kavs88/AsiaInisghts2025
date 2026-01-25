-- Test Admin RLS Policies
-- Run this to verify admin policies are working

-- 1. Check if you're logged in and have admin role
SELECT 
  auth.uid() as current_user_id,
  u.id as user_id,
  u.email,
  u.role,
  CASE 
    WHEN u.role = 'admin' THEN '✅ You are an admin'
    ELSE '❌ You are NOT an admin'
  END as admin_status
FROM public.users u
WHERE u.id = auth.uid();

-- 2. Test if admin can count vendors (should work)
SELECT 
  COUNT(*) as vendor_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Can count vendors'
    ELSE '❌ Cannot count vendors (RLS blocking)'
  END as status
FROM public.vendors;

-- 3. Test if admin can count products (should work)
SELECT 
  COUNT(*) as product_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Can count products'
    ELSE '❌ Cannot count products (RLS blocking)'
  END as status
FROM public.products;

-- 4. Test if admin can count orders (should work)
SELECT 
  COUNT(*) as order_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Can count orders'
    ELSE '❌ Cannot count orders (RLS blocking)'
  END as status
FROM public.orders;

-- 5. Test if admin can count users (should work)
SELECT 
  COUNT(*) as user_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Can count users'
    ELSE '❌ Cannot count users (RLS blocking)'
  END as status
FROM public.users;

-- 6. Verify admin function works
SELECT 
  is_admin(auth.uid()) as is_admin_result,
  CASE 
    WHEN is_admin(auth.uid()) THEN '✅ Admin function returns true'
    ELSE '❌ Admin function returns false'
  END as status;





