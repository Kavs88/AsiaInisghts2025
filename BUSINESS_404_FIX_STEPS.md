# Business 404 Fix - Step by Step

**Status:** Businesses exist, but queries return null → 404

---

## ✅ CONFIRMED

- ✅ Businesses exist (9 businesses found)
- ✅ All have slugs
- ✅ All are active (is_active = true)
- ✅ Code updated with better error handling

---

## 🔍 MOST LIKELY ISSUE: RLS Policy

Since businesses exist but queries return null, **RLS policy is likely blocking access**.

---

## 🛠️ FIX: Verify/Create RLS Policy

### Step 1: Check Current Policies

Run in Supabase SQL Editor:

```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'businesses' AND cmd = 'SELECT';
```

**Expected:** Should see at least one SELECT policy  
**If empty:** Need to create policy

---

### Step 2: Test Query as Public User

```sql
-- Test if anonymous user can read
SET ROLE anon;
SELECT COUNT(*) FROM public.businesses WHERE is_active = true;
RESET ROLE;
```

**If error:** RLS is blocking - need to fix policy  
**If returns count:** RLS should be fine, check other issues

---

### Step 3: Create/Fix RLS Policy

Run this SQL:

```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Public Read Businesses" ON public.businesses;

-- Create public read policy
CREATE POLICY "Public can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = true);

-- Verify
SELECT policyname FROM pg_policies WHERE tablename = 'businesses';
```

---

### Step 4: Test Query Manually

```sql
-- Test with actual slug
SELECT * FROM public.businesses 
WHERE slug = 'the-local-bistro' 
AND is_active = true;
```

**Expected:** Returns 1 row  
**If 0 rows:** Check if slug matches exactly (case-sensitive)

---

### Step 5: Test in Browser

After fixing RLS:
1. Restart dev server (if running)
2. Navigate to: `http://localhost:3001/businesses`
3. Click on "The Local Bistro" tile
4. Should navigate to: `http://localhost:3001/businesses/the-local-bistro`
5. Should load (not 404)

---

## 🔧 ALTERNATIVE: Check Server Logs

When you click a business tile, check the dev server terminal for:

```
[getBusinessBySlug] Error fetching business: ...
[getBusinessBySlug] Slug: ...
[getBusinessBySlug] Error code: ...
```

**Common error codes:**
- `42501` = Permission denied (RLS blocking)
- `PGRST116` = Relation not found
- `PGRST301` = No rows returned (but should be null, not 404)

---

## 📋 QUICK TEST

**Run this complete diagnostic:**

```sql
-- 1. Check businesses exist
SELECT COUNT(*) FROM public.businesses WHERE is_active = true;

-- 2. Check RLS policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'businesses';

-- 3. Test public access
SET ROLE anon;
SELECT COUNT(*) FROM public.businesses WHERE is_active = true;
RESET ROLE;

-- 4. Test specific query
SELECT * FROM public.businesses WHERE slug = 'the-local-bistro';
```

**Share results** and I'll provide the exact fix!

---

## 🎯 MOST LIKELY FIX

**90% chance it's RLS policy missing.** Run Step 3 above to fix it.





