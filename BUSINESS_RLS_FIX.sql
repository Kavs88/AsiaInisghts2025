-- Fix RLS Policies for Businesses Table
-- Run this in Supabase SQL Editor if businesses queries are failing

-- Check existing policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'businesses';

-- Drop existing policies if needed (to recreate)
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Public can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Public Read Businesses" ON public.businesses;

-- Create public read policy for active businesses
CREATE POLICY "Public can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = true);

-- Verify policy was created
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'businesses' AND cmd = 'SELECT';





