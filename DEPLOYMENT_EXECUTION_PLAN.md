# Deployment Execution Plan - Phase 4 Features

**Date:** December 30, 2025  
**Objective:** Deploy Phase 4 features (Discovery, My Events, RSVP) to production

---

## PREREQUISITES CHECKLIST

Before starting, verify:
- [ ] Supabase project is accessible
- [ ] You have SQL Editor access in Supabase Dashboard
- [ ] Node.js and npm are installed
- [ ] `.env.local` has correct Supabase credentials

---

## STEP 1: DATABASE MIGRATIONS (15 minutes)

### Migration 1: Attendee Intent & Offers

**File:** `supabase/migrations/010_attendee_intent_and_offers.sql`

**What it does:**
- Creates `user_event_intent` table (favourite, planning_to_attend)
- Adds `event_id` column to `deals` table
- Updates user roles (business_user, attendee_user)
- Creates RLS policies and indexes

**Action:**
1. Open Supabase Dashboard → SQL Editor
2. Open file: `supabase/migrations/010_attendee_intent_and_offers.sql`
3. Copy entire contents
4. Paste in SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Verify: Should see "Success. No rows returned"

**Verification Query:**
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'user_event_intent';

-- Check deals.event_id column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'deals' AND column_name = 'event_id';
```

**Expected:** Both queries return results ✅

---

### Migration 2: RSVP System

**File:** `supabase/migrations/011_event_rsvp_system_fixed.sql`

**What it does:**
- Creates `user_event_intents` table (going, interested, not_going)
- Creates `event_counts` view (public aggregated counts)
- Creates RLS policies and indexes
- **Note:** This will DROP and recreate the table if it exists

**Action:**
1. In Supabase Dashboard → SQL Editor (same session or new)
2. Open file: `supabase/migrations/011_event_rsvp_system_fixed.sql`
3. Copy entire contents
4. Paste in SQL Editor
5. Click **Run**
6. Verify: Should see "Success. No rows returned"

**Verification Query:**
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'user_event_intents';

-- Check view exists
SELECT table_name FROM information_schema.views 
WHERE table_name = 'event_counts';

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'user_event_intents';
```

**Expected:** 
- Table exists ✅
- View exists ✅
- RLS enabled (rowsecurity = true) ✅

---

## STEP 2: BUILD APPLICATION (5 minutes)

### Clean Build Directory

**Windows PowerShell:**
```powershell
cd "C:\Users\admin\Sunday Market Project"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

**Mac/Linux:**
```bash
cd /path/to/project
rm -rf .next
```

### Run Build

```bash
npm run build
```

**Expected Output:**
- TypeScript compilation
- Next.js optimization
- Asset generation
- "✓ Compiled successfully" message

**Verify Build:**
- Check `.next` directory exists
- Check `.next/app/markets/discovery/page.js` exists
- Check `.next/app/markets/my-events/page.js` exists
- Check `.next/static` directory has CSS/JS files

**If Build Fails:**
- Check for TypeScript errors
- Check for missing dependencies: `npm install`
- Check console output for specific errors

---

## STEP 3: START DEV SERVER (1 minute)

```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3001
  - Ready in Xs
```

**Keep this running** for testing.

---

## STEP 4: TEST PHASE 4 FEATURES (15 minutes)

### Test 1: Discovery Page

**URL:** `http://localhost:3001/markets/discovery`

**Checks:**
- [ ] Page loads without 404
- [ ] No console errors
- [ ] Styles are applied (not unstyled shell)
- [ ] "This Week" section displays
- [ ] "Next Week" section displays
- [ ] Event cards render (if events exist)
- [ ] Filters work (if authenticated)
- [ ] EventIntentButtons render (if authenticated)

**Expected:** Page loads and displays events

---

### Test 2: My Events Page

**URL:** `http://localhost:3001/markets/my-events`

**Unauthenticated:**
- [ ] Shows sign-in prompt
- [ ] No console errors
- [ ] Styles applied

**Authenticated:**
- [ ] Page loads
- [ ] Filter tabs display (All/Saved/Planning)
- [ ] Events display (if user has intents)
- [ ] Empty state displays (if no events)
- [ ] No console errors

---

### Test 3: Market Day Detail with RSVP

**URL:** `http://localhost:3001/markets/market-days/[id]`

