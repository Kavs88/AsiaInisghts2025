# Properties, Rentals & Event Spaces - Current Status

**Date:** December 30, 2025  
**Status:** 📊 **ASSESSMENT COMPLETE**

---

## EXECUTIVE SUMMARY

The platform has a **Properties** system partially implemented, but it's **NOT currently linked** to Market Days or Events. Properties exist as a standalone module for rentals, but there's no integration with the event/venue system.

---

## 1. WHAT EXISTS: PROPERTIES TABLE

### Database Schema ✅

**File:** `supabase/migrations/006_properties_events_businesses_schema.sql`

**Properties Table Structure:**
```sql
CREATE TABLE public.properties (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  address TEXT NOT NULL,
  type TEXT CHECK (type IN ('residential', 'commercial', 'event_space', 'warehouse')),
  availability TEXT CHECK (availability IN ('available', 'rented', 'sold', 'maintenance')),
  price DECIMAL(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_meters INTEGER,
  description TEXT,
  image_urls TEXT[],
  amenities TEXT[],
  location_coords POINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Key Fields:**
- `type`: Can be 'event_space' (but not enforced as primary use)
- `availability`: Rental status (available, rented, sold, maintenance)
- `owner_id`: Links to users table (property owner)
- `price`: Rental/listing price
- `location_coords`: Geographic location

**RLS Policies:** ✅
- Public can view active, available properties
- Owners can view/manage own properties
- Admins can view/manage all properties

**Admin UI:** ✅
- Admin page exists: `app/markets/admin/properties/page.tsx`
- Can view, add, edit properties
- Shows rental status, pricing, owner info

---

## 2. WHAT EXISTS: EVENTS TABLE

### Database Schema ✅

**File:** `supabase/migrations/009_create_events_and_deals.sql`

**Events Table Structure:**
```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  venue_type TEXT CHECK (venue_type IN ('vendor', 'property', 'custom')),
  venue_id UUID,  -- Can reference property OR vendor
  venue_address_json JSONB,
  ...
);
```

**Key Fields:**
- `venue_type`: Can be 'property' (polymorphic link)
- `venue_id`: References property.id when venue_type = 'property'
- `venue_address_json`: Stores address as JSON (redundant if linked to property)

**Status:** Events table exists but **NOT actively used** in the current implementation. Market Days are the primary event system.

---

## 3. WHAT EXISTS: MARKET DAYS

### Current Implementation ✅

**Market Days Table:**
```sql
CREATE TABLE public.market_days (
  id UUID PRIMARY KEY,
  market_date DATE,
  location_name TEXT,
  location_address TEXT,
  location_coords POINT,
  start_time TIME,
  end_time TIME,
  ...
);
```

**Key Fields:**
- `location_name`: Text field (e.g., "Central Park")
- `location_address`: Text field (e.g., "123 Main St")
- `location_coords`: Geographic coordinates
- **NO property_id field** - Not linked to properties table

**Status:** Market Days are the **primary event system** but are **NOT linked to Properties**.

---

## 4. THE GAP: NO LINKAGE

### Missing Connections ❌

1. **Market Days → Properties:**
   - Market Days have `location_name` and `location_address` as text
   - **NO `property_id` foreign key**
   - **NO relationship** to properties table
   - Cannot track which property is being used for a market

2. **Events → Properties:**
   - Events table has `venue_type` and `venue_id` (polymorphic)
   - **BUT Events table is not actively used**
   - Market Days are the primary system

3. **Rentals → Events:**
   - Properties have `availability` (available, rented, sold)
   - **NO link** to which event/market is using the property
   - Cannot track "this property is rented for Market Day X"

---

## 5. CURRENT STATE SUMMARY

### What Works ✅

1. **Properties System:**
   - ✅ Database table exists
   - ✅ Admin UI exists (`/markets/admin/properties`)
   - ✅ Can create/edit properties
   - ✅ Can mark as event_space type
   - ✅ Can track rental availability
   - ✅ RLS policies in place

2. **Market Days System:**
   - ✅ Database table exists
   - ✅ Public pages exist
   - ✅ Can create/edit market days
   - ✅ Has location fields (text-based)

3. **Events Table:**
   - ✅ Database table exists
   - ✅ Has venue_type/venue_id (polymorphic)
   - ❌ **NOT actively used** (Market Days are primary)

### What's Missing ❌

1. **No Property → Market Day Link:**
   - Market Days cannot reference a property
   - Cannot see "which property is this market at?"
   - Cannot filter markets by property

2. **No Rental Tracking:**
   - Cannot track "this property is rented for Market Day X"
   - Cannot see rental history
   - Cannot block property availability during market dates

3. **No Event Space Booking:**
   - Properties can be type 'event_space'
   - But no booking system
   - No calendar/availability view
   - No conflict checking

4. **No Unified Venue System:**
   - Market Days use text fields
   - Events table has venue_type but unused
   - Properties exist separately
   - No single source of truth for venues

---

## 6. INTENDED ARCHITECTURE (INFERRED)

Based on the schema, it appears the intended architecture was:

### Option A: Properties as Venues
```
Properties (event_space type)
  ↓
