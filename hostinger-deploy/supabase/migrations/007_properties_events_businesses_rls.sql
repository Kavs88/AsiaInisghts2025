-- Migration: 007_properties_events_businesses_rls.sql
-- Description: RLS policies for Properties, Events, and Business Directory modules
-- Created: 2025-01-29
-- Dependencies: 006_properties_events_businesses_schema.sql, 002_functions.sql

-- ============================================
-- PROPERTIES TABLE POLICIES
-- ============================================

-- Public can view active, available properties
DROP POLICY IF EXISTS "Public can view available properties" ON public.properties;
CREATE POLICY "Public can view available properties" ON public.properties
    FOR SELECT USING (is_active = TRUE AND availability IN ('available', 'pending'));

-- Property owners can view their own properties (even if inactive)
DROP POLICY IF EXISTS "Owners can view own properties" ON public.properties;
CREATE POLICY "Owners can view own properties" ON public.properties
    FOR SELECT USING (owner_id = auth.uid());

-- Property owners can manage their own properties
DROP POLICY IF EXISTS "Owners can manage own properties" ON public.properties;
CREATE POLICY "Owners can manage own properties" ON public.properties
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Admins can view all properties
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
CREATE POLICY "Admins can view all properties" ON public.properties
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can manage all properties
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
CREATE POLICY "Admins can manage all properties" ON public.properties
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- EVENTS TABLE POLICIES
-- ============================================

-- Public can view published, active events
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events" ON public.events
    FOR SELECT USING (is_published = TRUE AND is_active = TRUE);

-- Organizers can view their own events (even if unpublished)
DROP POLICY IF EXISTS "Organizers can view own events" ON public.events;
CREATE POLICY "Organizers can view own events" ON public.events
    FOR SELECT USING (organizer_id = auth.uid());

-- Organizers can manage their own events
DROP POLICY IF EXISTS "Organizers can manage own events" ON public.events;
CREATE POLICY "Organizers can manage own events" ON public.events
    FOR ALL USING (organizer_id = auth.uid())
    WITH CHECK (organizer_id = auth.uid());

-- Admins can view all events
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events" ON public.events
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can manage all events
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events" ON public.events
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- BUSINESSES TABLE POLICIES
-- ============================================

-- Public can view active businesses
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
CREATE POLICY "Public can view active businesses" ON public.businesses
    FOR SELECT USING (is_active = TRUE);

-- Business owners can view their own businesses (even if inactive)
DROP POLICY IF EXISTS "Owners can view own businesses" ON public.businesses;
CREATE POLICY "Owners can view own businesses" ON public.businesses
    FOR SELECT USING (owner_id = auth.uid());

-- Business owners can manage their own businesses
DROP POLICY IF EXISTS "Owners can manage own businesses" ON public.businesses;
CREATE POLICY "Owners can manage own businesses" ON public.businesses
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Admins can view all businesses
DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
CREATE POLICY "Admins can view all businesses" ON public.businesses
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can manage all businesses
DROP POLICY IF EXISTS "Admins can manage all businesses" ON public.businesses;
CREATE POLICY "Admins can manage all businesses" ON public.businesses
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));




