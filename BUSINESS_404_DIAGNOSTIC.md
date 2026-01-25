# Business 404 Error - Diagnostic Guide

**Status:** Getting 404 when clicking business tiles

---

## 🎯 IMMEDIATE DIAGNOSTIC QUERIES

Run these in Supabase SQL Editor to identify the issue:

### Query 1: Do businesses exist?
```sql
SELECT COUNT(*) as total_businesses FROM public.businesses;
```

**Expected:** > 0  
**If 0:** Need to create businesses or run migration 012

---

### Query 2: Do businesses have slugs?
```sql
SELECT 
  id, 
  name, 
  slug, 
  is_active,
  CASE WHEN slug IS NULL OR slug = '' THEN '❌ No slug' ELSE '✅ Has slug' END as slug_status
FROM public.businesses 
LIMIT 10;
```

**Check:**
- All should have slugs (not null, not empty)
- Note which slugs exist

---

### Query 3: Can query find business by slug?
```sql
-- Replace 'test-slug' with actual slug from Query 2
SELECT * FROM public.businesses 
WHERE slug = 'test-slug';
```

**Expected:** Returns 1 row  
**If 0 rows:** Slug doesn't exist or doesn't match

---

### Query 4: RLS Policy Check
```sql
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%is_active%' THEN '✅ Filters by active'
    WHEN qual LIKE '%true%' OR qual IS NULL THEN '✅ Allows all or simple'
    ELSE '⚠️ Check policy'
  END as policy_status
FROM pg_policies 
WHERE tablename = 'businesses' AND cmd = 'SELECT';
```

**Expected:** At least one SELECT policy  
**If none:** Need to create policy

---

### Query 5: Test Public Access
```sql
-- Test as anonymous user (simulates public access)
SET ROLE anon;
SELECT COUNT(*) FROM public.businesses WHERE is_active = true;
RESET ROLE;
```

**Expected:** Returns count (not error)  
**If error:** RLS blocking - need to fix policy

---

## 🔧 QUICK FIXES

### Fix 1: Create Public RLS Policy (If Missing)

```sql
-- Check if policy exists
SELECT policyname FROM pg_policies 
WHERE tablename = 'businesses' 
AND policyname = 'Public can view active businesses';

-- If it doesn't exist, create it:
CREATE POLICY "Public can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = true);
```

---

### Fix 2: Remove is_active Filter (Temporarily)

If all businesses are inactive, temporarily remove the filter:

```sql
-- In actions/businesses.ts, I've already added a fallback
-- But you can also check if any businesses are active:
SELECT COUNT(*) FROM public.businesses WHERE is_active = true;
SELECT COUNT(*) FROM public.businesses WHERE is_active = false;
```

---

### Fix 3: Create Test Business (If None Exist)

```sql
-- Create a test business
INSERT INTO public.businesses (
  owner_id,
  name,
  slug,
  category,
  address,
  contact_phone,
  is_active
) VALUES (
  (SELECT id FROM public.users LIMIT 1), -- Use any existing user
  'Test Business',
  'test-business',
  'service',
  '123 Test Street',
  '0123456789',
  true
);

-- Verify it was created
SELECT * FROM public.businesses WHERE slug = 'test-business';
```

---

## 🐛 DEBUGGING IN CODE

### Check Server Logs

When you click a business tile, check the dev server terminal for:
- `[getBusinessBySlug]` error messages
- Database error codes
- Slug values

### Add Temporary Debugging

In `app/businesses/[slug]/page.tsx`, temporarily add:

```typescript
export default async function BusinessProfilePage({
    params
}: {
    params: { slug: string }
}) {
    console.log('[BusinessProfilePage] Slug:', params.slug)
    const business = await getBusinessBySlug(params.slug)
    console.log('[BusinessProfilePage] Business:', business ? 'Found' : 'Not Found')

    if (!business) {
        console.error('[BusinessProfilePage] Business not found for slug:', params.slug)
        notFound()
    }
    // ... rest of code
}
```

---

## 📊 MOST LIKELY SCENARIOS

### Scenario 1: No Businesses in Database (60% chance)

**Symptoms:**
- Query 1 returns 0
- Business directory page shows "No businesses found"

**Fix:**
- Run migration 012 (vendor-to-business migration)
- Or manually create test businesses

---

### Scenario 2: RLS Policy Missing (25% chance)

**Symptoms:**
- Query 1 returns > 0
- Query 5 fails with permission error
- Query 4 shows no SELECT policies

**Fix:**
- Run Fix 1 above (create public SELECT policy)

---

### Scenario 3: All Businesses Inactive (10% chance)

**Symptoms:**
- Query 1 returns > 0
- Query 2 shows is_active = false for all
- Query 3 with is_active filter returns 0

**Fix:**
- Either set businesses to active: `UPDATE public.businesses SET is_active = true;`
- Or code already handles this with fallback

---

### Scenario 4: Slug Mismatch (5% chance)

**Symptoms:**
- Query 2 shows slugs exist
- Query 3 returns 0 rows
- Slug format doesn't match URL

**Fix:**
- Check slug format (lowercase, no spaces, hyphens only)
- Verify URL matches database slug exactly

---

## ✅ NEXT STEPS

1. **Run Query 1** - Check if businesses exist
2. **Run Query 2** - Check slug format
3. **Run Query 4** - Check RLS policies
4. **Check dev server logs** - Look for error messages
5. **Share results** - So I can provide specific fix

---

**Code Updated:** `actions/businesses.ts` now has better error handling and fallback logic.





