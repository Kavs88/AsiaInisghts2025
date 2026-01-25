-- Verification Queries for Order Intents and Notifications Migrations
-- Run these after running the migrations to verify everything was created correctly

-- 1. Verify order_intents table exists
SELECT 
  'order_intents table' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'order_intents'
    ) THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END AS status;

-- 2. Verify order_intents columns
SELECT 
  'order_intents columns' AS check_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'order_intents'
ORDER BY ordinal_position;

-- 3. Verify order_intents indexes
SELECT 
  'order_intents indexes' AS check_name,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'order_intents'
ORDER BY indexname;

-- 4. Verify enum types exist
SELECT 
  'enum types' AS check_name,
  t.typname AS enum_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('intent_type', 'intent_status', 'notification_channel')
GROUP BY t.typname
ORDER BY t.typname;

-- 5. Verify notification columns in vendors table
SELECT 
  'vendors notification columns' AS check_name,
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'vendors'
  AND column_name IN ('notification_channel', 'notification_target')
ORDER BY column_name;

-- 6. Verify trigger function exists
SELECT 
  'trigger function' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_proc 
      WHERE proname = 'notify_vendor_on_intent'
    ) THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END AS status;

-- 7. Verify trigger exists
SELECT 
  'trigger' AS check_name,
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  CASE WHEN tgenabled = 'O' THEN 'ENABLED' ELSE 'DISABLED' END AS status
FROM pg_trigger
WHERE tgname = 'trg_notify_vendor_on_intent';

-- 8. Verify RLS policies on order_intents
SELECT 
  'RLS policies' AS check_name,
  policyname,
  permissive,
  roles,
  cmd AS command
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'order_intents'
ORDER BY policyname;

-- 9. Summary check (all should return rows if migrations succeeded)
SELECT 
  'SUMMARY' AS check_type,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'order_intents') AS order_intents_table,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'notification_channel') AS notification_channel_column,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'notification_target') AS notification_target_column,
  (SELECT COUNT(*) FROM pg_type WHERE typname IN ('intent_type', 'intent_status', 'notification_channel')) AS enum_types_count,
  (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'trg_notify_vendor_on_intent') AS trigger_exists;

