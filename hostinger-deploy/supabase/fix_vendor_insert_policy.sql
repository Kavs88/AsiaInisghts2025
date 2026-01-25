-- Fix Vendor Insert Policy
-- Allow authenticated users to create their own vendor record during signup

-- Policy: Users can create their own vendor profile
DROP POLICY IF EXISTS "Users can create their own vendor profile" ON public.vendors;
CREATE POLICY "Users can create their own vendor profile" ON public.vendors
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Verify the policy
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
ORDER BY policyname;





