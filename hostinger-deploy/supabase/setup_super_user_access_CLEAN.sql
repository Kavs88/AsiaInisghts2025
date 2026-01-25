-- ============================================
-- SUPER USER ACCESS SETUP
-- ============================================
-- This script enables full super user access for the site owner.
-- Run this in Supabase SQL Editor
-- ============================================

-- PART 1: CREATE SUPER_USERS TABLE
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

ALTER TABLE public.super_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super users can view super_users table" ON public.super_users
    FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.super_users WHERE uid = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Super users can insert into super_users table" ON public.super_users
    FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.super_users WHERE uid = auth.uid())
        OR is_admin(auth.uid())
    );

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

CREATE POLICY "Super users can delete from super_users table" ON public.super_users
    FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM public.super_users WHERE uid = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE INDEX IF NOT EXISTS idx_super_users_uid ON public.super_users(uid);

-- PART 2: CREATE IS_SUPER_USER() FUNCTION
CREATE OR REPLACE FUNCTION public.is_super_user(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.super_users
        WHERE uid = user_id
    );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_current_user_super_user()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.super_users
        WHERE uid = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- PART 3: UPDATE MARKET_DAYS RLS POLICIES
DROP POLICY IF EXISTS "Super users can view all market days" ON public.market_days;
CREATE POLICY "Super users can view all market days" ON public.market_days
    FOR SELECT
    USING (is_super_user(auth.uid()));

DROP POLICY IF EXISTS "Super users can insert market days" ON public.market_days;
CREATE POLICY "Super users can insert market days" ON public.market_days
    FOR INSERT
    WITH CHECK (is_super_user(auth.uid()));

DROP POLICY IF EXISTS "Super users can update market days" ON public.market_days;
CREATE POLICY "Super users can update market days" ON public.market_days
    FOR UPDATE
    USING (is_super_user(auth.uid()))
    WITH CHECK (is_super_user(auth.uid()));

DROP POLICY IF EXISTS "Super users can delete market days" ON public.market_days;
CREATE POLICY "Super users can delete market days" ON public.market_days
    FOR DELETE
    USING (is_super_user(auth.uid()));

-- PART 4: UPDATE VENDORS RLS POLICIES
DROP POLICY IF EXISTS "Super users can view all vendors" ON public.vendors;
CREATE POLICY "Super users can view all vendors" ON public.vendors
    FOR SELECT
    USING (is_super_user(auth.uid()));

DROP POLICY IF EXISTS "Super users can insert vendors" ON public.vendors;
CREATE POLICY "Super users can insert vendors" ON public.vendors
    FOR INSERT
    WITH CHECK (is_super_user(auth.uid()));

DROP POLICY IF EXISTS "Super users can update all vendors" ON public.vendors;
CREATE POLICY "Super users can update all vendors" ON public.vendors
    FOR UPDATE
    USING (is_super_user(auth.uid()))
    WITH CHECK (is_super_user(auth.uid()));

DROP POLICY IF EXISTS "Super users can delete vendors" ON public.vendors;
CREATE POLICY "Super users can delete vendors" ON public.vendors
    FOR DELETE
    USING (is_super_user(auth.uid()));


