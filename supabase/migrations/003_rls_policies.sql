-- Migration: 003_rls_policies.sql
-- Description: Row Level Security (RLS) policies for all tables
-- Created: 2025-01-29
-- Dependencies: 001_initial_schema.sql, 002_functions.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

-- Admins can view all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update all users
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- VENDORS TABLE POLICIES
-- ============================================

-- Public can view active vendors
DROP POLICY IF EXISTS "Public can view active vendors" ON public.vendors;
CREATE POLICY "Public can view active vendors" ON public.vendors
    FOR SELECT USING (is_active = TRUE);

-- Vendors can view their own profile (even if inactive)
DROP POLICY IF EXISTS "Vendors can view own profile" ON public.vendors;
CREATE POLICY "Vendors can view own profile" ON public.vendors
    FOR SELECT USING (user_id = auth.uid());

-- Vendors cannot directly update (must use change requests)
-- This is intentional - vendors submit change requests instead

-- Admins can view all vendors
DROP POLICY IF EXISTS "Admins can view all vendors" ON public.vendors;
CREATE POLICY "Admins can view all vendors" ON public.vendors
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can insert/update/delete vendors
DROP POLICY IF EXISTS "Admins can manage vendors" ON public.vendors;
CREATE POLICY "Admins can manage vendors" ON public.vendors
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================

-- Public can view available products
DROP POLICY IF EXISTS "Public can view available products" ON public.products;
CREATE POLICY "Public can view available products" ON public.products
    FOR SELECT USING (is_available = TRUE);

-- Vendors can view their own products (even if unavailable)
DROP POLICY IF EXISTS "Vendors can view own products" ON public.products;
CREATE POLICY "Vendors can view own products" ON public.products
    FOR SELECT USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    );

-- Vendors can manage their own products
DROP POLICY IF EXISTS "Vendors can manage own products" ON public.products;
CREATE POLICY "Vendors can manage own products" ON public.products
    FOR ALL USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    )
    WITH CHECK (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    );

-- Admins can view all products
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products" ON public.products
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can manage all products
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
CREATE POLICY "Admins can manage all products" ON public.products
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- MARKET DAYS TABLE POLICIES
-- ============================================

-- Public can view published market days
DROP POLICY IF EXISTS "Public can view published market days" ON public.market_days;
CREATE POLICY "Public can view published market days" ON public.market_days
    FOR SELECT USING (is_published = TRUE);

-- Admins can view all market days
DROP POLICY IF EXISTS "Admins can view all market days" ON public.market_days;
CREATE POLICY "Admins can view all market days" ON public.market_days
    FOR SELECT USING (is_admin(auth.uid()));

-- Only admins can insert/update/delete market days
DROP POLICY IF EXISTS "Admins can manage market days" ON public.market_days;
CREATE POLICY "Admins can manage market days" ON public.market_days
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- MARKET STALLS TABLE POLICIES
-- ============================================

-- Public can view market stalls
DROP POLICY IF EXISTS "Public can view market stalls" ON public.market_stalls;
CREATE POLICY "Public can view market stalls" ON public.market_stalls
    FOR SELECT USING (TRUE);

-- Admins can manage market stalls
DROP POLICY IF EXISTS "Admins can manage market stalls" ON public.market_stalls;
CREATE POLICY "Admins can manage market stalls" ON public.market_stalls
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Customers can view their own orders
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders" ON public.orders
    FOR SELECT USING (customer_id = auth.uid());

-- Customers can create orders
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
CREATE POLICY "Customers can create orders" ON public.orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Vendors can view orders for their products
DROP POLICY IF EXISTS "Vendors can view own orders" ON public.orders;
CREATE POLICY "Vendors can view own orders" ON public.orders
    FOR SELECT USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    );

-- Vendors can update order status
DROP POLICY IF EXISTS "Vendors can update own orders" ON public.orders;
CREATE POLICY "Vendors can update own orders" ON public.orders
    FOR UPDATE USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    )
    WITH CHECK (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    );

