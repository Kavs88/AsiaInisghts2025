-- Verification Queries for Phase 2 Setup
-- Run these in Supabase SQL Editor to verify everything is working

-- 1. Check Tables Exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'events', 'businesses')
ORDER BY table_name;

-- 2. Check RLS is Enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('properties', 'events', 'businesses')
ORDER BY tablename;

-- 3. Check Policies Exist
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('properties', 'events', 'businesses')
ORDER BY tablename, policyname;

-- 4. Check Indexes Exist
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('properties', 'events', 'businesses')
ORDER BY tablename, indexname;

-- 5. Check Triggers Exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('properties', 'events', 'businesses')
ORDER BY event_object_table, trigger_name;

-- 6. Check Seed Data (if you ran 008_seed_clean.sql)
SELECT 
  (SELECT COUNT(*) FROM properties) as properties_count,
  (SELECT COUNT(*) FROM events) as events_count,
  (SELECT COUNT(*) FROM businesses) as businesses_count;

-- 7. View Sample Data (if seed data exists)
SELECT 'Properties' as table_name, id, address, type, price FROM properties LIMIT 3
UNION ALL
SELECT 'Events' as table_name, id::text, title, event_date::text, ticket_price FROM events LIMIT 3
UNION ALL
SELECT 'Businesses' as table_name, id::text, name, category, NULL::numeric FROM businesses LIMIT 3;






