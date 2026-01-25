# Phase 2 Deployment Guide - Properties, Events, Business Directory

**Date:** 2025-01-29  
**Phase:** Core Expansion Deployment  
**Status:** Ready for Production

---

## Prerequisites

Before starting, ensure you have:

- ✅ Supabase CLI installed (`supabase --version`)
- ✅ Logged into Supabase CLI (`supabase login`)
- ✅ Project linked to Supabase (`supabase link`)
- ✅ Environment variables configured (`.env.local`)
- ✅ Access to Supabase Dashboard

---

## Step 1: Verify Supabase CLI Setup

### 1.1 Check Supabase CLI Installation

```bash
supabase --version
```

**Expected Output:** Version number (e.g., `1.x.x`)

**If not installed:**
```bash
npm install -g supabase
```

### 1.2 Verify Project Link

```bash
supabase status
```

**Expected Output:** Project information including project reference ID

**If not linked:**
```bash
supabase link --project-ref your-project-ref
```

**To find your project ref:**
- Go to Supabase Dashboard → Project Settings → General
- Copy the "Reference ID"

### 1.3 Verify Authentication

```bash
supabase projects list
```

**Expected Output:** List of your Supabase projects

**If not authenticated:**
```bash
supabase login
```

---

## Step 2: Enable Required Postgres Extensions

**Note:** These extensions are already included in migration 001, but verify they're enabled.

### 2.1 Connect to Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/_/sql/new
2. Replace `_` with your project reference ID

### 2.2 Verify Extensions (Migration 001 should have created these)

**Run this verification query:**

```sql
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('pg_trgm', 'uuid-ossp');
```

**Expected Output:** Both extensions listed with versions

**If extensions are missing, run:**

```sql
-- Enable required extensions for search functionality
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search (trigram similarity)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- For UUID generation
```

**Click "Run" or press Ctrl+Enter**

**Expected Result:** 
- ✅ `CREATE EXTENSION` (if not already enabled)
- ⚠️ `NOTICE: extension "pg_trgm" already exists` (if already enabled - this is OK)

---

## Step 3: Deploy Edge Functions

### 3.1 Deploy Properties CRUD Function

```bash
supabase functions deploy properties-crud
```

**Expected Output:**
```
Deploying function properties-crud...
Function properties-crud deployed successfully
```

**If error occurs:**
- Check you're in the project root directory
- Verify `supabase/functions/properties-crud/index.ts` exists
- Check Supabase CLI is linked to correct project

### 3.2 Deploy Events CRUD Function

```bash
supabase functions deploy events-crud
```

**Expected Output:**
```
Deploying function events-crud...
Function events-crud deployed successfully
```

### 3.3 Deploy Businesses CRUD Function

```bash
supabase functions deploy businesses-crud
```

**Expected Output:**
```
Deploying function businesses-crud...
Function businesses-crud deployed successfully
```

### 3.4 Verify Edge Functions Deployment

**Option A: Via CLI**
```bash
supabase functions list
```

**Expected Output:** Should include:
- `properties-crud`
- `events-crud`
- `businesses-crud`

**Option B: Via Dashboard**
1. Go to: https://supabase.com/dashboard/project/_/functions
2. Verify all three functions are listed

---

## Step 4: Run Database Migrations

### 4.1 Migration 006: Schema for Properties, Events, Businesses

**Method 1: Via Supabase CLI (Recommended for Production)**

```bash
# Push all migrations (including new ones)
supabase db push
```

**OR push specific migration:**

```bash
# First, ensure you're in the project root
cd "C:\Users\admin\Sunday Market Project"

# Push migrations to remote
supabase migration up
```

**Method 2: Via Supabase Dashboard (Alternative)**

1. Go to: https://supabase.com/dashboard/project/_/sql/new
2. Open file: `supabase/migrations/006_properties_events_businesses_schema.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run" or press Ctrl+Enter

**Expected Output:**
- ✅ `CREATE TABLE` statements succeed
- ✅ Indexes created
- ✅ Triggers created
- ✅ RLS enabled

**Verification Query:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'events', 'businesses')
ORDER BY table_name;
```

**Expected Output:** 3 rows (properties, events, businesses)

---

### 4.2 Migration 007: RLS Policies

**Method 1: Via Supabase CLI (Recommended)**

