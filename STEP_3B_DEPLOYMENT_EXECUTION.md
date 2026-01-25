# Step 3b: Deployment Execution - Controlled Manual Deployment

**Date:** January 3, 2026  
**Status:** ⏳ **PENDING EXECUTION**  
**Execution Owner:** Human (Manual Only)  
**Risk Level:** High (Schema Mutations)  
**Automation Level:** None  
**Purpose:** Controlled manual deployment of cleaned migrations with integrity verification

---

## Verification Confidence Summary

**HIGH CONFIDENCE (Artifact-Based Verification):**
- ✅ Migration files exist with correct structure (verified via file system)
- ✅ Verification queries are syntactically valid SQL (verified via code inspection)
- ✅ Deployment procedures are documented (verified via documentation review)

**LOW CONFIDENCE (Cannot Verify from Repository):**
- ⚠️ Supabase project ID (environment-specific, cannot verify from artifacts)
- ⚠️ Supabase dashboard accessibility (requires human verification)

**UNKNOWN (Cannot Be Known Without Execution):**
- ❌ Migration execution results
- ❌ Schema verification results
- ❌ Runtime verification results
- ❌ API functional verification results

**See:** `REALITY_CHECK_RESULT.md` for complete verification details.

---

## Deployment Assumption Lock

**All deployment instructions assume:**

1. **Single Supabase Project**
   - All migrations target one Supabase project
   - Project ID: `hkssuvamxdnqptyprsom` (environment-specific, cannot verify from repository)
   - No multi-project deployment scenarios

2. **No Parallel Schema Modification**
   - No simultaneous schema changes via Supabase dashboard
   - No concurrent migrations from other sources
   - No manual table/column modifications during migration deployment

3. **Sequential Migration Execution**
   - Migrations executed one at a time in exact order specified
   - Each migration verified before proceeding to next
   - No batch or parallel execution

4. **Manual Execution Only**
   - All deployments performed manually in Supabase SQL Editor
   - No automated deployment tools or scripts
   - Human verification required at each step

**If deployment environment differs from these assumptions, deployment procedures must be re-evaluated.**

---

## Responsibility & Scope

**Execution Owner:** Human (Manual Only)

**Automation Level:** None

**Scope:**
- ✅ Manual migration deployment execution
- ✅ Schema verification execution
- ✅ Runtime verification execution
- ✅ API functional verification execution
- ❌ No UI changes (reserved for Step 4)
- ❌ No progression to Step 4 (blocked until all verifications pass)

---

## Prerequisites

**Before proceeding, confirm:**
- ✅ Step 3a (Pre-Deployment Preparation) is complete
- ✅ All migration artifacts are prepared
- ✅ All code artifacts are updated
- ✅ TypeScript compilation succeeds

**If any prerequisite is not met, return to Step 3a.**

---

## Deployment Sequence

### Phase 1: Migration Deployment

**Deploy migrations in this exact order (CRITICAL):**

1. `010_user_event_bookmarks_cleaned.sql`
2. `011_event_rsvp_system_cleaned.sql`
3. `012_activate_business_hub_cleaned.sql`
4. `014_reviews_and_trust_system.sql`
5. `015_extend_properties_for_event_spaces.sql`

**Deployment Procedure (for each migration):**

1. **Access Supabase SQL Editor**
   - Navigate to: https://supabase.com/dashboard
   - Select project: `hkssuvamxdnqptyprsom`
   - Open **SQL Editor** (left sidebar)

2. **Load Migration File**
   - File path: `supabase/migrations/[filename].sql`
   - Copy entire file contents (Ctrl+A, Ctrl+C)

3. **Execute Migration**
   - Click **"New Query"** in SQL Editor
   - Paste migration SQL (Ctrl+V)
   - Click **"Run"** (or press Ctrl+Enter)
   - Wait for success confirmation

4. **Verify Migration**
   - Run verification query (provided below)
   - Confirm all checks return ✅ PASS
   - Document results in deployment log

5. **Proceed to Next Migration**
   - Only proceed if current migration succeeds
   - If verification fails, stop and investigate

---

## Phase 2: Schema Verification

### Verification Queries

#### After Migration 010 (User Event Bookmarks)

