-- Verify Migration 018
DO $$
BEGIN
    -- Check trust_badges column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entities' AND column_name = 'trust_badges') THEN
        RAISE EXCEPTION 'Column trust_badges missing on entities';
    END IF;

    -- Check new tables
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_participating_entities') THEN
        RAISE EXCEPTION 'Table event_participating_entities missing';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_follows') THEN
        RAISE EXCEPTION 'Table user_follows missing';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_saved_items') THEN
        RAISE EXCEPTION 'Table user_saved_items missing';
    END IF;

    RAISE NOTICE 'Migration 018 verified successfully';
END $$;
