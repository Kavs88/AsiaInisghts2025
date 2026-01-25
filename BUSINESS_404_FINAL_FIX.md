# Business 404 Error - Final Fix Guide

**Status:** Businesses exist (9 found), but 404 error when clicking tiles

---

## ✅ CONFIRMED

- ✅ 9 businesses in database
- ✅ All have slugs (e.g., "the-local-bistro", "artisan-coffee-co")
- ✅ All are active (is_active = true)
- ✅ Code updated with error handling

---

## 🔍 ROOT CAUSE ANALYSIS

**404 = `notFound()` is called = `getBusinessBySlug()` returns `null`**

Most likely causes:
1. **RLS Policy issue** (90% likely) - Policy not allowing public reads
2. **Server client issue** (5% likely) - Supabase client not initialized
3. **Query error** (5% likely) - Database query failing silently

---

## 🛠️ FIX: Run This SQL

**Copy and run this in Supabase SQL Editor:**

```sql
-- Step 1: Check current policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'businesses' AND cmd = 'SELECT';

-- Step 2: Drop conflicting policies
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Public Read Businesses" ON public.businesses;

-- Step 3: Create single clear policy
CREATE POLICY "Public can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = true);

-- Step 4: Verify policy exists
SELECT policyname FROM pg_policies WHERE tablename = 'businesses' AND cmd = 'SELECT';

-- Step 5: Test query (should return 9)
SELECT COUNT(*) FROM public.businesses WHERE is_active = true;
```

**Expected:** Should return 9 businesses

---

## 🧪 TEST QUERY MANUALLY

After running SQL, test if query works:

```sql
-- Test specific business
SELECT * FROM public.businesses 
WHERE slug = 'the-local-bistro' 
AND is_active = true;
```

**Expected:** Returns 1 row  
**If 0 rows:** Check slug spelling (case-sensitive)

---

## 🌐 TEST IN BROWSER

After running SQL fix:

1. **Restart dev server** (if running):
   - Press `Ctrl+C` in terminal
   - Run `npm run dev`

2. **Navigate to businesses:**
   - Go to: `http://localhost:3001/businesses`
   - Should see 9 business tiles

3. **Click a business tile:**
   - Click "The Local Bistro"
   - Should navigate to: `http://localhost:3001/businesses/the-local-bistro`
   - Should **NOT** get 404

---

## 🐛 CHECK SERVER LOGS

When you click a business tile, check the **dev server terminal** for:

```
[getBusinessBySlug] Error fetching business: ...
[getBusinessBySlug] Slug: ...
[getBusinessBySlug] Error code: ...
```

**Error codes:**
- `42501` = Permission denied (RLS blocking) ← **Most likely**
- `PGRST116` = Relation not found
- `PGRST301` = No rows returned

**If you see `42501`:** RLS policy is definitely the issue - run SQL fix above

---

## 📋 ALTERNATIVE: Test Public Access

Run this to test if anonymous users can read:

```sql
-- Test as anonymous user
SET ROLE anon;
SELECT COUNT(*) FROM public.businesses WHERE is_active = true;
RESET ROLE;
```

**If error:** RLS blocking - run SQL fix  
**If returns 9:** RLS should be fine - check other issues

---

## ✅ SUCCESS CRITERIA

After fix:
- ✅ SQL query returns 9 businesses
- ✅ RLS policy exists and shows in `pg_policies`
- ✅ Browser shows business tiles on `/businesses`
- ✅ Clicking tile navigates to `/businesses/[slug]`
- ✅ Business page loads (not 404)
- ✅ No errors in dev server terminal

---

## 🚨 IF STILL NOT WORKING

1. **Check dev server logs** - Share error messages
2. **Test SQL query manually** - Share results
3. **Verify .env.local** - Check Supabase URL/key are correct
4. **Check Network tab** - Look for failed API requests

**Most likely:** RLS policy issue - run the SQL fix above first!





