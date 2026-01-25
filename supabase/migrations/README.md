# Supabase Migrations

This directory contains numbered migration files that should be run in order to set up the database schema.

## Migration Files

1. **001_initial_schema.sql** - Creates all tables, indexes, and triggers
2. **002_functions.sql** - Creates database functions for business logic
3. **003_rls_policies.sql** - Sets up Row Level Security policies
4. **004_seed_data.sql** - Deterministic seed data for local development

## Running Migrations

### Option 1: Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order (001, 002, 003, 004)
4. Verify each migration completes successfully

### Option 2: Supabase CLI

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Manual Execution

Copy and paste each migration file's contents into the Supabase SQL Editor and run them in order.

## Migration Order

**IMPORTANT:** Always run migrations in numerical order:

1. `001_initial_schema.sql` - Must run first (creates tables)
2. `002_functions.sql` - Requires tables to exist
3. `003_rls_policies.sql` - Requires tables and functions
4. `004_seed_data.sql` - Optional, for development only (requires all above)

## Verification

After running migrations, verify:

1. All tables exist: 
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' ORDER BY table_name;
   ```

2. All functions exist: 
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' ORDER BY routine_name;
   ```

3. RLS is enabled: 
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public' ORDER BY tablename;
   ```

4. Seed data exists:
   ```sql
   SELECT COUNT(*) FROM vendors;
   SELECT COUNT(*) FROM products;
   SELECT COUNT(*) FROM market_days;
   ```

## Seed Data

The `004_seed_data.sql` file contains deterministic seed data with fixed UUIDs:
- 3 sample vendors
- 4 sample products
- 1 sample market day
- 3 market stall assignments

**Note:** Seed data uses deterministic UUIDs for reproducible testing. The vendor records do NOT include `user_id` - you'll need to create auth users separately and link them.

## Rollback

To rollback a migration, you would need to manually reverse the changes. For production, consider using Supabase's migration system or version control.

## Notes

- Migrations use `IF NOT EXISTS` and `ON CONFLICT` where possible to be idempotent
- Some migrations may need to be run multiple times safely
- Always test migrations in a development environment first
- Seed data (004) is optional and can be skipped in production
