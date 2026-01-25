-- ============================================
-- SUPER USER ACCESS SETUP
-- ============================================
-- 
-- This script enables full super user access for the site owner.
-- It creates a super_users table and updates RLS policies to allow
-- super users full access to market_days and vendors tables.
--
-- Steps:
-- 1. Create super_users table
-- 2. Create is_super_user() function
-- 3. Update RLS policies for market_days
-- 4. Update RLS policies for vendors
-- 5. Provide queries to add your user ID
--
-- ============================================
-- PART 1: CREATE SUPER_USERS TABLE
-- ============================================

-- Create super_users table to track UIDs with full access
CREATE TABLE IF NOT EXISTS public.super_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on super_users table
ALTER TABLE public.super_users ENABLE ROW LEVEL SECURITY;

-- Only super users and admins can view super_users table
CREATE POLICY "Super users can view super_users table" ON public.super_users
    FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.super_users WHERE uid = auth.uid())
        OR is_admin(auth.uid())
    );

-- Only super users and admins can insert into super_users table
CREATE POLICY "Super users can insert into super_users table" ON public.super_users
    FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.super_users WHERE uid = auth.uid())
        OR is_admin(auth.uid())
    );

-- Only super users and admins can update super_users table
CREATE POLICY "Super users can update super_users table" ON public.super_users
    FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.super_users WHERE uid = auth.uid())
        OR is_admin(auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.super_users WHERE uid = auth.uid())
        OR is_admin(auth.uid())
    );

-- Only super users and admins can delete from super_users table
CREATE POLICY "Super users can delete from super_users table" ON public.super_users
    FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM public.super_users WHERE uid = auth.uid())
        OR is_admin(auth.uid())
    );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_super_users_uid ON public.super_users(uid);

-- ============================================
-- PART 2: CREATE IS_SUPER_USER() FUNCTION
-- ============================================

-- Function to check if a user is a super user
CREATE OR REPLACE FUNCTION public.is_super_user(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.super_users
        WHERE uid = user_id
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current authenticated user is super user
CREATE OR REPLACE FUNCTION public.is_current_user_super_user()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.super_users
        WHERE uid = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PART 3: UPDATE MARKET_DAYS RLS POLICIES
-- ============================================

-- Update SELECT policy to allow super users to view all market days (including unpublished)
-- This complements the existing "Published market days are publicly viewable" policy
-- and "Admins can view all market days" if it exists
DROP POLICY IF EXISTS "Super users can view all market days" ON public.market_days;
CREATE POLICY "Super users can view all market days" ON public.market_days
    FOR SELECT
    USING (is_super_user(auth.uid()));

-- Update INSERT policy to allow super users
-- This complements the existing "Admins can insert market days" policy
DROP POLICY IF EXISTS "Super users can insert market days" ON public.market_days;
CREATE POLICY "Super users can insert market days" ON public.market_days
    FOR INSERT
    WITH CHECK (is_super_user(auth.uid()));

-- Update UPDATE policy to allow super users
-- This complements the existing "Admins can update market days" policy
DROP POLICY IF EXISTS "Super users can update market days" ON public.market_days;
CREATE POLICY "Super users can update market days" ON public.market_days
    FOR UPDATE
    USING (is_super_user(auth.uid()))
    WITH CHECK (is_super_user(auth.uid()));

-- Update DELETE policy to allow super users
-- This complements the existing "Admins can delete market days" policy
DROP POLICY IF EXISTS "Super users can delete market days" ON public.market_days;
CREATE POLICY "Super users can delete market days" ON public.market_days
    FOR DELETE
    USING (is_super_user(auth.uid()));

-- ============================================
-- PART 4: UPDATE VENDORS RLS POLICIES
-- ============================================

-- Note: PostgreSQL RLS combines multiple policies with OR, so these policies
-- will work alongside existing admin policies. Super users will have access
-- even if they're not admins.

-- Super users can view all vendors (including inactive)
-- This complements existing SELECT policies (vendors can view own, public can view active, admins can view all)
DROP POLICY IF EXISTS "Super users can view all vendors" ON public.vendors;
CREATE POLICY "Super users can view all vendors" ON public.vendors
    FOR SELECT
    USING (is_super_user(auth.uid()));

-- Super users can insert vendors
-- This complements the existing "Admins can insert vendors" policy
DROP POLICY IF EXISTS "Super users can insert vendors" ON public.vendors;
CREATE POLICY "Super users can insert vendors" ON public.vendors
    FOR INSERT
    WITH CHECK (is_super_user(auth.uid()));

-- Super users can update all vendors
-- This complements the existing "Admins can update all vendors" policy
DROP POLICY IF EXISTS "Super users can update all vendors" ON public.vendors;
CREATE POLICY "Super users can update all vendors" ON public.vendors
    FOR UPDATE
    USING (is_super_user(auth.uid()))
    WITH CHECK (is_super_user(auth.uid()));

-- Super users can delete vendors
-- This complements the existing "Admins can delete vendors" policy
DROP POLICY IF EXISTS "Super users can delete vendors" ON public.vendors;
CREATE POLICY "Super users can delete vendors" ON public.vendors
    FOR DELETE
    USING (is_super_user(auth.uid()));

-- ============================================
-- PART 5: VERIFICATION QUERIES
-- ============================================

-- Query to verify your user ID and admin status
-- Run this first to get your UID:
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Query to check if you're already in public.users and your role:
-- Replace 'YOUR_USER_ID_HERE' with your actual UID from above
/*
SELECT 
    id,
    email,
    role,
    full_name,
    CASE 
        WHEN role = 'admin' THEN '✅ You are an admin'
        ELSE '❌ You are not an admin (role: ' || role || ')'
    END as admin_status
FROM public.users
WHERE id = 'YOUR_USER_ID_HERE';
*/

-- Query to add yourself as a super user
-- Replace 'YOUR_USER_ID_HERE' with your actual UID
/*
INSERT INTO public.super_users (uid, email, full_name, notes, created_by)
SELECT 
    u.id,
    u.email,
    COALESCE(pu.full_name, u.email),
    'Site owner - full access',
    u.id
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.id = 'YOUR_USER_ID_HERE'
ON CONFLICT (uid) DO NOTHING
RETURNING *;
*/

-- Query to verify super user status
-- Replace 'YOUR_USER_ID_HERE' with your actual UID
/*
SELECT 
    su.id,
    su.uid,
    su.email,
    su.full_name,
    su.created_at,
    is_super_user(su.uid) as is_super_user_check,
    is_admin(su.uid) as is_admin_check
FROM public.super_users su
WHERE su.uid = 'YOUR_USER_ID_HERE';
*/

-- ============================================
-- PART 6: SUMMARY
-- ============================================
--
-- After running this script:
--
-- 1. Run the verification query in PART 5 to get your user ID
-- 2. Update your role to 'admin' in public.users if needed:
--    UPDATE public.users SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';
-- 3. Add yourself to super_users table using the INSERT query in PART 5
-- 4. Test your access by trying to:
--    - View unpublished market days
--    - Edit any vendor
--    - Create/update/delete market days
--
-- ============================================

