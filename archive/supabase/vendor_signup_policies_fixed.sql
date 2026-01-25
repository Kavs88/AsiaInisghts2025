-- RLS Policies for Vendor Sign Up (FIXED)
-- Allows authenticated users to create their own user and vendor records during signup
-- IMPORTANT: Run this AFTER running schema.sql

-- First, ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Vendors can insert own record" ON public.vendors;

-- Policy: Users can insert their own user record
-- This allows a newly authenticated user to create their public.users record
CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can read their own record
CREATE POLICY "Users can read own record"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Vendors can insert their own vendor record
-- This allows a user to create their vendor profile after creating their user record
CREATE POLICY "Vendors can insert own record"
  ON public.vendors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also allow reading vendor records (for the signup flow to verify creation)
CREATE POLICY "Vendors can read own vendor record"
  ON public.vendors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: The signup flow is:
-- 1. supabase.auth.signUp() creates auth.users record and establishes session
-- 2. Insert into public.users (requires "Users can insert own record" policy)
-- 3. Insert into public.vendors (requires "Vendors can insert own record" policy)

