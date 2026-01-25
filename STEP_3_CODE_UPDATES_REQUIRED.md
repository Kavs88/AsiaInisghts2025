# Step 3: Code Updates (Historical Reference)

**Date:** January 3, 2026  
**Status:** ✅ **COMPLETE** - Code updates have been completed (verified via repository inspection)  
**Purpose:** Historical reference for code updates that were required before migration deployment

**Note:** This document serves as a historical reference. All code updates listed below have been completed as part of Step 3a. For current status, see `STEP_3A_PRE_DEPLOYMENT_COMPLETE.md`.

---

## ✅ Code Updates Completed

**Status:** All code updates have been completed and verified.

**Verification:**
- ✅ API routes updated to use new table names (verified via code inspection)
- ✅ No old table name references found in codebase
- ✅ Column references updated to `market_day_id` where applicable

**These updates were REQUIRED before migration deployment (now complete).**

The API routes previously referenced old table names:
- `user_event_intent` → changed to `user_event_bookmarks` ✅
- `user_event_intents` → changed to `user_event_rsvps` ✅
- `event_id` → changed to `market_day_id` (where applicable) ✅

---

## Files That Need Updates

### 1. `app/api/events/[id]/intent/route.ts`

**Changes Required:**
- Replace `user_event_intent` with `user_event_bookmarks`
- Replace `event_id` with `market_day_id`
- Update `intent_type` values: `'favourite'` → `'saved'`

**Current Code Issues:**
- Line 30: `.from('user_event_intent')` → `.from('user_event_bookmarks')`
- Line 33: `.eq('event_id', eventId)` → `.eq('market_day_id', eventId)`
- Line 40: `.from('user_event_intent')` → `.from('user_event_bookmarks')`
- Line 54: `.from('user_event_intent')` → `.from('user_event_bookmarks')`
- Line 57: `event_id: eventId` → `market_day_id: eventId`
- Line 97: `.from('user_event_intent')` → `.from('user_event_bookmarks')`
- Line 100: `.eq('event_id', eventId)` → `.eq('market_day_id', eventId)`
- Line 22: `'favourite'` → `'saved'` (in validation)

---

### 2. `app/api/discovery/route.ts`

**Changes Required:**
- Replace `user_event_intent` with `user_event_bookmarks`
- Replace `event_id` with `market_day_id`
- Update `intent_type` values: `'favourite'` → `'saved'`

**Current Code Issues:**
- Line 37: `.from('user_event_intent')` → `.from('user_event_bookmarks')`
- Line 38: `'event_id, intent_type'` → `'market_day_id, intent_type'`
- Line 42: `'favourite'` → `'saved'`
- Line 49-50: `intent.event_id` → `intent.market_day_id`

---

### 3. `app/api/my-events/route.ts`

**Changes Required:**
- Replace `user_event_intent` with `user_event_bookmarks`
- Replace `event_id` with `market_day_id`
- Update `intent_type` values: `'favourite'` → `'saved'`

**Current Code Issues:**
- Line 22: `.from('user_event_intent')` → `.from('user_event_bookmarks')`
- Check for `event_id` references → change to `market_day_id`

---

### 4. `app/api/events/[id]/rsvp/route.ts`

**Changes Required:**
- Replace `user_event_intents` with `user_event_rsvps`
- Replace `event_id` with `market_day_id` (remove polymorphic support)

**Current Code Issues:**
- Line 39: `.from('user_event_intents')` → `.from('user_event_rsvps')`
- Line 46: `.eq('event_id', eventId)` → Remove (only use `market_day_id`)
- Line 30: `event_id` in view query → `market_day_id`

---

### 5. `app/api/events/rsvp/route.ts`

**Changes Required:**
- Replace `user_event_intents` with `user_event_rsvps`
- Replace `event_id` with `market_day_id` (remove polymorphic support)

**Current Code Issues:**
- Line 34: `.from('user_event_intents')` → `.from('user_event_rsvps')`
- Line 64: `.from('user_event_intents')` → `.from('user_event_rsvps')`
- Line 75: `.from('user_event_intents')` → `.from('user_event_rsvps')`
- Line 110: `.from('user_event_intents')` → `.from('user_event_rsvps')`
- All `event_id` references → `market_day_id`

---

## Update Checklist

Before deploying migrations:

- [ ] Update `app/api/events/[id]/intent/route.ts`
- [ ] Update `app/api/discovery/route.ts`
- [ ] Update `app/api/my-events/route.ts`
- [ ] Update `app/api/events/[id]/rsvp/route.ts`
- [ ] Update `app/api/events/rsvp/route.ts`
- [ ] Test TypeScript compilation: `npx tsc --noEmit`
- [ ] Verify no old table name references remain

---

## Search & Replace Guide

**Find and Replace:**
1. `user_event_intent` → `user_event_bookmarks` (all occurrences)
2. `user_event_intents` → `user_event_rsvps` (all occurrences)
3. `event_id` → `market_day_id` (in queries for these tables)
4. `'favourite'` → `'saved'` (in intent_type validations)

**Note:** Be careful with `event_id` - only replace in context of these tables. Other `event_id` references (like in `deals` table) should remain.

---

## Verification

After updates, verify:

```bash
# Check for old table names
grep -r "user_event_intent" app/api --exclude-dir=node_modules
grep -r "user_event_intents" app/api --exclude-dir=node_modules

# Should return no results (or only in comments)
```

```bash
# Check TypeScript compiles
npx tsc --noEmit

# Should return no errors
```

---

## Important Notes

1. **These updates are REQUIRED** - migrations won't work without them
2. **These are NOT UI changes** - they're technical requirements
3. **Update BEFORE deploying migrations** - or APIs will fail
4. **Test after updates** - ensure TypeScript compiles

---

**Status:** ✅ **COMPLETE** - All code updates have been completed. Prepared for migration deployment (Step 3b).

**Execution Owner:** Human (Manual Only) | **Automation Level:** None | **Step 4 Status:** BLOCKED

**Note:** This document is a historical reference. For current deployment status, see `STEP_3A_PRE_DEPLOYMENT_COMPLETE.md` and `STEP_3B_DEPLOYMENT_EXECUTION.md`.

