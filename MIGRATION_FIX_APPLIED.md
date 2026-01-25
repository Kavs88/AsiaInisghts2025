# Migration Fix Applied

**Date:** December 30, 2025  
**Issue:** Policies already exist error  
**Fix:** Added DROP POLICY IF EXISTS before CREATE POLICY

---

## Issue

When running migration `010_attendee_intent_and_offers.sql`, got error:
```
ERROR: 42710: policy "Users can read own intents" for table "user_event_intent" already exists
```

This happens when the migration was partially run before, leaving policies but needing to recreate them.

---

## Fix Applied

Added `DROP POLICY IF EXISTS` statements before each `CREATE POLICY` to allow re-running migrations safely.

### Files Updated

1. **`supabase/migrations/010_attendee_intent_and_offers.sql`**
   - Added DROP POLICY IF EXISTS for all three policies:
     - "Users can read own intents"
     - "Users can insert own intents"
     - "Users can delete own intents"

2. **`supabase/migrations/011_event_rsvp_system_fixed.sql`**
   - Added DROP POLICY IF EXISTS for:
     - "Users manage own intents"

---

## How to Proceed

### Option 1: Run Migration Again (Recommended)

The migration files are now idempotent - they can be run multiple times safely.

**Steps:**
1. Copy contents of `010_attendee_intent_and_offers.sql`
2. Paste in Supabase SQL Editor
3. Run
4. Should complete successfully now ✅

### Option 2: Manual Policy Cleanup (If Option 1 Fails)

If you still get errors, manually drop policies first:

```sql
-- Drop all policies on user_event_intent
DROP POLICY IF EXISTS "Users can read own intents" ON public.user_event_intent;
DROP POLICY IF EXISTS "Users can insert own intents" ON public.user_event_intent;
DROP POLICY IF EXISTS "Users can delete own intents" ON public.user_event_intent;

-- Then run the full migration
```

---

## Verification

After running the migration successfully, verify:

```sql
-- Check policies exist
SELECT policyname FROM pg_policies 
WHERE tablename = 'user_event_intent';

-- Expected: 3 policies
-- - Users can read own intents
-- - Users can insert own intents
-- - Users can delete own intents
```

---

## Next Steps

After migration 010 succeeds:
1. Run migration 011 (RSVP system)
2. Run build: `npm run build`
3. Test Phase 4 features

---

**Fix Applied.** Migration files are now safe to re-run. ✅





