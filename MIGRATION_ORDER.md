# SQL Migration Order

## Required Migration Sequence

Run these SQL files in Supabase SQL Editor in the following order:

### 1. Order Intents Schema (REQUIRED FIRST)
**File:** `supabase/order_intents_schema.sql`
- Creates the `order_intents` table
- Creates enum types (`intent_type`, `intent_status`)
- Sets up indexes and RLS policies
- **Must be run before any other order_intents-related migrations**

### 2. Vendor Notifications Migration
**File:** `supabase/vendor_notifications_migration.sql`
- Adds `notification_channel` and `notification_target` columns to `vendors` table
- Creates `notification_channel` enum type
- Can be run independently (doesn't depend on order_intents)

### 3. Order Intent Notification Trigger (OPTIONAL)
**File:** `supabase/order_intent_notification_trigger.sql`
- Creates trigger function for logging order intent creation
- **Requires `order_intents` table to exist** (from step 1)
- This is optional - notifications are handled in application layer

## Quick Start

If you're setting up from scratch:

```sql
-- Step 1: Create order_intents table
-- Run: supabase/order_intents_schema.sql

-- Step 2: Add notification preferences to vendors
-- Run: supabase/vendor_notifications_migration.sql

-- Step 3 (Optional): Add logging trigger
-- Run: supabase/order_intent_notification_trigger.sql
```

## Verification

After running migrations, verify with:

```sql
-- Check order_intents table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'order_intents';

-- Check notification columns exist
SELECT notification_channel, notification_target 
FROM vendors 
LIMIT 1;

-- Check trigger exists (if you ran step 3)
SELECT * FROM pg_trigger 
WHERE tgname = 'trg_notify_vendor_on_intent';
```