```bash
# If using db push (runs all pending migrations)
supabase db push

# OR continue with migration up
supabase migration up
```

**Method 2: Via Supabase Dashboard (Alternative)**

1. Go to: https://supabase.com/dashboard/project/_/sql/new
2. Open file: `supabase/migrations/007_properties_events_businesses_rls.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run" or press Ctrl+Enter

**Expected Output:**
- ✅ Multiple `CREATE POLICY` statements succeed
- ✅ Policies created for properties, events, businesses

**Verification Query:**
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('properties', 'events', 'businesses')
ORDER BY tablename, policyname;
```

**Expected Output:** Multiple policy rows for each table

---

### 4.3 Migration 008: Seed Data (Optional - Development Only)

**⚠️ WARNING:** Only run this in development/staging. Do NOT run in production with real data.

**Method 1: Via Supabase CLI**

```bash
# If using db push (runs all pending migrations including seed)
supabase db push

# OR continue with migration up
supabase migration up
```

**Method 2: Via Supabase Dashboard (Alternative)**

1. Go to: https://supabase.com/dashboard/project/_/sql/new
2. Open file: `supabase/migrations/008_seed_properties_events_businesses.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run" or press Ctrl+Enter

**Expected Output:**
- ✅ `INSERT` statements succeed
- ✅ 3 properties created
- ✅ 3 events created
- ✅ 3 businesses created

**Verification Query:**
```sql
SELECT 
  (SELECT COUNT(*) FROM properties) as properties_count,
  (SELECT COUNT(*) FROM events) as events_count,
  (SELECT COUNT(*) FROM businesses) as businesses_count;
```

**Expected Output:** All counts should be 3 (if seed data was run)

---

## Step 5: Verify RLS and Permissions

### 5.1 Run RLS Verification Script

**Method 1: Via Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/_/sql/new
2. Open file: `supabase/migrations/005_rls_verification.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run" or press Ctrl+Enter

**Expected Output:**
- ✅ NOTICE messages showing RLS enabled for all tables
- ✅ Policy counts for each table
- ✅ Function verification results
- ⚠️ Any warnings should be investigated

**Key Checks:**
- All tables should show "RLS ENABLED"
- Each table should have at least 2 policies
- Required functions should exist

---

### 5.2 Manual RLS Verification

**Check RLS is Enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('properties', 'events', 'businesses')
ORDER BY tablename;
```

**Expected Output:** All should show `rowsecurity = true`

**Check Policies Exist:**
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('properties', 'events', 'businesses')
GROUP BY tablename
ORDER BY tablename;
```

**Expected Output:** Each table should have 4-6 policies

---

### 5.3 Test RLS Policies (Admin User)

**⚠️ IMPORTANT:** Run this as an admin user to verify policies work correctly.

**Test Properties RLS:**
```sql
-- Should return all properties (admin can view all)
SELECT COUNT(*) FROM properties;

-- Should succeed (admin can insert)
INSERT INTO properties (owner_id, address, type, price)
VALUES (
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  'Test Property',
  'apartment',
  100000
);

-- Clean up test
DELETE FROM properties WHERE address = 'Test Property';
```

**Test Events RLS:**
```sql
-- Should return all events (admin can view all)
SELECT COUNT(*) FROM events;

-- Should succeed (admin can insert)
INSERT INTO events (organizer_id, title, event_date, start_time, location)
VALUES (
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  'Test Event',
  CURRENT_DATE + INTERVAL '7 days',
  '10:00:00',
  'Test Location'
);

-- Clean up test
DELETE FROM events WHERE title = 'Test Event';
```

**Test Businesses RLS:**
```sql
-- Should return all businesses (admin can view all)
SELECT COUNT(*) FROM businesses;

-- Should succeed (admin can insert)
INSERT INTO businesses (owner_id, name, slug, category, contact_phone, address)
VALUES (
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  'Test Business',
  'test-business',
  'Retail',
  '+1234567890',
  'Test Address'
);

-- Clean up test
DELETE FROM businesses WHERE name = 'Test Business';
```

---

## Step 6: Verify Edge Functions Configuration

### 6.1 Check Function Secrets (if needed)

Edge Functions may need environment variables. Check if any are required:

```bash
supabase secrets list
```