```sql
-- Comprehensive verification query
SELECT 
  'Table exists' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_event_bookmarks'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
SELECT 
  'Columns correct',
  CASE WHEN (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_event_bookmarks'
    AND column_name IN ('id', 'user_id', 'market_day_id', 'intent_type', 'created_at')
  ) = 5 THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
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
SELECT 
  'Indexes count',
  CASE WHEN (
    SELECT COUNT(*) FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'user_event_bookmarks'
  ) >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_event_bookmarks' 
    AND rowsecurity = true
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected Result:** All checks return ✅ PASS

---

#### After Migration 011 (Event RSVP System)

```sql
-- Comprehensive verification query
SELECT 
  'Table exists' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_event_rsvps'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
SELECT 
  'Columns correct',
  CASE WHEN (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_event_rsvps'
    AND column_name IN ('user_id', 'market_day_id', 'status', 'notes', 'agreed_to_policy', 'attendee_count', 'display_name', 'created_at', 'updated_at')
  ) = 9 THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'Composite PK',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.user_event_rsvps'::regclass 
    AND contype = 'p'
    AND array_length(conkey, 1) = 2
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
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
SELECT 
  'Event counts view',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'event_counts'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_event_rsvps' 
    AND rowsecurity = true
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected Result:** All checks return ✅ PASS

---

#### After Migration 012 (Business Hub)

```sql
-- Comprehensive verification query
SELECT 
  'Businesses table exists' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'businesses'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
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
SELECT 
  'Vendors have business_id',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vendors' 
    AND column_name = 'business_id'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'businesses' 
    AND rowsecurity = true
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected Result:** All checks return ✅ PASS

---

#### After Migration 014 (Reviews System)

```sql
-- Comprehensive verification query
SELECT 
  'Reviews table exists' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'reviews'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
SELECT 
  'Helpful votes table',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'review_helpful_votes'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'Review summaries view',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'review_summaries'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'reviews' 
    AND rowsecurity = true
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected Result:** All checks return ✅ PASS

---

#### After Migration 015 (Properties Extension)

```sql
-- Comprehensive verification query
SELECT 
  'Property type column' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'property_type'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
UNION ALL
SELECT 
  'Event space fields',
  CASE WHEN (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties'
    AND column_name IN ('capacity', 'hourly_rate', 'daily_rate', 'business_id')
  ) = 4 THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
  'Property type index',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'properties' 
    AND indexname = 'idx_properties_property_type'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END;
```

**Expected Result:** All checks return ✅ PASS

---

## Phase 3: Runtime Verification

### Start Development Server

```bash
npm run dev
```

**Verification Checklist:**
- [ ] Server starts without errors
- [ ] No schema-related runtime errors
- [ ] No missing environment variable errors
- [ ] No TypeScript compilation errors
- [ ] Server accessible at `http://localhost:3001`

**If any check fails, stop and investigate before proceeding.**

---

## Phase 4: API Functional Verification

### Smoke Test Procedures

**Test Environment:**
- Development server running on port 3001
- Valid authentication token required for authenticated endpoints

#### Test 1: Bookmarks API

**Endpoint:** `POST /api/events/[id]/intent`

```bash
# Replace [id] with actual market_day_id
# Replace [auth-token] with valid auth token
curl -X POST http://localhost:3001/api/events/[id]/intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [auth-token]" \
  -d '{"intent_type": "saved"}'
```

**Expected:** 200 OK with success response

**Endpoint:** `GET /api/events/[id]/intent`

```bash
curl http://localhost:3001/api/events/[id]/intent \
  -H "Authorization: Bearer [auth-token]"
```

**Expected:** 200 OK with intent data or empty array

---

#### Test 2: RSVP API

**Endpoint:** `POST /api/events/[id]/rsvp`

```bash
curl -X POST http://localhost:3001/api/events/[id]/rsvp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [auth-token]" \
  -d '{
    "status": "going",
    "attendee_count": 1,
    "agreed_to_policy": true
  }'
```

**Expected:** 200 OK with RSVP data

**Endpoint:** `GET /api/events/[id]/rsvp`

```bash
curl http://localhost:3001/api/events/[id]/rsvp \
  -H "Authorization: Bearer [auth-token]"
```

**Expected:** 200 OK with RSVP status and counts

---

#### Test 3: Reviews API

**Endpoint:** `POST /api/reviews`

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

## Deployment Log Template

**Use this template to document deployment execution:**

