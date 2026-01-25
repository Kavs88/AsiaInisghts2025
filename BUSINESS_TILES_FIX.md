# Business Tiles Not Loading - Diagnostic & Fix

**Issue:** Clicking business tiles doesn't load business profiles

---

## 🔍 DIAGNOSTIC CHECKLIST

### Possible Causes:

1. **No businesses in database**
   - Businesses table exists but is empty
   - Migration 012 not run (vendor-to-business migration)

2. **Query failing silently**
   - `getBusinessBySlug` returns null on error
   - Page shows 404 but might appear as "not loading"

3. **RLS policy blocking access**
   - Businesses table RLS might block public read
   - Need to verify RLS policies

4. **Slug mismatch**
   - Business slugs don't match what's in URL
   - Case sensitivity or special characters

5. **Events join failing**
   - Query includes events join that might fail
   - Events table might not exist or have wrong structure

---

## 🛠️ QUICK DIAGNOSTIC QUERIES

Run these in Supabase SQL Editor:

### Check 1: Businesses exist?
```sql
SELECT COUNT(*) as business_count FROM public.businesses;
```

**Expected:** Should return > 0

### Check 2: Businesses have slugs?
```sql
SELECT id, name, slug FROM public.businesses LIMIT 5;
```

**Expected:** Should show businesses with slugs

### Check 3: RLS policies on businesses?
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'businesses';
```

**Expected:** Should have a policy allowing SELECT for public/authenticated

### Check 4: Events table exists (for join)?
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'events';
```

**Expected:** Table should exist (or join should handle gracefully)

---

## 🔧 POTENTIAL FIXES

### Fix 1: Ensure RLS Policy Allows Public Read

If businesses table has RLS but no public read policy:

```sql
-- Check if policy exists
SELECT policyname FROM pg_policies 
WHERE tablename = 'businesses' AND policyname = 'Public can view businesses';

-- If it doesn't exist, create it:
CREATE POLICY "Public can view businesses" ON public.businesses
  FOR SELECT USING (is_active = true);
```

### Fix 2: Make Events Join Optional

The query includes events join which might fail. Update `actions/businesses.ts`:

```typescript
export async function getBusinessBySlug(slug: string) {
    const supabase = await createClient()

    // Try with events join first, fallback to without if it fails
    const { data, error } = await supabase
        .from('businesses')
        .select(`
      *,
      events (
        *,
        organizer:organizer_id (full_name, avatar_url)
      )
    `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    if (error) {
        // If join fails, try without events
        const { data: dataWithoutEvents, error: errorWithoutEvents } = await supabase
            .from('businesses')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single()
        
        if (errorWithoutEvents) {
            console.error('Error fetching business:', errorWithoutEvents)
            return null
        }
        
        return { ...dataWithoutEvents, events: [] }
    }

    return data
}
```

### Fix 3: Add Better Error Handling

Update the business page to show errors:

```typescript
export default async function BusinessProfilePage({
    params
}: {
    params: { slug: string }
}) {
    try {
        const business = await getBusinessBySlug(params.slug)

        if (!business) {
            notFound()
        }
        // ... rest of code
    } catch (error) {
        console.error('Error loading business:', error)
        notFound()
    }
}
```

---

## 🎯 MOST LIKELY FIX

**Most Common Issue:** RLS policy missing or businesses table empty

**Quick Fix:**

1. **Check if businesses exist:**
```sql
SELECT COUNT(*) FROM public.businesses;
```

2. **If 0, run migration 012** (if needed) or manually create a test business

3. **Check RLS policy:**
```sql
-- Should return at least one SELECT policy
SELECT policyname FROM pg_policies WHERE tablename = 'businesses';
```

4. **If no policy, add one:**
```sql
CREATE POLICY "Public can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = true);
```

---

## 📋 TESTING STEPS

1. **Check browser console** for errors (F12 → Console)
2. **Check Network tab** for failed requests
3. **Check Supabase logs** for query errors
4. **Run diagnostic queries** above
5. **Test with a known business slug** directly in URL

---

## 🔍 DEBUGGING COMMANDS

### Check Business Data
```sql
SELECT id, name, slug, is_active FROM public.businesses LIMIT 10;
```

### Test Query Manually
```sql
SELECT * FROM public.businesses WHERE slug = 'test-slug' AND is_active = true;
```

### Check RLS
```sql
SET ROLE anon;
SELECT * FROM public.businesses LIMIT 1;
RESET ROLE;
```

---

**Next Steps:** Run diagnostic queries to identify the specific issue.





