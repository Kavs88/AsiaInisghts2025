# Business Profile 404 - Debug Guide

**Issue:** Business tiles show, but clicking them gives 404

**Meaning:** `getBusinessBySlug()` is returning `null`

---

## 🔍 WHAT I CHANGED

1. **Changed `.single()` to `.maybeSingle()`**
   - `.single()` throws error if 0 or 2+ rows
   - `.maybeSingle()` returns null if no rows (better for our use case)

2. **Added detailed logging**
   - Logs slug being searched
   - Logs query results
   - Logs errors with codes

3. **Better error handling**
   - Tries without `is_active` filter as fallback
   - More detailed error messages

---

## 🧪 DEBUG STEPS

### Step 1: Check Dev Server Terminal

When you click a business tile, look at the terminal output for:

```
[getBusinessBySlug] Fetching business with slug: the-local-bistro
[getBusinessBySlug] Error fetching business: ...
[getBusinessBySlug] Error code: ...
```

**Share the error message you see!**

---

### Step 2: Test Query Manually in Supabase

Run this in SQL Editor (replace slug with actual one):

```sql
-- Test exact query
SELECT * FROM public.businesses 
WHERE slug = 'the-local-bistro' 
AND is_active = true;

-- Test without is_active
SELECT * FROM public.businesses 
WHERE slug = 'the-local-bistro';
```

**Check:**
- Does it return 1 row? (should)
- Does the slug match exactly? (case-sensitive)

---

### Step 3: Check Slug Format

In SQL Editor:

```sql
SELECT id, name, slug, is_active 
FROM public.businesses 
WHERE name LIKE '%Local Bistro%';
```

**Verify:**
- Slug matches what's in the URL
- No extra spaces or characters
- Case matches exactly

---

## 🎯 COMMON ISSUES

### Issue 1: Slug Mismatch

**Symptoms:**
- Tiles show
- Click gives 404
- Manual SQL query works

**Fix:** Check slug in database matches URL exactly

---

### Issue 2: `.single()` Error

**Symptoms:**
- Query returns 0 rows (should return 1)
- Error code might be `PGRST116`

**Fix:** Already fixed by using `.maybeSingle()`

---

### Issue 3: RLS Still Blocking

**Symptoms:**
- Error code `42501` (permission denied)
- Manual query works (you're admin)
- Server query fails (anon role)

**Fix:** Ensure RLS policy exists (run previous SQL fix)

---

## ✅ NEXT STEPS

1. **Restart dev server** to get new logs
2. **Click a business tile**
3. **Check terminal output** - share the error messages
4. **Test SQL query** - verify slug exists in database

**Most likely:** Slug format mismatch or RLS policy issue





