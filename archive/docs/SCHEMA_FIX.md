# Schema Fix Applied

## Problem
The schema had an error: it referenced `is_active` column on the `users` table, but that column doesn't exist. Only the `vendors` table has `is_active`.

## Fix Applied
I've updated the users RLS policy to remove the `is_active` check.

## What to Do Now

1. **Copy the updated schema file** - I've fixed the error in `supabase/schema.sql`

2. **Run it again in Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor
   - Clear any previous query
   - Copy the ENTIRE contents of `supabase/schema.sql` again
   - Paste and click "Run"

3. **If you get "already exists" errors:**
   - That's fine! It means some tables were already created
   - You can either:
     - Ignore those errors and continue, OR
     - Drop the existing tables first (see below)

## Option: Start Fresh (If Needed)

If you want to start completely fresh, run this first to drop all tables:

```sql
DROP TABLE IF EXISTS public.deliveries CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.vendor_portfolio_items CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.market_stalls CASCADE;
DROP TABLE IF EXISTS public.market_days CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

Then run the full schema.sql again.

## Quick Test

After running the fixed schema, test your connection:
```bash
npm run dev
```
Visit: http://localhost:3000/test-connection

---

The schema file has been fixed! Just copy and run it again.


