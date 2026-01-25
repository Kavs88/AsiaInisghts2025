# Archive Folder

This folder contains old/duplicate files that have been archived to keep the project clean.

## What's Here

### `supabase/` - Old SQL Migration Files
These files are old migrations that have been merged into `schema_safe.sql`:
- `schema.sql` - Old schema (use `schema_safe.sql` instead)
- `migrations.sql` - Old migrations (merged into schema_safe.sql)
- `order_intents_schema.sql` - Merged into schema_safe.sql
- `vendor_notifications_migration.sql` - Merged into schema_safe.sql
- `add_declined_status.sql` - Merged into schema_safe.sql
- `temporary_public_update_policy.sql` - Temporary fix, already applied
- `order_intent_notification_trigger.sql` - Merged into schema_safe.sql
- `vendor_signup_policies.sql` - Old version
- `vendor_signup_policies_fixed.sql` - Old version
- `verify_migrations.sql` - Verification script (no longer needed)
- `verify_seed_data.sql` - Verification script (no longer needed)

### `docs/` - Old/Duplicate Documentation
These are duplicate or outdated documentation files:
- Old setup guides (duplicates of current guides)
- Old status files (outdated)
- Old fix documentation (already applied)
- Cleanup guides (one-time use)

## Recovery

If you need any of these files, they're all here in the archive. Just copy them back to the project root or supabase folder.

## Current Essential Files

The project now only keeps:
- `supabase/schema_safe.sql` - Main schema
- `supabase/functions.sql` - Database functions
- `supabase/seed_data.sql` - Demo data
- `supabase/drop-all-tables.sql` - Reset utility
- Essential documentation in project root





