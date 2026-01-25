# Step 3b: Deployment Execution Guide

**Date:** January 3, 2026  
**Status:** ⏳ **PENDING EXECUTION**  
**Execution Owner:** Human (Manual Only)  
**Risk Level:** High (Schema Mutations)  
**Automation Level:** None  
**Purpose:** Controlled manual deployment of cleaned migrations with integrity verification

**Note:** This guide is for Step 3b (Deployment Execution). Step 3a (Pre-Deployment Preparation) must be complete before proceeding.

**Legacy Reference:** This guide provides detailed procedures. For current authoritative procedures, see `STEP_3B_DEPLOYMENT_EXECUTION.md`.

---

## Responsibility & Scope

**Execution Owner:** Human (Manual Only)

**Automation Level:** None

**Step 4 Status:** BLOCKED (requires Step 3b completion and verification)

**Note:** This is a legacy reference document. For current authoritative procedures, see `STEP_3B_DEPLOYMENT_EXECUTION.md`.

---

## ⚠️ IMPORTANT: Manual Deployment Required

**This guide is for Step 3b (Deployment Execution).**

**Step 3a (Pre-Deployment Preparation) must be complete before proceeding.**

**You must deploy these migrations manually in Supabase SQL Editor.**

**See:** `STEP_3B_DEPLOYMENT_EXECUTION.md` for complete deployment procedures.

This guide provides:
1. Migration files to deploy (in order)
2. Verification queries to run after each migration
3. Schema verification checklist
4. TypeScript/API consistency checks
5. Dev server bring-up instructions
6. API smoke test procedures

---

## Task 1: Migration Deployment

### Deployment Order (CRITICAL - Deploy in this exact order)

1. **010_user_event_bookmarks_cleaned.sql** (NEW - replaces old 010)
2. **011_event_rsvp_system_cleaned.sql** (NEW - replaces old 011)
3. **012_activate_business_hub_cleaned.sql** (NEW - replaces old 012)
4. **014_reviews_and_trust_system.sql** (EXISTING - already clean)
5. **015_extend_properties_for_event_spaces.sql** (EXISTING - already clean)

### Deployment Steps

For each migration:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Navigate to **SQL Editor** (left sidebar)

2. **Open Migration File**
   - File location: `supabase/migrations/[filename].sql`
   - Copy entire contents (Ctrl+A, Ctrl+C)

3. **Paste in SQL Editor**
   - Click **"New Query"** in SQL Editor
   - Paste migration SQL (Ctrl+V)

4. **Run Migration**
   - Click **"Run"** button (or press Ctrl+Enter)
   - Wait for success message: "Success. No rows returned" or similar

5. **Verify Migration**
   - Run verification query (see below)
   - Confirm all checks pass ✅

6. **Repeat for Next Migration**
   - Only proceed to next migration after current one succeeds

---

## Task 2: Schema Verification

### After Each Migration: Run Verification Queries

#### After Migration 010 (User Event Bookmarks)

```sql
-- Verify table exists
SELECT 
  'Table exists' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_event_bookmarks'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
-- Verify columns
SELECT 
  'Columns correct',
  CASE WHEN (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_event_bookmarks'
    AND column_name IN ('id', 'user_id', 'market_day_id', 'intent_type', 'created_at')
  ) = 5 THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify FK to market_days
SELECT 
  'FK to market_days',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
    AND tc.table_name = 'user_event_bookmarks'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'market_day_id'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify indexes
SELECT 
  'Indexes count',
  CASE WHEN (
    SELECT COUNT(*) FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'user_event_bookmarks'
  ) >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify RLS enabled
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_event_bookmarks' 
    AND rowsecurity = true
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected:** All checks should show ✅ PASS

---

#### After Migration 011 (Event RSVP System)

```sql
-- Verify table exists
SELECT 
  'Table exists' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_event_rsvps'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
-- Verify columns
SELECT 
  'Columns correct',
  CASE WHEN (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_event_rsvps'
    AND column_name IN ('user_id', 'market_day_id', 'status', 'notes', 'agreed_to_policy', 'attendee_count', 'display_name', 'created_at', 'updated_at')
  ) = 9 THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify composite PK
SELECT 
  'Composite PK',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.user_event_rsvps'::regclass 
    AND contype = 'p'
    AND array_length(conkey, 1) = 2
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify FK to market_days
SELECT 
  'FK to market_days',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
    AND tc.table_name = 'user_event_rsvps'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'market_day_id'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify view exists
SELECT 
  'Event counts view',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'event_counts'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify RLS enabled
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_event_rsvps' 
    AND rowsecurity = true
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected:** All checks should show ✅ PASS

---

#### After Migration 012 (Business Hub)

```sql
-- Verify businesses table exists
SELECT 
  'Businesses table exists' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'businesses'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
-- Verify address/phone are nullable
SELECT 
  'Address nullable',
  CASE WHEN (
    SELECT is_nullable FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'businesses' 
    AND column_name = 'address'
  ) = 'YES' THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'Phone nullable',
  CASE WHEN (
    SELECT is_nullable FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'businesses' 
    AND column_name = 'contact_phone'
  ) = 'YES' THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify vendors have business_id
SELECT 
  'Vendors have business_id',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vendors' 
    AND column_name = 'business_id'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify RLS enabled
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'businesses' 
    AND rowsecurity = true
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected:** All checks should show ✅ PASS

---

#### After Migration 014 (Reviews System)

```sql
-- Verify reviews table exists
SELECT 
  'Reviews table exists' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'reviews'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
-- Verify review_helpful_votes table
SELECT 
  'Helpful votes table',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'review_helpful_votes'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify review_summaries view