-- Admins can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can manage all orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- ORDER ITEMS TABLE POLICIES
-- ============================================

-- Users can view order items for their orders
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM public.orders 
            WHERE customer_id = auth.uid()
            OR vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
        )
    );

-- Admins can view all order items
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can manage all order items
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items" ON public.order_items
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- ORDER INTENTS TABLE POLICIES
-- ============================================

-- Public can view order intents
DROP POLICY IF EXISTS "Public can view order intents" ON public.order_intents;
CREATE POLICY "Public can view order intents" ON public.order_intents
    FOR SELECT USING (TRUE);

-- Anyone can create order intents
DROP POLICY IF EXISTS "Anyone can create order intents" ON public.order_intents;
CREATE POLICY "Anyone can create order intents" ON public.order_intents
    FOR INSERT WITH CHECK (TRUE);

-- Vendors can update their order intents
DROP POLICY IF EXISTS "Vendors can update own order intents" ON public.order_intents;
CREATE POLICY "Vendors can update own order intents" ON public.order_intents
    FOR UPDATE USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    )
    WITH CHECK (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    );

-- Admins can manage all order intents
DROP POLICY IF EXISTS "Admins can manage all order intents" ON public.order_intents;
CREATE POLICY "Admins can manage all order intents" ON public.order_intents
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- VENDOR PORTFOLIO ITEMS TABLE POLICIES
-- ============================================

-- Public can view portfolio items
DROP POLICY IF EXISTS "Public can view portfolio items" ON public.vendor_portfolio_items;
CREATE POLICY "Public can view portfolio items" ON public.vendor_portfolio_items
    FOR SELECT USING (TRUE);

-- Vendors can manage their own portfolio items
DROP POLICY IF EXISTS "Vendors can manage own portfolio" ON public.vendor_portfolio_items;
CREATE POLICY "Vendors can manage own portfolio" ON public.vendor_portfolio_items
    FOR ALL USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    )
    WITH CHECK (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    );

-- Admins can manage all portfolio items
DROP POLICY IF EXISTS "Admins can manage all portfolio" ON public.vendor_portfolio_items;
CREATE POLICY "Admins can manage all portfolio" ON public.vendor_portfolio_items
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- VENDOR CHANGE REQUESTS TABLE POLICIES
-- ============================================

-- Vendors can view their own change requests
DROP POLICY IF EXISTS "Vendors can view own change requests" ON public.vendor_change_requests;
CREATE POLICY "Vendors can view own change requests" ON public.vendor_change_requests
    FOR SELECT USING (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
        OR requested_by = auth.uid()
    );

-- Vendors can create change requests
DROP POLICY IF EXISTS "Vendors can create change requests" ON public.vendor_change_requests;
CREATE POLICY "Vendors can create change requests" ON public.vendor_change_requests
    FOR INSERT WITH CHECK (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
        AND requested_by = auth.uid()
    );

-- Admins can view all change requests
DROP POLICY IF EXISTS "Admins can view all change requests" ON public.vendor_change_requests;
CREATE POLICY "Admins can view all change requests" ON public.vendor_change_requests
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update change requests (approve/reject)
DROP POLICY IF EXISTS "Admins can update change requests" ON public.vendor_change_requests;
CREATE POLICY "Admins can update change requests" ON public.vendor_change_requests
    FOR UPDATE USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- SUPER USERS TABLE POLICIES
-- ============================================

-- Only super users can view super users table
DROP POLICY IF EXISTS "Super users can view super users" ON public.super_users;
CREATE POLICY "Super users can view super users" ON public.super_users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.super_users WHERE user_id = auth.uid())
    );

-- Only super users can manage super users
DROP POLICY IF EXISTS "Super users can manage super users" ON public.super_users;
CREATE POLICY "Super users can manage super users" ON public.super_users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.super_users WHERE user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.super_users WHERE user_id = auth.uid())
    );






