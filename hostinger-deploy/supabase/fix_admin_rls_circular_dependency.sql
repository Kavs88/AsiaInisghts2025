-- Fix Circular Dependency in Admin RLS Policies
-- The "Admins can view all users" policy tries to check the users table,
-- but it can't because of RLS. We need to use the is_admin() function
-- which has SECURITY DEFINER and bypasses RLS.

-- ============================================
-- STEP 1: DROP EXISTING ADMIN POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can update all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can delete vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can update all products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- ============================================
-- STEP 2: CREATE POLICIES USING is_admin() FUNCTION
-- ============================================

-- USERS TABLE
-- Policy: Admins can view all users (using is_admin() function to avoid circular dependency)
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Policy: Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- VENDORS TABLE
-- Policy: Admins can view all vendors
CREATE POLICY "Admins can view all vendors" ON public.vendors
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Policy: Admins can update all vendors
CREATE POLICY "Admins can update all vendors" ON public.vendors
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- Policy: Admins can delete vendors
CREATE POLICY "Admins can delete vendors" ON public.vendors
  FOR DELETE
  USING (is_admin(auth.uid()));

-- PRODUCTS TABLE
-- Policy: Admins can view all products
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Policy: Admins can update all products
CREATE POLICY "Admins can update all products" ON public.products
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- Policy: Admins can delete products
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ORDERS TABLE
-- Policy: Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Policy: Admins can update all orders
CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- ORDER_ITEMS TABLE
-- Policy: Admins can view all order items
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================
-- STEP 3: VERIFY is_admin() FUNCTION EXISTS
-- ============================================

-- Make sure the function exists and has SECURITY DEFINER
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'is_admin'
  ) THEN
    RAISE EXCEPTION 'is_admin() function does not exist! Run schema_safe.sql first.';
  END IF;
END $$;

-- ============================================
-- STEP 4: VERIFICATION
-- ============================================

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('vendors', 'products', 'orders', 'order_items', 'users')
  AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;

-- Test the is_admin() function
SELECT 
  auth.uid() as current_user_id,
  is_admin(auth.uid()) as is_admin_result,
  CASE 
    WHEN is_admin(auth.uid()) THEN '✅ You are an admin'
    ELSE '❌ You are NOT an admin'
  END as status;





