-- Migration: 007_properties_events_businesses_rls.sql
-- Description: RLS policies for Properties, Events, and Business Directory modules

DROP POLICY IF EXISTS "Public can view available properties" ON public.properties;
CREATE POLICY "Public can view available properties" ON public.properties
    FOR SELECT USING (is_active = TRUE AND availability IN ('available', 'pending'));

DROP POLICY IF EXISTS "Owners can view own properties" ON public.properties;
CREATE POLICY "Owners can view own properties" ON public.properties
    FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can manage own properties" ON public.properties;
CREATE POLICY "Owners can manage own properties" ON public.properties
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
CREATE POLICY "Admins can view all properties" ON public.properties
    FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
CREATE POLICY "Admins can manage all properties" ON public.properties
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events" ON public.events
    FOR SELECT USING (is_published = TRUE AND is_active = TRUE);

DROP POLICY IF EXISTS "Organizers can view own events" ON public.events;
CREATE POLICY "Organizers can view own events" ON public.events
    FOR SELECT USING (organizer_id = auth.uid());

DROP POLICY IF EXISTS "Organizers can manage own events" ON public.events;
CREATE POLICY "Organizers can manage own events" ON public.events
    FOR ALL USING (organizer_id = auth.uid())
    WITH CHECK (organizer_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events" ON public.events
    FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events" ON public.events
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
CREATE POLICY "Public can view active businesses" ON public.businesses
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Owners can view own businesses" ON public.businesses;
CREATE POLICY "Owners can view own businesses" ON public.businesses
    FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can manage own businesses" ON public.businesses;
CREATE POLICY "Owners can manage own businesses" ON public.businesses
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
CREATE POLICY "Admins can view all businesses" ON public.businesses
    FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all businesses" ON public.businesses;
CREATE POLICY "Admins can manage all businesses" ON public.businesses
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));