Events (venue_type='property', venue_id=property.id)
  ↓
Market Days (could link to Events or directly to Properties)
```

### Option B: Direct Market Day → Property Link
```
Properties (event_space type)
  ↓
Market Days (property_id FK → properties.id)
```

### Current Reality:
```
Properties (standalone)
Market Days (standalone, text-based locations)
Events (exists but unused)
```

**No connections between them.**

---

## 7. RECOMMENDATIONS FOR PROMPT

### Option 1: Link Market Days to Properties (Recommended)

**Add to Market Days:**
- `property_id UUID REFERENCES properties(id)` (nullable)
- When set, use property.address, property.location_coords
- When null, use existing text fields (backward compatible)

**Benefits:**
- Simple, direct relationship
- Market Days are primary system
- Can track which property hosts which market
- Can show property details on market page

### Option 2: Use Events Table as Bridge

**Activate Events table:**
- Link Events to Properties (venue_type='property')
- Link Market Days to Events (event_id FK)
- Use Events as the venue booking system

**Benefits:**
- More flexible (can have events at vendors too)
- Polymorphic venue system already in schema
- Can track event history per property

### Option 3: Rental Booking System

**Add Rental Bookings table:**
```sql
CREATE TABLE property_rentals (
  id UUID PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  market_day_id UUID REFERENCES market_days(id),
  event_id UUID REFERENCES events(id),
  start_date DATE,
  end_date DATE,
  status TEXT,
  ...
);
```

**Benefits:**
- Track rental history
- Block availability during rentals
- Support multi-day rentals
- Separate from property ownership

---

## 8. QUESTIONS FOR YOUR PROMPT

1. **Primary Use Case:**
   - Are properties primarily for **renting to market days**?
   - Or for **general event space booking**?
   - Or both?

2. **Linkage Preference:**
   - Direct Market Day → Property link?
   - Or use Events table as bridge?
   - Or separate Rental Bookings system?

3. **Availability Management:**
   - Should property availability auto-update when booked for market?
   - Or manual management?
   - Need calendar/conflict checking?

4. **UI Requirements:**
   - Show property details on market day page?
   - Show market days on property page?
   - Admin interface for linking?
   - Public property listing/booking?

---

## 9. FILES TO REVIEW

1. **Schema:**
   - `supabase/migrations/006_properties_events_businesses_schema.sql`
   - `supabase/migrations/009_create_events_and_deals.sql`

2. **Admin UI:**
   - `app/markets/admin/properties/page.tsx`
   - `app/markets/admin/properties/page-client.tsx`

3. **Market Days:**
   - `app/markets/market-days/page.tsx`
   - `app/markets/market-days/[id]/page.tsx`

4. **Types:**
   - `types/database.ts` (check if properties type exists)

---

## SUMMARY

**Current State:**
- ✅ Properties table exists (rentals, event spaces)
- ✅ Market Days exist (primary event system)
- ✅ Events table exists (unused, has venue_type)
- ❌ **NO LINKAGE** between them
- ❌ **NO RENTAL BOOKING** system
- ❌ **NO VENUE MANAGEMENT** for markets

**Next Steps:**
1. Decide on linkage architecture
2. Add foreign key relationships
3. Create booking/rental system (if needed)
4. Update UI to show connections
5. Add availability management

**Ready for your prompt to implement the linkage system.** ✅





