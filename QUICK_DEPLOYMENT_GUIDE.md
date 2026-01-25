# Quick Deployment Guide - Phase 4

**Quick Reference for Deploying Phase 4 Features**

---

## ⚡ QUICK STEPS (30 minutes total)

### 1. Database (15 min)

**Supabase Dashboard → SQL Editor:**

**Run Migration 1:**
```sql
-- Copy contents of: supabase/migrations/010_attendee_intent_and_offers.sql
-- Paste and Run
```

**Run Migration 2:**
```sql
-- Copy contents of: supabase/migrations/011_event_rsvp_system_fixed.sql
-- Paste and Run
```

**Quick Verify:**
```sql
SELECT 'user_event_intent' as table_name WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_event_intent')
UNION ALL
SELECT 'user_event_intents' WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_event_intents')
UNION ALL
SELECT 'event_counts' WHERE EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'event_counts');
```

**Expected:** 3 rows returned ✅

---

### 2. Build (5 min)

```bash
# Clean
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Build
npm run build

# Verify
Test-Path .next\app\markets\discovery\page.js
```

**Expected:** Build succeeds, `.next` directory created ✅

---

### 3. Test (10 min)

```bash
# Start dev server
npm run dev
```

**Test in Browser:**
- `http://localhost:3001/markets/discovery` ✅
- `http://localhost:3001/markets/my-events` ✅
- `http://localhost:3001/markets/market-days/[id]` ✅

**Check:**
- Pages load (no 404)
- Styles applied
- No console errors
- RSVP works (if authenticated)

---

## ✅ SUCCESS INDICATORS

- Database tables exist
- Build completes
- Pages load with styles
- No 404 errors
- No console errors
- RSVP functionality works

---

**Quick Guide Complete.** See `DEPLOYMENT_EXECUTION_PLAN.md` for detailed steps.





