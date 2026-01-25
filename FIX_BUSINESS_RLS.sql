-- Fix Business RLS Policies - Run this in Supabase SQL Editor
-- This ensures public users can view active businesses

-- Check current policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'businesses' AND cmd = 'SELECT';

-- Drop conflicting policies (from both migrations)
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Public Read Businesses" ON public.businesses;

-- Create single, clear public policy (only active businesses)
CREATE POLICY "Public can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = true);

-- Verify it was created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'businesses' AND cmd = 'SELECT';

-- Test query (should return count > 0)
SELECT COUNT(*) as active_businesses FROM public.businesses WHERE is_active = true;





