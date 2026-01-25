# Supabase Deployment Guide - Phase 3.6: Attendee Intent

## Overview

This guide provides exact steps to deploy the attendee intent system to your Supabase database.

## Prerequisites

- Access to Supabase Dashboard
- SQL Editor access
- Database admin permissions

---

## Step 1: Run Migration SQL

### Location
Run the SQL from: `supabase/migrations/010_attendee_intent_and_offers.sql`

### Instructions

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Create New Query**
   - Click "New Query"
   - Copy the entire contents of `supabase/migrations/010_attendee_intent_and_offers.sql`

3. **Run Migration**
   - Paste the SQL into the editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verify Success**
   - Check for any errors in the output
   - Should see: "Success. No rows returned"

---

## Step 2: Verify Table Creation

### Check Table Exists

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'user_event_intent';
```

**Expected Result:** Should return 1 row with `user_event_intent`

### Check Table Structure

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_event_intent'
ORDER BY ordinal_position;
```

**Expected Columns:**
- `id` (uuid)
- `user_id` (uuid)
- `event_id` (uuid)
- `intent_type` (text)
- `created_at` (timestamp with time zone)

---

## Step 3: Verify Constraints

### Check UNIQUE Constraint

```sql
SELECT 
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public.user_event_intent'::regclass
  AND contype = 'u';
```

**Expected Result:** Should show UNIQUE constraint on `(user_id, event_id, intent_type)`

### Check CHECK Constraint

```sql
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_event_intent'::regclass
  AND contype = 'c';
```

**Expected Result:** Should show CHECK constraint ensuring `intent_type IN ('favourite', 'planning_to_attend')`

---

## Step 4: Verify RLS Policies

### Check RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'user_event_intent';
```

**Expected Result:** `rowsecurity` should be `true`

### Check Policies Exist

```sql
SELECT 
  policyname,
  cmd AS command,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'user_event_intent'
ORDER BY policyname;
```

**Expected Policies:**
1. `Users can read own intents` (SELECT)
2. `Users can insert own intents` (INSERT)
3. `Users can delete own intents` (DELETE)

---

## Step 5: Verify Indexes

### Check Indexes

```sql
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'user_event_intent'
ORDER BY indexname;
```

**Expected Indexes:**
- `user_event_intent_pkey` (primary key)
- `idx_user_event_intent_user_id`
- `idx_user_event_intent_event_id`
- `idx_user_event_intent_type`
- `idx_user_event_intent_user_type`

---

## Step 6: Test RLS Policies

### Test as Authenticated User

1. **Get a test user ID:**
   ```sql
   SELECT id, email FROM auth.users LIMIT 1;
   ```

2. **Test SELECT Policy (should work):**
   ```sql
   -- This will use the authenticated user's context
   SET LOCAL role authenticated;
   SELECT * FROM public.user_event_intent WHERE user_id = auth.uid();
   ```

3. **Test INSERT Policy:**
   ```sql
   -- Insert test intent (replace with actual user_id and event_id)
   INSERT INTO public.user_event_intent (user_id, event_id, intent_type)
   VALUES (
     (SELECT id FROM auth.users LIMIT 1),
     gen_random_uuid(),
     'favourite'
   );
   ```

4. **Test DELETE Policy:**
   ```sql
   -- Delete test intent
   DELETE FROM public.user_event_intent 
   WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
     AND intent_type = 'favourite';
   ```

### Test Privacy (Unauthenticated Access)

```sql
-- This should return 0 rows (RLS blocks access)
SET LOCAL role anon;
SELECT * FROM public.user_event_intent;
```

**Expected Result:** Empty result set (RLS working correctly)

---

## Step 7: Verify User Roles Update

### Check Role Constraint

```sql
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND conname = 'users_role_check';
```

**Expected Result:** Should show constraint allowing:
- `'customer'`
- `'vendor'`
- `'admin'`
- `'business_user'`
- `'attendee_user'`

---

## Step 8: Verify Deals Table Update

### Check event_id Column

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'deals'
  AND column_name = 'event_id';
```

**Expected Result:** Should show `event_id` column (uuid, nullable)

### Check Index

```sql
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'deals'
  AND indexname = 'idx_deals_event_id';
```

**Expected Result:** Should return 1 row

---

## Troubleshooting

### Issue: "relation already exists"

**Solution:** The table already exists. Check if it has the correct structure:
```sql
\d public.user_event_intent
```

If structure is wrong, drop and recreate:
```sql
DROP TABLE IF EXISTS public.user_event_intent CASCADE;
-- Then re-run migration
```

### Issue: "permission denied"

**Solution:** Ensure you have admin access. Check your role:
```sql
SELECT current_user, current_role;
```

### Issue: RLS policies not working

**Solution:** Verify RLS is enabled:
```sql
ALTER TABLE public.user_event_intent ENABLE ROW LEVEL SECURITY;
```

Then recreate policies if needed (see migration file).

### Issue: Constraint violation on intent_type

**Solution:** Ensure you're using exact values:
- `'favourite'` (not 'favorite' or 'saved')
- `'planning_to_attend'` (not 'attending' or 'planning')

---

## Post-Deployment Checklist

- [ ] Table `user_event_intent` exists
- [ ] UNIQUE constraint on `(user_id, event_id, intent_type)` exists
- [ ] CHECK constraint on `intent_type` exists
- [ ] RLS is enabled
- [ ] All 3 RLS policies exist
- [ ] All 4 indexes exist
- [ ] User roles constraint updated
- [ ] Deals table has `event_id` column
- [ ] Deals table has `idx_deals_event_id` index
- [ ] Test insert/select/delete works
- [ ] Unauthenticated access is blocked

---

## Quick Verification Query

Run this single query to verify everything:

```sql
-- Comprehensive verification
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
  ) >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'User roles updated',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass 
      AND conname = 'users_role_check'
      AND pg_get_constraintdef(oid) LIKE '%attendee_user%'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'Deals event_id column',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'deals' 
      AND column_name = 'event_id'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected Result:** All checks should show ✅ PASS

---

## Next Steps

After successful deployment:

1. Test the API endpoints:
   - `POST /api/events/[id]/intent`
   - `GET /api/events/[id]/intent`
   - `GET /api/my-events`

2. Test the UI:
   - Visit a Market Days page
   - Verify intent buttons appear (when logged in)
   - Test saving and planning to attend
   - Visit `/markets/my-events` to see saved events

3. Monitor for errors:
   - Check Supabase logs for RLS policy violations
   - Verify inserts/deletes work correctly

---

**Deployment Complete** ✅





