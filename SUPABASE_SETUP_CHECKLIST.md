# Supabase Setup Checklist

## ✅ Completed
- ✅ Queries file restored with all functions
- ✅ Seed data file exists (`supabase/seed_data.sql`)

## 🔧 Required Actions

### 1. Run Database Schema (if not done)
**File:** `supabase/schema_safe.sql`
- Go to Supabase Dashboard → SQL Editor
- Copy and paste the entire `schema_safe.sql` file
- Click "Run" to create all tables

### 2. Run Seed Data
**File:** `supabase/seed_data.sql`
- Go to Supabase Dashboard → SQL Editor
- Copy and paste the entire `seed_data.sql` file
- Click "Run" to populate sample data

**This will create:**
- 4 sample vendors (Luna Ceramics, Greenway Bakery, Artisan Soaps, Farm Fresh Produce)
- Multiple products for each vendor
- 2 upcoming market days
- Vendor assignments to market stalls
- Vendor badges and tiers

### 3. Run Venue Fields Migration (NEW)
**File:** `supabase/add_venue_fields.sql`
- Go to Supabase Dashboard → SQL Editor
- Copy and paste the entire `add_venue_fields.sql` file
- Click "Run" to add venue fields to market_days table

### 4. Verify Data
After running seed data, check in Supabase Dashboard:

**Table Editor → vendors:**
- Should see 4 vendors: Luna Ceramics, Greenway Bakery, Artisan Soaps, Farm Fresh Produce

**Table Editor → products:**
- Should see multiple products (at least 5-6 products)

**Table Editor → market_days:**
- Should see 2 upcoming market days

**Table Editor → market_stalls:**
- Should see vendor assignments to stalls

## 🐛 Troubleshooting

### If nothing shows on the site:

1. **Check Environment Variables**
   - Verify `.env.local` has correct Supabase URL and keys
   - Restart dev server after changing env vars

2. **Check RLS Policies**
   - Go to Supabase Dashboard → Authentication → Policies
   - Ensure vendors and products tables have public read access
   - Run `supabase/add_admin_rls_policies.sql` if needed

3. **Check Console Errors**
   - Open browser DevTools → Console
   - Look for Supabase connection errors
   - Check Network tab for failed API calls

4. **Test Connection**
   - Visit `/test-connection` page
   - Should show connection status and data counts

5. **Verify Seed Data Ran**
   - Go to Supabase Dashboard → Table Editor
   - Check if `vendors` table has rows
   - If empty, run `seed_data.sql` again

## 📋 Quick Verification Query

Run this in Supabase SQL Editor to check data:

```sql
-- Check vendors
SELECT COUNT(*) as vendor_count FROM vendors;

-- Check products  
SELECT COUNT(*) as product_count FROM products;

-- Check market days
SELECT COUNT(*) as market_days_count FROM market_days WHERE is_published = true;

-- View sample vendors
SELECT name, slug, is_active FROM vendors LIMIT 5;

-- View sample products
SELECT name, slug, is_available, price FROM products LIMIT 5;
```

If counts are 0, you need to run the seed data!


