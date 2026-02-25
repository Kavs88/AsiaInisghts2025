-- Migration: 022_seed_rc2_content.sql
-- Description: Seeds 20 High-Quality Entities and 5 Founder Notes for RC2 Launch.
-- Risk Mitigation: R-GROWTH-01 (The Empty Room).

DO $$ 
DECLARE 
    v_entity_id UUID;
BEGIN

    -- 1. DINING (Hoi An & Danang)
    -- Banh Mi Phuong
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('vendor', 'Banh Mi Phuong', 'banh-mi-phuong', 'World-famous banh mi shop in Hoi An. Known for the Anthony Bourdain recommendation.', '2B Phan Chau Trinh, Hoi An', ARRAY['Dining', 'Street Food', 'Hoi An'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- Morning Glory
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('business', 'Morning Glory Original', 'morning-glory-original', 'Traditional Vietnamese street food served in a historic setting.', '106 Nguyen Thai Hoc, Hoi An', ARRAY['Dining', 'Vietnamese', 'Hoi An'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- Pizza 4P's
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('business', 'Pizza 4P''s Hoang Van Thu', 'pizza-4ps-hoang-van-thu', 'Farm-to-table pizza with house-made cheese.', '8 Hoang Van Thu, Da Nang', ARRAY['Dining', 'International', 'Da Nang'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- The Rachel
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('business', 'The Rachel Restaurant', 'the-rachel-restaurant', 'Fine dining with a view of the Dragon Bridge.', '166 Bach Dang, Da Nang', ARRAY['Dining', 'Fine Dining', 'Da Nang'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- Waterfront
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('business', 'Waterfront Danang', 'waterfront-danang', 'Riverside restaurant and bar, popular with expats.', '150 Bach Dang, Da Nang', ARRAY['Dining', 'Bar', 'Da Nang'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- Lim Dining
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('business', 'Lim Dining Room', 'lim-dining-room', 'modern Italian cuisine in a minimalist setting.', 'Hai Chau, Da Nang', ARRAY['Dining', 'Italian', 'Da Nang'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- Nen Restaurant
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('business', 'Nen Restaurant', 'nen-restaurant', 'Concept restaurant focusing on local ingredients.', 'My Khe, Da Nang', ARRAY['Dining', 'Fine Dining', 'Da Nang'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;


    -- 2. STAYS
    -- InterContinental
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('venue', 'InterContinental Danang Sun Peninsula Resort', 'intercontinental-danang', 'Luxury resort on the Son Tra Peninsula.', 'Son Tra, Da Nang', ARRAY['Stay', 'Luxury', 'Resort', 'Da Nang'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- Four Seasons
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('venue', 'Four Seasons Resort The Nam Hai', 'four-seasons-nam-hai', 'Beachfront luxury villas.', 'Ha My Beach, Hoi An', ARRAY['Stay', 'Luxury', 'Resort', 'Hoi An'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- TMS Hotel
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('venue', 'TMS Hotel Da Nang Beach', 'tms-hotel-danang', 'Modern hotel directly on My Khe Beach.', 'My Khe, Da Nang', ARRAY['Stay', 'Hotel', 'Da Nang'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- A La Carte
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('venue', 'A La Carte Da Nang Beach', 'a-la-carte-danang', 'Apartment style hotel with rooftop pool.', 'My Khe, Da Nang', ARRAY['Stay', 'Hotel', 'Da Nang'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- Little Hoi An
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('venue', 'Little Hoi An', 'little-hoi-an', 'Boutique hotel in the ancient town.', 'Hoi An', ARRAY['Stay', 'Boutique', 'Hoi An'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;


    -- 3. SERVICES
    -- FastTrack
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('service', 'FastTrack Da Nang', 'fasttrack-danang', 'Visa and relocation services for expats.', 'Da Nang', ARRAY['Service', 'Visa', 'Relocation'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- Lynn's Pharmacy
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('service', 'Lynn''s Pharmacy', 'lynns-pharmacy', 'Trusted pharmacy with English speaking staff.', 'An Thuong, Da Nang', ARRAY['Service', 'Health', 'Da Nang'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- Family Medical Practice
    INSERT INTO public.entities (type, name, slug, description, location_text, tags, source, confidence_score)
    VALUES ('service', 'Family Medical Practice', 'family-medical-practice', 'International standard medical center.', 'Da Nang', ARRAY['Service', 'Health', 'Da Nang'], 'seed_rc2', 100)
    ON CONFLICT (slug) DO NOTHING;

    -- 4. FOUNDER NOTES (Intelligence)
    -- Note for Banh Mi Phuong
    SELECT id INTO v_entity_id FROM public.entities WHERE slug = 'banh-mi-phuong';
    IF v_entity_id IS NOT NULL THEN
        INSERT INTO public.founder_notes (entity_id, note, visibility)
        VALUES (v_entity_id, 'Go early (before 11am) to avoid the tour bus queues. The BBQ pork with extra pate is the winner.', 'public');
    END IF;

    -- Note for Pizza 4P's
    SELECT id INTO v_entity_id FROM public.entities WHERE slug = 'pizza-4ps-hoang-van-thu';
    IF v_entity_id IS NOT NULL THEN
        INSERT INTO public.founder_notes (entity_id, note, visibility)
        VALUES (v_entity_id, 'Reservations are essential, even on weekdays. Ask for a table in the garden if you want a quieter conversation.', 'public');
    END IF;

    -- Note for Waterfront
    SELECT id INTO v_entity_id FROM public.entities WHERE slug = 'waterfront-danang';
    IF v_entity_id IS NOT NULL THEN
        INSERT INTO public.founder_notes (entity_id, note, visibility)
        VALUES (v_entity_id, 'Best spot for Friday night live music. The upstairs balcony has the best view of the Dragon Bridge fire show at 9pm on weekends.', 'public');
    END IF;

    -- Note for Lynn's Pharmacy
    SELECT id INTO v_entity_id FROM public.entities WHERE slug = 'lynns-pharmacy';
    IF v_entity_id IS NOT NULL THEN
        INSERT INTO public.founder_notes (entity_id, note, visibility)
        VALUES (v_entity_id, 'They stock many western brands that are hard to find elsewhere. You can message them on WhatsApp to check stock before going.', 'public');
    END IF;

     -- Note for InterContinental
    SELECT id INTO v_entity_id FROM public.entities WHERE slug = 'intercontinental-danang';
    IF v_entity_id IS NOT NULL THEN
        INSERT INTO public.founder_notes (entity_id, note, visibility)
        VALUES (v_entity_id, 'The Citron restaurant offers the best brunch view in the city. Book a "Heaven" table.', 'public');
    END IF;

END $$;