**If secrets are needed** (e.g., for email services):
```bash
supabase secrets set RESEND_API_KEY=your_key_here
```

**For Phase 2 functions:** No additional secrets required (they use Supabase service role key automatically)

---

### 6.2 Test Edge Functions (Optional)

**Note:** Edge Functions use Supabase service role key automatically. They verify user authentication via the `Authorization` header.

**Test Properties CRUD Function:**

```bash
# Get your access token (from browser after logging in)
# Then test the function:
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/properties-crud' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "operation": "create",
    "data": {
      "address": "Test Address",
      "type": "apartment",
      "price": 100000
    }
  }'
```

**Expected Output:** JSON response with `success: true` and property data

**Alternative: Test via Dashboard**
1. Go to: https://supabase.com/dashboard/project/_/functions
2. Click on a function (e.g., `properties-crud`)
3. Use the "Invoke" tab to test the function
4. Check the "Logs" tab for execution details

---

## Step 7: Run E2E Tests

### 7.1 Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3001
- Local: http://localhost:3001
```

**Keep this running in a separate terminal**

---

### 7.2 Run All E2E Tests

```bash
npm run test:e2e
```

**Expected Output:**
- Tests run for critical-path, properties-crud, events-crud, businesses-crud
- All tests should pass (or show expected failures if data doesn't exist yet)

---

### 7.3 Run Individual Module Tests

**Test Properties Module:**
```bash
npm run test:e2e properties-crud
```

**Test Events Module:**
```bash
npm run test:e2e events-crud
```

**Test Business Directory Module:**
```bash
npm run test:e2e businesses-crud
```

---

### 7.4 Run Tests with UI (Recommended for Debugging)

```bash
npm run test:e2e:ui
```

**This opens Playwright UI where you can:**
- See test execution in real-time
- Debug failed tests
- View screenshots
- Step through test execution

---

## Step 8: Manual Verification Checklist

### 8.1 Admin Dashboard Verification

1. **Login as Admin:**
   - Go to: http://localhost:3001/auth/login
   - Login with admin credentials

2. **Access Admin Dashboard:**
   - Go to: http://localhost:3001/markets/admin
   - Verify dashboard loads

3. **Check New Module Links:**
   - Verify "Manage Properties" link exists
   - Verify "Manage Events" link exists
   - Verify "Manage Businesses" link exists

4. **Test Each Module:**
   - Click "Manage Properties" → Should show properties list (may be empty)
   - Click "Manage Events" → Should show events list (may be empty)
   - Click "Manage Businesses" → Should show businesses list (may be empty)

---

### 8.2 Database Verification

**Check Tables Exist:**
```sql
SELECT 
  'properties' as table_name,
  COUNT(*) as row_count
FROM properties
UNION ALL
SELECT 
  'events' as table_name,
  COUNT(*) as row_count
FROM events
UNION ALL
SELECT 
  'businesses' as table_name,
  COUNT(*) as row_count
FROM businesses;
```

**Expected Output:** 3 rows with counts (0 if no seed data, 3 each if seed data was run)

---

### 8.3 Edge Function Verification

**Via Dashboard:**
1. Go to: https://supabase.com/dashboard/project/_/functions
2. Click on each function
3. Verify they're deployed and active
4. Check function logs for any errors

---

## Step 9: Troubleshooting

### 9.1 Common Issues

**Issue: "Function not found"**
```bash
# Verify function files exist
ls supabase/functions/