Replace `[id]` with actual market day ID from your database.

**Checks:**
- [ ] Page loads
- [ ] EventHero displays
- [ ] EventUtilityBar displays (3 columns)
- [ ] RSVPAction component displays (sidebar desktop, bottom bar mobile)
- [ ] Can open RSVPModal
- [ ] Can submit RSVP (if authenticated)
- [ ] Counts update after RSVP
- [ ] No console errors

---

### Test 4: API Endpoints

**Test Discovery API:**
```bash
curl http://localhost:3001/api/discovery
```

**Expected:** JSON response with `thisWeek` and `nextWeek` arrays

**Test My Events API (requires auth):**
- Open browser DevTools → Console
- Navigate to: `http://localhost:3001/api/my-events`
- Should return JSON with events array (or 401 if not authenticated)

**Test RSVP API:**
- Use browser DevTools Console (after login)
- Test POST to `/api/events/rsvp`
- Test GET to `/api/events/[id]/rsvp`

---

## STEP 5: VERIFICATION CHECKLIST

### Database ✅
- [ ] `user_event_intent` table exists
- [ ] `user_event_intents` table exists
- [ ] `event_counts` view exists
- [ ] RLS policies active
- [ ] All verification queries pass

### Build ✅
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Assets generated in `.next`
- [ ] CSS/JS files exist

### Pages ✅
- [ ] `/markets/discovery` loads
- [ ] `/markets/my-events` loads
- [ ] `/markets/market-days/[id]` loads (RSVP)
- [ ] All pages styled (not unstyled shells)
- [ ] No 404 errors

### API ✅
- [ ] `/api/discovery` returns data
- [ ] `/api/my-events` works (authenticated)
- [ ] `/api/events/rsvp` works (authenticated)
- [ ] `/api/events/[id]/rsvp` works
- [ ] No database errors in responses

### Functionality ✅
- [ ] Discovery page filters work
- [ ] EventIntentButtons toggle
- [ ] RSVP modal opens/closes
- [ ] RSVP submission works
- [ ] Counts update correctly

---

## TROUBLESHOOTING

### Issue: SQL Migration Fails

**Error:** "relation already exists"
- **Solution:** Check if table already exists, drop it first, or modify migration to use `CREATE TABLE IF NOT EXISTS`

**Error:** "permission denied"
- **Solution:** Ensure you're using the correct Supabase project and have admin access

**Error:** "syntax error"
- **Solution:** Check SQL syntax, ensure all quotes are properly closed

---

### Issue: Build Fails

**Error:** "Missing script: build"
- **Solution:** Check `package.json` has build script, run `npm install` if needed

**Error:** TypeScript errors
- **Solution:** Fix TypeScript errors shown in console, check imports

**Error:** Module not found
- **Solution:** Run `npm install` to ensure all dependencies are installed

---

### Issue: Pages 404

**Check:**
1. Build succeeded (`.next` directory exists)
2. Dev server is running
3. Routes exist in filesystem
4. Check browser console for errors

**Solution:** Restart dev server, clear browser cache

---

### Issue: Pages Unstyled

**Check:**
1. `.next/static/css` directory exists
2. CSS files are generated
3. Browser DevTools → Network tab shows CSS loading
4. No 404 errors for CSS files

**Solution:** Rebuild, clear browser cache, check Next.js config

---

### Issue: API Returns 500

**Check:**
1. Database tables exist (run verification queries)
2. RLS policies are correct
3. Check server logs for specific error
4. Check browser console for error messages

**Solution:** Verify database migrations, check RLS policies, review API route code

---

## SUCCESS CRITERIA

✅ All database migrations executed successfully  
✅ Build completes without errors  
✅ All pages load without 404  
✅ All pages render with styles  
✅ API endpoints return correct data  
✅ RSVP functionality works  
✅ No console errors  

---

## NEXT STEPS AFTER DEPLOYMENT

Once Phase 4 is deployed and working:

1. **Properties Integration** (separate task)
   - Design Property → Market Day linkage
   - Implement rental booking system

2. **Testing & QA**
   - Comprehensive browser testing
   - Test all user flows
   - Performance testing

3. **Production Deployment**
   - Deploy to Vercel/production
   - Configure production environment variables
   - Set up monitoring

---

**Execution Plan Complete.** Follow steps above to deploy Phase 4 features.





