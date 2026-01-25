# Business Tiles Debugging Steps

**Issue:** Business tiles click but profile pages don't load

---

## 🔍 IMMEDIATE CHECKS

### 1. Check Browser Console (F12)
Look for:
- JavaScript errors
- Network errors (404, 500)
- Failed API requests

### 2. Check Network Tab
- Click a business tile
- Look for request to `/businesses/[slug]`
- Check status code (200, 404, 500)
- Check response content

### 3. Check Server Logs
- Dev server terminal output
- Look for error messages
- Check for database errors

---

## 🛠️ DIAGNOSTIC QUERIES

Run in Supabase SQL Editor:

### Query 1: Do businesses exist?
```sql
SELECT COUNT(*) as count FROM public.businesses;
```

**If 0:** Need to create businesses or run migration 012

### Query 2: Do businesses have slugs?
```sql
SELECT id, name, slug, is_active 
FROM public.businesses 
LIMIT 5;
```

**Check:** 
- Slugs are populated
- is_active = true
- Names are correct

### Query 3: Can public read businesses?
```sql
-- Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'businesses';
```

**Should have:** At least one SELECT policy for public/authenticated

### Query 4: Test query manually
```sql
-- Replace 'test-slug' with actual slug from query 2
SELECT * FROM public.businesses 
WHERE slug = 'test-slug' 
AND is_active = true;
```

**Should return:** One row with business data

---

## 🔧 QUICK FIXES APPLIED

### Fix 1: Added Error Logging
- Added console.error for debugging
- Added null checks for supabase client

### Fix 2: Made Events Join Optional
- If events join fails, falls back to query without events
- Handles PGRST116 error (relation not found)

### Fix 3: Added is_active Filter
- Now filters by is_active = true
- Ensures only active businesses show

---

## 📋 NEXT STEPS

1. **Run diagnostic queries** above
2. **Check browser console** for specific errors
3. **Verify businesses exist** in database
4. **Verify RLS policies** allow public read
5. **Test with specific slug** directly in URL

---

## 🎯 MOST LIKELY ISSUES

1. **No businesses in database** (40% chance)
   - Solution: Create test business or run migration

2. **RLS policy blocking** (30% chance)
   - Solution: Add public read policy

3. **Events join failing** (20% chance)
   - Solution: Already fixed with fallback

4. **Slug mismatch** (10% chance)
   - Solution: Check slug format

---

**Updated Code:** `actions/businesses.ts` with better error handling





