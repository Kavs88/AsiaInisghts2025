# Migration Hygiene Review - Critical Issues Found

**Date:** January 3, 2026  
**Status:** 🚨 **BLOCKING DEPLOYMENT** - Issues must be resolved first

---

## Executive Summary

**4 Critical Issues Identified:**
1. **Naming Ambiguity**: `user_event_intent` vs `user_event_intents` (singular vs plural)
2. **Duplicate Migration**: Two versions of migration 011 exist
3. **Semantic Overlap**: Two tables tracking similar user-event relationships
4. **Polymorphic Event Reference**: Unclear what `event_id` references

**Recommendation:** Consolidate and clarify before deployment.

---

## Issue 1: Naming Ambiguity (CRITICAL)

### Problem
- **Migration 010** creates: `user_event_intent` (singular)
- **Migration 011** creates: `user_event_intents` (plural)

These names are **too similar** and will cause confusion:
- Developers will mix them up
- Code reviews will be error-prone
- Documentation will be unclear

### Impact
- **Developer Experience**: High confusion risk
- **Code Quality**: Easy to query wrong table
- **Maintenance**: Hard to understand intent

### Proposed Solution
**Option A (Recommended):** Rename for clarity
- `user_event_intent` → `user_event_bookmarks` (favourite/planning)
- `user_event_intents` → `user_event_rsvps` (going/interested/not_going)

**Option B:** Keep but add clear comments
- Add explicit table purpose comments
- Document the distinction clearly

**Recommendation:** Option A - clearer naming prevents future confusion.

---

## Issue 2: Duplicate Migration (CRITICAL)

### Problem
Two versions of migration 011 exist:
- `011_event_rsvp_system.sql` (original)
- `011_event_rsvp_system_fixed.sql` (fixed version)

**Differences:**
1. **Primary Key Structure:**
   - Original: UUID `id` as PK
   - Fixed: Composite `(user_id, market_day_id)` as PK

2. **Unique Index Strategy:**
   - Original: Separate unique indexes for `market_day_id` and `event_id`
   - Fixed: Single composite unique index with WHERE clause

3. **RLS Policies:**
   - Original: Separate SELECT, INSERT, UPDATE, DELETE policies
   - Fixed: Single combined policy with USING + WITH CHECK

### Impact
- **Deployment Risk**: Unclear which version to use
- **Data Integrity**: Different constraint models
- **Rollback Risk**: If wrong version deployed, hard to fix

### Proposed Solution
**Consolidate into single migration:**
1. Use `011_event_rsvp_system_fixed.sql` as base (better PK structure)
2. Add missing elements from original if needed
3. Delete `011_event_rsvp_system.sql` (keep as archive if needed)
4. Rename to `011_event_rsvp_system.sql` (remove "_fixed" suffix)

---

## Issue 3: Semantic Overlap (HIGH PRIORITY)

### Problem
Both tables track user interest in events:

**`user_event_intent` (010):**
- Purpose: Lightweight bookmarks/interests
- Statuses: `favourite`, `planning_to_attend`
- Use case: Discovery page, "My Events" page

**`user_event_intents` (011):**
- Purpose: Formal RSVP with commitment
- Statuses: `going`, `interested`, `not_going`
- Use case: Event detail pages, attendee counts

### Analysis
**Are they redundant?** No, but the distinction is subtle:
- `favourite` vs `interested` - very similar
- `planning_to_attend` vs `going` - similar intent

### Impact
- **User Confusion**: Users might not understand the difference
- **Data Duplication**: Same user might have both
- **UX Complexity**: UI needs to handle both states

### Proposed Solution
**Clarify the distinction in documentation:**

1. **`user_event_bookmarks`** (renamed from `user_event_intent`):
   - **Purpose**: Personal collection, discovery
   - **Statuses**: `saved`, `planning_to_attend`
   - **UX**: Heart icon, "Save for later"
   - **Privacy**: Private to user

2. **`user_event_rsvps`** (renamed from `user_event_intents`):
   - **Purpose**: Public commitment, event planning
   - **Statuses**: `going`, `interested`, `not_going`
   - **UX**: RSVP button, attendee count
   - **Privacy**: Counts are public, details private

**Recommendation:** Keep both but make distinction clear in:
- Table comments
- API documentation
- UI labels

---

## Issue 4: Polymorphic Event Reference (MEDIUM PRIORITY)

### Problem
Both migrations use `event_id` without foreign key constraints:

**Migration 010:**
```sql
event_id UUID NOT NULL,  -- No FK, no comment about what it references
```

**Migration 011:**
```sql
event_id UUID,  -- Polymorphic: can reference events or market_days
market_day_id UUID REFERENCES public.market_days(id) ON DELETE CASCADE,
```

### Analysis
**What does `event_id` reference?**
- Could be `events.id` (from migration 006)
- Could be `market_days.id` (primary event system)
- Could be both (polymorphic)

**Current State:**
- `market_days` is the primary event system (Sunday markets)
- `events` table exists but is **unused** (per PROJECT_CURRENT_STATE_ASSESSMENT.md)

