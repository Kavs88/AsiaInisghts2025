-- Migration: 028_seed_partner_businesses.sql
-- Description: Seeds the three "Asia Insights Partner" businesses into businesses and entities tables

DO $$ 
DECLARE 
    v_admin_id UUID;
BEGIN
    -- Get an admin user to own these records
    SELECT id INTO v_admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
    
    -- If no admin found, use the first user
    IF v_admin_id IS NULL THEN
        SELECT id INTO v_admin_id FROM public.users LIMIT 1;
    END IF;

    -- Partner 1
    INSERT INTO public.businesses (
        id, owner_id, name, slug, category, contact_phone, is_active, trust_badges
    ) VALUES (
        '7000035d-3dbc-46bf-8268-af809da80b37',
        v_admin_id,
        'Asia Insights Partner',
        'asia-insights-partner-1',
        'Partner',
        '+84 000 000 001',
        true,
        ARRAY['verified']
    ) ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        slug = EXCLUDED.slug, 
        is_active = EXCLUDED.is_active;

    INSERT INTO public.entities (
        type, name, slug, description, location_text, tags, source, legacy_business_id, last_verified_at, owner_id
    ) VALUES (
        'business',
        'Asia Insights Partner',
        'asia-insights-partner-1',
        'Premium Asia Insights Partner business.',
        'Danang, Vietnam',
        ARRAY['Partner', 'Verified'],
        'seed_partner',
        '7000035d-3dbc-46bf-8268-af809da80b37',
        NOW(),
        v_admin_id
    ) ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        legacy_business_id = EXCLUDED.legacy_business_id;

    -- Partner 2
    INSERT INTO public.businesses (
        id, owner_id, name, slug, category, contact_phone, is_active, trust_badges
    ) VALUES (
        '7000035d-3dbc-46bf-8268-af809da80b38',
        v_admin_id,
        'Asia Insights Partner',
        'asia-insights-partner-2',
        'Partner',
        '+84 000 000 002',
        true,
        ARRAY['verified']
    ) ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        slug = EXCLUDED.slug, 
        is_active = EXCLUDED.is_active;

    INSERT INTO public.entities (
        type, name, slug, description, location_text, tags, source, legacy_business_id, last_verified_at, owner_id
    ) VALUES (
        'business',
        'Asia Insights Partner',
        'asia-insights-partner-2',
        'Premium Asia Insights Partner business.',
        'Danang, Vietnam',
        ARRAY['Partner', 'Verified'],
        'seed_partner',
        '7000035d-3dbc-46bf-8268-af809da80b38',
        NOW(),
        v_admin_id
    ) ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        legacy_business_id = EXCLUDED.legacy_business_id;

    -- Partner 3
    INSERT INTO public.businesses (
        id, owner_id, name, slug, category, contact_phone, is_active, trust_badges
    ) VALUES (
        '7000035d-3dbc-46bf-8268-af809da80b39',
        v_admin_id,
        'Asia Insights Partner',
        'asia-insights-partner-3',
        'Partner',
        '+84 000 000 003',
        true,
        ARRAY['verified']
    ) ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        slug = EXCLUDED.slug, 
        is_active = EXCLUDED.is_active;

    INSERT INTO public.entities (
        type, name, slug, description, location_text, tags, source, legacy_business_id, last_verified_at, owner_id
    ) VALUES (
        'business',
        'Asia Insights Partner',
        'asia-insights-partner-3',
        'Premium Asia Insights Partner business.',
        'Danang, Vietnam',
        ARRAY['Partner', 'Verified'],
        'seed_partner',
        '7000035d-3dbc-46bf-8268-af809da80b39',
        NOW(),
        v_admin_id
    ) ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        legacy_business_id = EXCLUDED.legacy_business_id;

END $$;
