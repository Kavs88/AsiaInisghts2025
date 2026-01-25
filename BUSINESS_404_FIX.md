# Business Profile 404 Error - Fix

**Issue:** Getting 404 when clicking business tiles

---

## 🔍 ROOT CAUSE

404 error means `notFound()` is being called, which happens when:
- `getBusinessBySlug(slug)` returns `null`
- Query fails or no business found with that slug

---

## 🛠️ DIAGNOSTIC STEPS

### Step 1: Check if Businesses Exist

Run in Supabase SQL Editor:

```sql
-- Check if businesses table has data
SELECT COUNT(*) as count FROM public.businesses;

-- If 0, you need to create businesses or run migration 012
```

**If count is 0:** No businesses exist - need to create data

---

### Step 2: Check if Businesses Have Slugs

```sql
SELECT id, name, slug, is_active 
FROM public.businesses 
LIMIT 10;
```

**Check:**
- Do slugs exist? (not null)
- Are slugs formatted correctly?
- Are businesses active? (is_active = true)

---

### Step 3: Test Query Manually

```sql
-- Get a slug from Step 2, then test:
SELECT * FROM public.businesses 
WHERE slug = 'your-slug-here' 
AND is_active = true;
```

**Should return:** One row

**If returns 0 rows:**
- Slug doesn't match
- Business is inactive
- Business doesn't exist

---

### Step 4: Check RLS Policies

```sql
-- Check if public can read businesses
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'businesses' AND cmd = 'SELECT';
```

**Should have:** At least one SELECT policy allowing public/authenticated users

**If missing, add:**
```sql
CREATE POLICY "Public can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = true);
```

---

## 🔧 MOST COMMON FIXES

### Fix 1: Ensure RLS Policy Exists

If businesses exist but query fails due to RLS:

```sql
-- Check existing policies
SELECT policyname FROM pg_policies WHERE tablename = 'businesses';

-- If no SELECT policy for public, create one:
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
CREATE POLICY "Public can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = true);
```

---

### Fix 2: Remove is_active Filter (If Needed)

If you want to show inactive businesses too, temporarily remove the filter:

In `actions/businesses.ts`, change:
```typescript
.eq('is_active', true)
```
to:
```typescript
// .eq('is_active', true)  // Commented out temporarily
```

---

### Fix 3: Add Better Error Handling

Already done in latest code, but verify the function handles errors gracefully.

---

## 🎯 QUICK TEST

### Test 1: Direct URL Test

1. Get a business slug from database:
```sql
SELECT slug FROM public.businesses LIMIT 1;
```

2. Manually navigate to:
```
http://localhost:3001/businesses/[slug-from-query]
```

3. Check:
- Does it load? (query works)
- 404? (query returns null)

---

### Test 2: Check Server Logs

Look at dev server terminal output when clicking a tile:
- Any error messages?
- Database errors?
- Console.error messages?

---

## 📋 MOST LIKELY ISSUES

1. **No businesses in database** (50% chance)
   - Solution: Create test business or run migration 012

2. **RLS policy blocking** (30% chance)
   - Solution: Add public SELECT policy

3. **Slug mismatch** (15% chance)
   - Solution: Check slug format, case sensitivity

4. **Business inactive** (5% chance)
   - Solution: Check is_active = true, or remove filter

---

## ✅ IMMEDIATE ACTION

**Run this diagnostic query first:**

```sql
SELECT 
  'Businesses count' as check_item,
  COUNT(*) as value
FROM public.businesses
UNION ALL
SELECT 
  'Active businesses',
  COUNT(*) 
FROM public.businesses WHERE is_active = true
UNION ALL
SELECT 
  'Businesses with slugs',
  COUNT(*) 
FROM public.businesses WHERE slug IS NOT NULL AND slug != '';
```

**Expected:** All counts > 0

**If all are 0:** Need to create businesses or run migration 012

---

**Next Step:** Run diagnostic queries and share results!





