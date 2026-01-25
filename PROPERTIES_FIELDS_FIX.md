# Properties Query Fields Fix

## Issue
The properties query was failing because it was trying to select fields that don't exist in the database (`host_phone`, `host_email`), but the code uses these fields.

## Solution

### 1. Database Migration Required
Run the migration to add the missing fields:
```sql
-- File: supabase/migrations/016_add_property_host_fields.sql
-- This adds host_phone and host_email columns to the properties table
```

**To apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `supabase/migrations/016_add_property_host_fields.sql`

### 2. Query Updated
The `getProperties()` and `getPropertyById()` functions now include:
- `host_phone` - Optional direct host contact phone
- `host_email` - Optional direct host contact email
- All other fields used by PropertyCard and property detail page

### 3. Fields Included in Query

**Base fields (from schema):**
- id, address, type, property_type, price
- bedrooms, bathrooms, capacity
- images, location_coords, description
- hourly_rate, daily_rate
- contact_phone, contact_email
- business_id, created_at

**Extended fields (from migration 015):**
- property_type, capacity, hourly_rate, daily_rate, business_id

**New fields (from migration 016):**
- host_phone, host_email

**Related data:**
- businesses (id, name, slug, logo_url)

## Current Status
- ✅ Query includes all fields used by components
- ✅ Migration file created to add missing fields
- ⚠️ **ACTION REQUIRED**: Run migration 016 in Supabase to add host_phone and host_email columns

## After Migration
Once the migration is run, properties should load correctly. The code uses fallbacks:
- `property.host_phone || property.contact_phone`
- `property.host_email || property.contact_email`

So even if host_phone/host_email are NULL, it will fall back to contact_phone/contact_email.



