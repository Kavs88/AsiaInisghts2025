-- ============================================
-- FIX SUPER_USERS RLS POLICIES
-- ============================================
-- The current policies have a circular dependency issue.
-- This script fixes them to allow users to check if they are super users.
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Super users can view super_users table" ON public.super_users;
DROP POLICY IF EXISTS "Super users can insert into super_users table" ON public.super_users;
DROP POLICY IF EXISTS "Super users can update super_users table" ON public.super_users;
DROP POLICY IF EXISTS "Super users can delete from super_users table" ON public.super_users;

-- FIXED: Allow users to check if THEY are a super user (self-check)
-- This breaks the circular dependency by allowing users to query their own UID
CREATE POLICY "Users can check if they are super users" ON public.super_users
    FOR SELECT
    USING (
        -- Allow users to check if they themselves are super users
        uid = auth.uid()
        -- OR allow if they are already a super user (using the function which bypasses RLS)
        OR is_super_user(auth.uid())
        -- OR allow if they are admin
        OR is_admin(auth.uid())
    );

-- Allow super users and admins to insert
CREATE POLICY "Super users and admins can insert" ON public.super_users
    FOR INSERT
    WITH CHECK (
        is_super_user(auth.uid())
        OR is_admin(auth.uid())
    );

-- Allow super users and admins to update
CREATE POLICY "Super users and admins can update" ON public.super_users
    FOR UPDATE
    USING (
        is_super_user(auth.uid())
        OR is_admin(auth.uid())
    )
    WITH CHECK (
        is_super_user(auth.uid())
        OR is_admin(auth.uid())
    );

-- Allow super users and admins to delete
CREATE POLICY "Super users and admins can delete" ON public.super_users
    FOR DELETE
    USING (
        is_super_user(auth.uid())
        OR is_admin(auth.uid())
    );

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, test with:
-- SELECT * FROM public.super_users WHERE uid = auth.uid();
-- This should work for any authenticated user to check their own status.


