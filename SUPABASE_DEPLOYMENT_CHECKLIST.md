# Supabase Deployment Checklist

## ✅ Migrations to Run

You need to run **2 new migrations** in Supabase SQL Editor:

### 1. Reviews & Trust System Migration
**File:** `supabase/migrations/014_reviews_and_trust_system.sql`

**What it creates:**
- `reviews` table (for business/vendor/market_day reviews)
- `review_helpful_votes` table (community voting)
- `review_summaries` view (aggregated statistics)
- `check_verified_purchase()` function (verification logic)
- RLS policies for reviews
- Indexes for performance

**Dependencies:** 
- ✅ Requires `users` table (already exists)
- ✅ Requires `orders` table (for verified purchase check)
- ✅ Requires `user_event_intents` table (for market_day verification)

**Status:** ✅ Safe to run (doesn't modify existing tables)

---

### 2. Properties Extension Migration
**File:** `supabase/migrations/015_extend_properties_for_event_spaces.sql`

**What it adds:**
- `property_type` column to `properties` table ('rental' | 'event_space')
- `capacity` column (for event spaces)
- `hourly_rate` column (for event spaces)
- `daily_rate` column (for event spaces)
- `business_id` column (to link event spaces to businesses)
- Indexes for new columns

**Dependencies:**
- ✅ Requires `properties` table (from migration 006)
- ✅ Requires `businesses` table (for business_id foreign key)

**Status:** ✅ Safe to run (only adds columns, doesn't break existing data)

---

## 📋 Step-by-Step Deployment

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)

### Step 2: Run Reviews Migration
1. Click **"New Query"**
2. Open file: `supabase/migrations/014_reviews_and_trust_system.sql`
3. Copy **entire contents** of the file
4. Paste into SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`
6. **Expected:** Success message, no errors

**Verification Query:**
```sql
-- Check reviews table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'reviews';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'reviews';

-- Check policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'reviews';
```

**Expected Results:**
- ✅ `reviews` table exists
- ✅ `rowsecurity` = true
- ✅ At least 3-4 policies listed

---

### Step 3: Run Properties Extension Migration
1. Click **"New Query"** (or keep existing query window)
2. Open file: `supabase/migrations/015_extend_properties_for_event_spaces.sql`
3. Copy **entire contents** of the file
4. Paste into SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`
6. **Expected:** Success message, no errors

**Verification Query:**
```sql
-- Check property_type column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name = 'property_type';

-- Check event space columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('capacity', 'hourly_rate', 'daily_rate', 'business_id');

-- Check existing properties are set to 'rental'
SELECT property_type, COUNT(*) 
FROM public.properties 
GROUP BY property_type;
```

**Expected Results:**
- ✅ All new columns exist
- ✅ All existing properties have `property_type = 'rental'`

---

## ⚠️ Important Notes

### Migration 014 (Reviews)
- **Safe:** Creates new tables only, doesn't modify existing data
- **Idempotent:** Uses `IF NOT EXISTS` clauses
- **No downtime:** Won't affect existing functionality
- **RLS:** Policies are created with proper security

### Migration 015 (Properties)
- **Safe:** Only adds columns (nullable), doesn't break existing queries
- **Backward compatible:** Existing properties default to 'rental'
- **No data loss:** All existing property data remains intact
- **Optional:** New columns are nullable, so existing code continues to work

---

## 🧪 Post-Deployment Testing

### Test Reviews System:
```sql
-- Test creating a review (you'll need actual user and business IDs)
-- INSERT INTO public.reviews (user_id, subject_id, subject_type, rating, comment)
-- VALUES ('user-uuid', 'business-uuid', 'business', 5, 'Great business!');

-- Check review summary view works
SELECT * FROM public.review_summaries 
WHERE subject_type = 'business' 
LIMIT 5;
```

### Test Properties Extension:
```sql
-- Check you can query by property_type
SELECT * FROM public.properties 
WHERE property_type = 'rental';

-- Check you can add event space (if needed)
-- INSERT INTO public.properties (owner_id, address, type, property_type, capacity, hourly_rate)
-- VALUES ('user-uuid', '123 Venue St', 'other', 'event_space', 100, 50.00);
```

---

## ✅ Completion Checklist

- [ ] Migration 014 executed successfully
- [ ] Reviews table exists and has RLS enabled
- [ ] Review summaries view exists
- [ ] Migration 015 executed successfully
- [ ] Properties table has property_type column
- [ ] Event space columns (capacity, hourly_rate, daily_rate) exist
- [ ] All verification queries pass
- [ ] No errors in Supabase logs

---

## 🚨 Troubleshooting

### If Migration 014 Fails:
- **Error: "relation users does not exist"** → Run migration 001 first
- **Error: "relation orders does not exist"** → Run migration 001 first
- **Error: "relation user_event_intents does not exist"** → Run migration 011 first

### If Migration 015 Fails:
- **Error: "relation properties does not exist"** → Run migration 006 first
- **Error: "relation businesses does not exist"** → Run migration 006 or 012 first
- **Error: "column already exists"** → Migration already ran (safe to ignore)

### If You Get Permission Errors:
- Ensure you're using the SQL Editor (not Dashboard tables view)
- Check you have proper database permissions
- Try running as database owner/administrator

---

**Ready to deploy!** Both migrations are safe and ready to run. 🚀





