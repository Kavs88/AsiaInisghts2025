
-- Drop legacy businesses table
-- This table is replaced by 'entities' (entity_type = 'business')

DROP TABLE IF EXISTS "public"."businesses" CASCADE;
