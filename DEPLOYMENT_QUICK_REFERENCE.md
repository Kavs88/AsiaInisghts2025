# Phase 2 Deployment - Quick Reference Card

## Prerequisites Check
```bash
supabase --version          # Should show version
supabase status             # Should show project info
supabase projects list      # Should list your projects
```

## 1. Deploy Edge Functions
```bash
supabase functions deploy properties-crud
supabase functions deploy events-crud
supabase functions deploy businesses-crud
```

## 2. Run Migrations
```bash
# Option A: CLI (recommended)
supabase db push

# Option B: SQL Editor (manual)
# Run these files in order:
# - supabase/migrations/006_properties_events_businesses_schema.sql
# - supabase/migrations/007_properties_events_businesses_rls.sql
# - supabase/migrations/008_seed_properties_events_businesses.sql (optional)
```

## 3. Verify RLS
```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/005_rls_verification.sql
```

## 4. Run Tests
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:e2e
```

## 5. Verify Deployment
- ✅ Edge Functions: `supabase functions list`
- ✅ Tables: Check Supabase Dashboard → Table Editor
- ✅ Admin Dashboard: http://localhost:3001/markets/admin

## Troubleshooting

**Function deploy fails:**
```bash
supabase functions deploy properties-crud --no-verify-jwt
```

**Migration fails:**
- Check SQL Editor for error messages
- Verify tables don't already exist
- Check RLS is enabled

**RLS policy errors:**
- Verify admin user exists: `SELECT * FROM users WHERE role = 'admin';`
- Re-run migration 007

## Automated Deployment
```powershell
.\deploy-phase2.ps1
```