### Impact
- **Data Integrity**: No FK means invalid IDs possible
- **Query Complexity**: Need to check both tables
- **Future Confusion**: If `events` table is used later, unclear which is which

### Proposed Solution
**Option A (Recommended):** Standardize on `market_day_id`
- Remove `event_id` from both tables
- Use `market_day_id` only (matches primary event system)
- If `events` table is needed later, add separate migration

**Option B:** Keep polymorphic but add constraints
- Add CHECK constraint ensuring one is NOT NULL
- Add comments explaining the polymorphism
- Document which table takes precedence

**Recommendation:** Option A - simpler, matches current architecture.

---

## Issue 5: Migration 012 - Data Quality Risk (MEDIUM PRIORITY)

### Problem
Migration 012 migrates vendors to businesses with **placeholder data**:

```sql
'Da Nang, Vietnam', -- Fix for NOT NULL
COALESCE(v_record.contact_phone, 'No Phone'), -- Fix for NOT NULL
```

### Impact
- **Data Quality**: Fake addresses and phone numbers in production
- **UX Risk**: Users see "No Phone" or placeholder addresses
- **Trust Risk**: Looks unprofessional

### Proposed Solution
**Before running migration:**
1. Update vendor records with real addresses/phones
2. Or make address/phone nullable in businesses table
3. Or skip migration for vendors without complete data

**Recommendation:** Fix data quality before migration, or make fields nullable.

---

## Issue 6: Migration 013 - Minor (LOW PRIORITY)

### Status
✅ **Clean** - No issues found

Simple schema extension, well-structured.

---

## Consolidated Recommendations

### Priority 1: Before Deployment (BLOCKING)

1. **Rename Tables for Clarity:**
   ```sql
   -- In 010:
   user_event_intent → user_event_bookmarks
   
   -- In 011:
   user_event_intents → user_event_rsvps
   ```

2. **Consolidate Migration 011:**
   - Use `011_event_rsvp_system_fixed.sql` as base
   - Remove duplicate `011_event_rsvp_system.sql`
   - Rename to `011_event_rsvp_system.sql`

3. **Standardize Event Reference:**
   - Remove `event_id` from both tables
   - Use `market_day_id` only
   - Add FK constraint to `market_days`

4. **Fix Migration 012 Data Quality:**
   - Update vendor data before migration
   - Or make address/phone nullable

### Priority 2: Documentation (REQUIRED)

1. **Add Table Comments:**
   ```sql
   COMMENT ON TABLE user_event_bookmarks IS 
   'User bookmarks and planning list (private, for discovery)';
   
   COMMENT ON TABLE user_event_rsvps IS 
   'User RSVP commitments (public counts, private details)';
   ```

2. **Update API Documentation:**
   - Document when to use bookmarks vs RSVPs
   - Explain the UX distinction

3. **Update TypeScript Types:**
   - Rename types to match new table names
   - Add JSDoc comments explaining purpose

### Priority 3: Code Updates (REQUIRED)

1. **Update All Queries:**
   - Find all references to old table names
   - Update to new names
   - Update TypeScript types

2. **Update API Routes:**
   - `/api/discovery` - use `user_event_bookmarks`
   - `/api/my-events` - use `user_event_bookmarks`
   - `/api/events/[id]/rsvp` - use `user_event_rsvps`

3. **Update Components:**
   - `EventIntentButtons` - use bookmarks
   - `RSVPAction` - use RSVPs
   - Update prop names and comments

---

## Proposed Migration Sequence

### Step 1: Create Cleaned Migrations

**010_user_event_bookmarks.sql** (renamed, cleaned)
- Table: `user_event_bookmarks`
- Remove `event_id`, use `market_day_id` only
- Add FK constraint
- Add table comment

**011_event_rsvp_system.sql** (consolidated, cleaned)
- Table: `user_event_rsvps`
- Remove `event_id`, use `market_day_id` only
- Use composite PK from "_fixed" version
- Add table comment
- Remove duplicate file

**012_activate_business_hub.sql** (data quality fix)
- Add data validation before migration
- Or make address/phone nullable

**013_enhance_businesses_schema.sql**
- ✅ No changes needed

### Step 2: Update Codebase

1. Update TypeScript types
2. Update API routes
3. Update components
4. Update queries

### Step 3: Deploy

1. Deploy cleaned migrations in order
2. Verify tables created
3. Test API endpoints
4. Test UI components

---

## Quality Bar Checklist

Before deployment, confirm:

- [ ] Table names are clear and distinct
- [ ] No duplicate migrations
- [ ] Event references are unambiguous
- [ ] Data quality is acceptable (no placeholders)
- [ ] Table comments explain purpose
- [ ] TypeScript types updated
- [ ] API routes updated
- [ ] Components updated
- [ ] Documentation updated

---

## Next Steps

1. **Review this report** - Confirm recommendations
2. **Create cleaned migrations** - Apply fixes
3. **Update codebase** - Rename references
4. **Test locally** - Verify changes
5. **Deploy to Supabase** - Run migrations
6. **Verify deployment** - Check tables and constraints

---

**Status:** ⛔ **DO NOT DEPLOY** until these issues are resolved.



