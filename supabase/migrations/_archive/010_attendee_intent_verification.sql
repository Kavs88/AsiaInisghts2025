-- Verification Queries for user_event_intent Table
-- Run these after deploying migration 010_attendee_intent_and_offers.sql

-- ============================================
-- 1. VERIFY TABLE EXISTS
-- ============================================
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'user_event_intent';

-- Expected: 1 row returned

-- ============================================
-- 2. VERIFY TABLE STRUCTURE
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_event_intent'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid, not null, default gen_random_uuid())
-- user_id (uuid, not null)
-- event_id (uuid, not null)
-- intent_type (text, not null)
-- created_at (timestamp with time zone, not null, default now())

-- ============================================
-- 3. VERIFY CONSTRAINTS
-- ============================================

-- Check UNIQUE constraint
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_event_intent'::regclass
  AND contype = 'u';

-- Expected: UNIQUE constraint on (user_id, event_id, intent_type)

-- Check CHECK constraint
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_event_intent'::regclass
  AND contype = 'c';

-- Expected: CHECK constraint ensuring intent_type IN ('favourite', 'planning_to_attend')

-- Check Foreign Key constraint
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_event_intent'::regclass
  AND contype = 'f';

-- Expected: Foreign key from user_id to users.id

-- ============================================
-- 4. VERIFY INDEXES
-- ============================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'user_event_intent'
ORDER BY indexname;

-- Expected indexes:
-- user_event_intent_pkey (primary key on id)
-- idx_user_event_intent_user_id
-- idx_user_event_intent_event_id
-- idx_user_event_intent_type
-- idx_user_event_intent_user_type

-- ============================================
-- 5. VERIFY RLS IS ENABLED
-- ============================================
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'user_event_intent';

-- Expected: rowsecurity = true

-- ============================================
-- 6. VERIFY RLS POLICIES
-- ============================================
SELECT 
  policyname,
  cmd AS command,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'user_event_intent'
ORDER BY policyname;

-- Expected policies:
-- "Users can read own intents" (SELECT)
-- "Users can insert own intents" (INSERT)
-- "Users can delete own intents" (DELETE)

-- ============================================
-- 7. VERIFY DEALS TABLE UPDATE
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'deals'
  AND column_name = 'event_id';

-- Expected: event_id column exists (uuid, nullable)

-- Check deals event_id index
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'deals'
  AND indexname = 'idx_deals_event_id';

-- Expected: 1 row returned

-- ============================================
-- 8. VERIFY USER ROLES UPDATE
-- ============================================
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND conname = 'users_role_check';

-- Expected: Constraint allowing 'customer', 'vendor', 'admin', 'business_user', 'attendee_user'

-- ============================================
-- 9. TEST DATA INSERT (as authenticated user)
-- ============================================
-- Note: This requires an authenticated session
-- Replace USER_ID and EVENT_ID with actual values

-- Test insert (should work if user is authenticated)
-- INSERT INTO public.user_event_intent (user_id, event_id, intent_type)
-- VALUES (
--   'USER_ID_HERE',
--   'EVENT_ID_HERE',
--   'favourite'
-- );

-- Test duplicate prevention (should fail)
-- INSERT INTO public.user_event_intent (user_id, event_id, intent_type)
-- VALUES (
--   'USER_ID_HERE',
--   'EVENT_ID_HERE',
--   'favourite'
-- );
-- Expected: Error - violates UNIQUE constraint

-- Test invalid intent_type (should fail)
-- INSERT INTO public.user_event_intent (user_id, event_id, intent_type)
-- VALUES (
--   'USER_ID_HERE',
--   'EVENT_ID_HERE',
--   'invalid_type'
-- );
-- Expected: Error - violates CHECK constraint

-- ============================================
-- 10. COMPREHENSIVE VERIFICATION
-- ============================================
SELECT 
  'Table exists' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_event_intent'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'user_event_intent' AND rowsecurity = true
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'Policies count',
  CASE WHEN (
    SELECT COUNT(*) FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_event_intent'
  ) = 3 THEN '✅ PASS (3 policies)' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'Indexes count',
  CASE WHEN (
    SELECT COUNT(*) FROM pg_indexes 
    WHERE schemaname = 'public' AND tablename = 'user_event_intent'
  ) >= 5 THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'UNIQUE constraint',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.user_event_intent'::regclass 
      AND contype = 'u'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'CHECK constraint',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.user_event_intent'::regclass 
      AND contype = 'c'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'Foreign key constraint',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.user_event_intent'::regclass 
      AND contype = 'f'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'Deals event_id column',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'deals' 
      AND column_name = 'event_id'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'Deals event_id index',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND tablename = 'deals' 
      AND indexname = 'idx_deals_event_id'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'User roles updated',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass 
      AND conname = 'users_role_check'
      AND pg_get_constraintdef(oid) LIKE '%attendee_user%'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;

-- Expected: All checks should show ✅ PASS