```markdown
## Step 3b: Deployment Execution Log

**Date:** [Date/Time]
**Executed By:** [Name]

### Migration 010: User Event Bookmarks
- **Deployed:** [Date/Time]
- **Status:** ✅ Success / ❌ Failed
- **Verification:** ✅ All checks passed / ❌ Issues found
- **Notes:** [Any observations]

### Migration 011: Event RSVP System
- **Deployed:** [Date/Time]
- **Status:** ✅ Success / ❌ Failed
- **Verification:** ✅ All checks passed / ❌ Issues found
- **Notes:** [Any observations]

### Migration 012: Business Hub
- **Deployed:** [Date/Time]
- **Status:** ✅ Success / ❌ Failed
- **Verification:** ✅ All checks passed / ❌ Issues found
- **Notes:** [Any observations]

### Migration 014: Reviews System
- **Deployed:** [Date/Time]
- **Status:** ✅ Success / ❌ Failed
- **Verification:** ✅ All checks passed / ❌ Issues found
- **Notes:** [Any observations]

### Migration 015: Properties Extension
- **Deployed:** [Date/Time]
- **Status:** ✅ Success / ❌ Failed
- **Verification:** ✅ All checks passed / ❌ Issues found
- **Notes:** [Any observations]

## Schema Verification Summary
- ✅ All tables exist with correct names
- ✅ All foreign keys reference market_days
- ✅ All indexes created
- ✅ All RLS policies enabled

## Runtime Verification Summary
- ✅ Dev server starts cleanly
- ✅ No schema-related errors
- ✅ No missing env variables

## API Functional Verification Summary
- ✅ Bookmarks endpoints functional
- ✅ RSVP endpoints functional
- ✅ Review endpoints functional
```

---

## Definition of Done (Step 3b)

**Step 3b is complete when ALL of the following are verified:**

- [ ] All 5 migrations deployed successfully
- [ ] All schema verification queries pass
- [ ] Dev server starts without errors
- [ ] All API smoke tests pass
- [ ] Deployment log completed
- [ ] No blocking issues identified

**If ANY item is not complete, Step 3b is not complete.**

---

## Next Phase

**After Step 3b is complete and verified:**

**Step 4: Trust & Engagement Feature Wiring**
- Wire Reviews into UI (using confirmed layouts from `UX_LOCK_DECISIONS.md`)
- Wire RSVP into UI (using confirmed layouts)
- Wire Event Spaces into UI (using confirmed layouts)

**Step 4 cannot proceed until Step 3b is complete and all verification checks pass.**

---

## Rollback Reality

### Irreversible Operations

**The following operations in these migrations are logically irreversible:**

1. **Migration 010: Table Rename**
   - `DROP TABLE IF EXISTS public.user_event_intent CASCADE`
   - **Risk:** If old table contains data, it will be permanently deleted
   - **Mitigation:** Migration includes DROP, but no data migration from old to new table
   - **Rollback:** Would require manual recreation of old table structure and data restoration from backup

2. **Migration 011: Table Rename**
   - `DROP TABLE IF EXISTS public.user_event_intents CASCADE`
   - **Risk:** If old table contains data, it will be permanently deleted
   - **Mitigation:** Migration includes DROP, but no data migration from old to new table
   - **Rollback:** Would require manual recreation of old table structure and data restoration from backup

3. **Migration 012: Data Migration**
   - `SELECT migrate_vendors_to_businesses()` function execution
   - **Risk:** Creates business records from vendor data; vendor records are updated with business_id
   - **Mitigation:** Function is idempotent (only processes vendors without business_id)
   - **Rollback:** Would require manual deletion of created business records and NULLing vendor.business_id

4. **Migration 014: Review System Creation**
   - Creates new tables (`reviews`, `review_helpful_votes`)
   - **Risk:** Low - new tables only, no data loss
   - **Rollback:** Can be dropped if needed, but any review data would be lost

5. **Migration 015: Schema Extension**
   - Adds columns to existing `properties` table
   - **Risk:** Low - additive only, no data loss
   - **Rollback:** Columns can be dropped, but any data in new columns would be lost

### Safe Rollback Considerations

**Before deploying, ensure:**
- Database backup is available
- Old table data is backed up (if any exists)
- Rollback procedure is documented and tested (if required)

**If rollback is required:**
- Do not attempt automated rollback
- Restore from backup
- Manually recreate old table structures if needed
- Verify data integrity after rollback

**Senior Engineering Note:**
These migrations perform destructive operations (DROP TABLE) and data transformations. While idempotent and safe for initial deployment, they are not designed for easy rollback. Treat deployment as a one-way operation unless explicit rollback procedures are established and tested.

---

**Status:** ⏳ **PENDING EXECUTION**

**This phase requires manual execution in Supabase SQL Editor. Follow procedures above.**

**Execution Owner:** Human (Manual Only) | **Automation Level:** None | **Step 4 Status:** BLOCKED

