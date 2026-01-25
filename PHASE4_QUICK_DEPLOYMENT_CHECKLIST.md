# Phase 4: Quick Deployment Checklist

**Quick Reference for Phase 4 Deployment**

---

## ✅ PRE-FLIGHT CHECKLIST

- [ ] Node.js installed (v22.20.0 ✓)
- [ ] npm installed (v10.9.3 ✓)
- [ ] Supabase project access
- [ ] Environment variables configured

---

## 🗄️ DATABASE DEPLOYMENT (15 min)

### Step 1: Run Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of: `supabase/migrations/010_attendee_intent_and_offers.sql`
3. Paste and Run
4. Verify: "Success. No rows returned"

### Step 2: Quick Verification

Run this query in SQL Editor:

```sql
SELECT 
  'Table exists' AS check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_event_intent'
  ) THEN '✅' ELSE '❌' END AS status
UNION ALL
SELECT 'RLS enabled',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'user_event_intent' AND rowsecurity = true
  ) THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Policies (3)',
  CASE WHEN (
    SELECT COUNT(*) FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_event_intent'
  ) = 3 THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Indexes (5+)',
  CASE WHEN (
    SELECT COUNT(*) FROM pg_indexes 
    WHERE schemaname = 'public' AND tablename = 'user_event_intent'
  ) >= 5 THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Deals event_id',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'deals' AND column_name = 'event_id'
  ) THEN '✅' ELSE '❌' END;
```

**Expected:** All ✅

---

## 🏗️ BUILD (5 min)

### Commands

```bash
# Clean build
rm -rf .next  # or: Remove-Item -Recurse -Force .next (PowerShell)

# Build
npm run build

# Verify
ls .next/app/markets/discovery/page.js  # Should exist
ls .next/app/markets/my-events/page.js  # Should exist
```

**Expected:** Build completes with "✓ Compiled successfully"

---

## 🧪 API TESTING (15 min)

### Start Server

```bash
npm run dev
```

### Test Endpoints

1. **Discovery (Unauthenticated):**
   ```
   http://localhost:3001/api/discovery
   ```
   Expected: JSON with `thisWeek` and `nextWeek` arrays

2. **My Events (Authenticated):**
   ```
   http://localhost:3001/api/my-events
   ```
   Expected: JSON with `events` array (or 401 if not authenticated)

3. **Intent Toggle:**
   ```javascript
   // In browser console (after login)
   fetch('/api/events/[event-id]/intent', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({intent_type: 'favourite'})
   }).then(r => r.json()).then(console.log)
   ```
   Expected: `{success: true, action: 'added'}`

---

## 🌐 BROWSER TESTING (30 min)

### Pages to Test

1. **Discovery:** `http://localhost:3001/markets/discovery`
   - [ ] Loads without 404
   - [ ] No console errors
   - [ ] Filters work
   - [ ] Event cards render
   - [ ] Buttons toggle

2. **My Events:** `http://localhost:3001/markets/my-events`
   - [ ] Loads without 404
   - [ ] Shows sign-in prompt (if not authenticated)
   - [ ] Shows events (if authenticated)
   - [ ] Filters work

3. **Navigation:**
   - [ ] Header links work
   - [ ] MegaMenu links work
   - [ ] Account menu links work

---

## 📋 FINAL CHECKLIST

### Database
- [ ] Migration deployed
- [ ] All verification queries pass
- [ ] RLS policies active

### Build
- [ ] Build completes successfully
- [ ] All pages compiled
- [ ] All assets generated

### API
- [ ] All endpoints return correct data
- [ ] No database errors
- [ ] Authentication works

### Browser
- [ ] All pages load
- [ ] No console errors
- [ ] All interactions work
- [ ] Responsive design works

---

**Total Time:** ~1 hour

**Status:** Ready for deployment ✅





