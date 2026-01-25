-- Cleanup Vendor Policies
-- Remove duplicates and conflicting policies, keep only the correct ones

-- Drop all existing vendor policies
DROP POLICY IF EXISTS "Anyone can view active vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can create their own vendor profile" ON public.vendors;
DROP POLICY IF EXISTS "Vendors are publicly viewable" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can insert own vendor profile" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update own vendor profile" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update their own profile" ON public.vendors;

-- Create clean, non-conflicting policies

-- Policy 1: Anyone can view active vendors (public read)
CREATE POLICY "Vendors are publicly viewable" ON public.vendors
    FOR SELECT 
    TO public
    USING (is_active = TRUE);

-- Policy 2: Authenticated users can create their own vendor profile (INSERT)
CREATE POLICY "Users can create their own vendor profile" ON public.vendors
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own vendor profile (UPDATE)
CREATE POLICY "Users can update their own vendor profile" ON public.vendors
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policy 4: Service role can manage all vendors (for admin operations)
CREATE POLICY "Service role can manage vendors" ON public.vendors
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'vendors'
ORDER BY cmd, policyname;