SELECT 
  'Review summaries view',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'review_summaries'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify RLS enabled
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'reviews' 
    AND rowsecurity = true
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected:** All checks should show ✅ PASS

---

#### After Migration 015 (Properties Extension)

```sql
-- Verify property_type column
SELECT 
  'Property type column' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'property_type'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
-- Verify event space fields
SELECT 
  'Event space fields',
  CASE WHEN (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties'
    AND column_name IN ('capacity', 'hourly_rate', 'daily_rate', 'business_id')
  ) = 4 THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
-- Verify indexes
SELECT 
  'Property type index',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'properties' 
    AND indexname = 'idx_properties_property_type'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected:** All checks should show ✅ PASS

---

## Task 3: Type & API Consistency Check

### After All Migrations Deployed

**Run TypeScript Check:**

```bash
# In project root
npx tsc --noEmit
```

**Expected:** No type errors related to schema

**Run Lint:**

```bash
npm run lint
```

**Expected:** No linting errors

**Check for Old Table Name References:**

```bash
# Search for old table names
grep -r "user_event_intent" app/ lib/ components/ --exclude-dir=node_modules
grep -r "user_event_intents" app/ lib/ components/ --exclude-dir=node_modules
```

**Expected:** No references to old table names (or only in comments)

---

## Task 4: Dev Server Bring-Up

### Start Dev Server

```bash
# In project root
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3001
  - Ready in Xs
```

### Verify Server Starts Cleanly

**Check for:**
- ✅ No schema-related errors in console
- ✅ No missing environment variable errors
- ✅ Server starts without crashes
- ✅ No TypeScript compilation errors

**If errors occur:**
- Check `.env.local` has all required variables
- Check TypeScript types are updated
- Check API routes compile correctly

---

## Task 5: Non-UI Functional Smoke Tests

### Test RSVP API Endpoints

**1. Test POST /api/events/[id]/rsvp**

```bash
# Replace [id] with actual market_day_id
# Replace [auth-token] with valid auth token
curl -X POST http://localhost:3001/api/events/[id]/rsvp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [auth-token]" \
  -d '{
    "status": "going",
    "attendee_count": 1,
    "agreed_to_policy": true
  }'
```

**Expected:** 200 OK with success response

**2. Test GET /api/events/[id]/rsvp**

```bash
curl http://localhost:3001/api/events/[id]/rsvp \
  -H "Authorization: Bearer [auth-token]"
```

**Expected:** 200 OK with RSVP data or null

---

### Test Review Submission Endpoint

**Test POST /api/reviews**

```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [auth-token]" \
  -d '{
    "subject_id": "[business-id]",
    "subject_type": "business",
    "rating": 5,
    "comment": "Test review"
  }'
```

**Expected:** 200 OK with review data

---

### Test Bookmarks Intent API

**Test POST /api/events/[id]/intent**

```bash
curl -X POST http://localhost:3001/api/events/[id]/intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [auth-token]" \
  -d '{
    "intent_type": "saved"
  }'
```

**Expected:** 200 OK with intent data

---

## Deployment Log Template

Use this template to track deployment:

```markdown
## Migration Deployment Log

### Migration 010: User Event Bookmarks
- **Deployed:** [Date/Time]
- **Status:** ✅ Success / ❌ Failed
- **Verification:** ✅ All checks passed / ❌ Issues found
- **Notes:** [Any issues or observations]

### Migration 011: Event RSVP System
- **Deployed:** [Date/Time]
- **Status:** ✅ Success / ❌ Failed
- **Verification:** ✅ All checks passed / ❌ Issues found
- **Notes:** [Any issues or observations]

### Migration 012: Business Hub
- **Deployed:** [Date/Time]
- **Status:** ✅ Success / ❌ Failed
- **Verification:** ✅ All checks passed / ❌ Issues found
- **Notes:** [Any issues or observations]

### Migration 014: Reviews System
- **Deployed:** [Date/Time]
- **Status:** ✅ Success / ❌ Failed
- **Verification:** ✅ All checks passed / ❌ Issues found
- **Notes:** [Any issues or observations]

### Migration 015: Properties Extension
- **Deployed:** [Date/Time]
- **Status:** ✅ Success / ❌ Failed
- **Verification:** ✅ All checks passed / ❌ Issues found
- **Notes:** [Any issues or observations]

## Schema Verification Summary
- ✅ All tables exist with correct names
- ✅ All foreign keys reference market_days
- ✅ All indexes created
- ✅ RLS policies enabled

## TypeScript/API Check
- ✅ TypeScript compiles without errors
- ✅ Lint passes
- ✅ No old table name references

## Dev Server Status
- ✅ Server starts cleanly
- ✅ No runtime errors
- ✅ No missing env variables

## API Smoke Tests
- ✅ RSVP endpoints work
- ✅ Review endpoints work
- ✅ Bookmarks endpoints work
```

---

## Definition of Done (Step 3)

- [ ] All cleaned migrations deployed successfully
- [ ] Schema verified and documented
- [ ] TypeScript types updated (if needed)
- [ ] API routes compile cleanly
- [ ] Dev server running cleanly
- [ ] APIs functional at data level
- [ ] No UX or UI changes introduced

---

## Next Steps (After Step 3 Complete)

Once Step 3 is complete, proceed to:

**Step 4: Trust & Engagement Feature Wiring**
- Wire Reviews into UI (using confirmed layouts)
- Wire RSVP into UI (using confirmed layouts)
- Wire Event Spaces into UI (using confirmed layouts)

---

**Status:** 🟡 **PREPARED FOR DEPLOYMENT** - Follow guide above to deploy manually.

**Execution Owner:** Human (Manual Only) | **Automation Level:** None | **Step 4 Status:** BLOCKED