# Re-deploy
supabase functions deploy properties-crud --no-verify-jwt
```

**Issue: "RLS policy violation"**
- Check you're running migrations as a user with proper permissions
- Verify admin user exists: `SELECT * FROM users WHERE role = 'admin';`
- Re-run RLS migration if needed

**Issue: "Extension not found"**
- Run extension setup (Step 2) again
- Check extension is enabled: `SELECT * FROM pg_extension WHERE extname = 'pg_trgm';`

**Issue: "Migration fails"**
- Check if tables already exist: `SELECT table_name FROM information_schema.tables WHERE table_name IN ('properties', 'events', 'businesses');`
- If they exist, you may need to drop them first (⚠️ DANGEROUS - backup first):
  ```sql
  DROP TABLE IF EXISTS businesses CASCADE;
  DROP TABLE IF EXISTS events CASCADE;
  DROP TABLE IF EXISTS properties CASCADE;
  ```
- Then re-run migrations

---

### 9.2 Rollback Instructions (If Needed)

**Rollback Edge Functions:**
```bash
# Delete functions (if needed)
supabase functions delete properties-crud
supabase functions delete events-crud
supabase functions delete businesses-crud
```

**Rollback Migrations:**
```sql
-- ⚠️ WARNING: This will delete all data in these tables
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
```

---

## Step 10: Production Deployment Checklist

Before deploying to production:

- [ ] All migrations tested in staging
- [ ] Edge Functions tested and working
- [ ] RLS policies verified
- [ ] E2E tests passing
- [ ] Admin dashboard accessible
- [ ] No console errors in browser
- [ ] Database backups created
- [ ] Environment variables set in production
- [ ] Supabase project linked to production
- [ ] Edge Functions deployed to production
- [ ] Migrations run in production
- [ ] RLS verification script run
- [ ] Manual testing completed

---

## Quick Reference: All Commands

```bash
# Navigate to project root
cd "C:\Users\admin\Sunday Market Project"

# 1. Verify setup
supabase status
supabase projects list

# 2. Deploy Edge Functions
supabase functions deploy properties-crud
supabase functions deploy events-crud
supabase functions deploy businesses-crud

# 3. Verify functions
supabase functions list

# 4. Run migrations (CLI method - recommended)
supabase db push
# OR run individually via SQL Editor in Dashboard:
# - 006_properties_events_businesses_schema.sql
# - 007_properties_events_businesses_rls.sql
# - 008_seed_properties_events_businesses.sql (optional)

# 5. Verify RLS
# - Run 005_rls_verification.sql in SQL Editor

# 6. Run tests
npm run dev  # In one terminal
npm run test:e2e  # In another terminal
```

---

## Alternative: Complete Deployment Script

For a fully automated deployment, you can create a deployment script:

**Windows PowerShell (`deploy-phase2.ps1`):**
```powershell
# Phase 2 Deployment Script
Write-Host "Starting Phase 2 Deployment..." -ForegroundColor Green

# 1. Verify Supabase connection
Write-Host "`n1. Verifying Supabase connection..." -ForegroundColor Yellow
supabase status
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Supabase not linked. Run 'supabase link' first." -ForegroundColor Red
    exit 1
}

# 2. Deploy Edge Functions
Write-Host "`n2. Deploying Edge Functions..." -ForegroundColor Yellow
supabase functions deploy properties-crud
supabase functions deploy events-crud
supabase functions deploy businesses-crud

# 3. Run Migrations
Write-Host "`n3. Running database migrations..." -ForegroundColor Yellow
supabase db push

# 4. Verify Functions
Write-Host "`n4. Verifying Edge Functions..." -ForegroundColor Yellow
supabase functions list

Write-Host "`n✅ Deployment complete! Please verify RLS and run tests manually." -ForegroundColor Green
```

**Usage:**
```powershell
.\deploy-phase2.ps1
```

---

## Support

If you encounter issues:

1. Check Supabase Dashboard → Logs for errors
2. Check Edge Function logs: Dashboard → Functions → [function name] → Logs
3. Verify environment variables are set
4. Check RLS policies are correct
5. Review migration errors in SQL Editor

---

**Deployment Status:** Ready  
**Last Updated:** 2025-01-29

---

## Deployment Summary

### Quick Start (Automated)

1. **Run deployment script:**
   ```powershell
   .\deploy-phase2.ps1
   ```

2. **Verify RLS policies** (via SQL Editor):
   - Run `supabase/migrations/005_rls_verification.sql`

3. **Run tests:**
   ```bash
   npm run dev  # Terminal 1
   npm run test:e2e  # Terminal 2
   ```

### Manual Deployment Steps

1. ✅ **Deploy Edge Functions** (3 functions)
2. ✅ **Run Migrations** (3 migration files)
3. ✅ **Verify RLS** (verification script)
4. ✅ **Run E2E Tests** (4 test suites)

### Estimated Time

- **Automated (script):** ~5-10 minutes
- **Manual (step-by-step):** ~15-20 minutes
- **Testing & Verification:** ~10-15 minutes

**Total:** ~30-45 minutes for complete deployment and verification

