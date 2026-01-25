# Properties Architecture Recommendation

## Recommendation: Single Table with Type Distinction

**Structure:** `properties` table with `property_type` field (`'rental' | 'event_space'`)

---

## Why This Approach?

### 1. **Shared Infrastructure** ✅
Both rental properties and event spaces share:
- Address/location data
- Images/media
- Contact information (owner/agent)
- Description/metadata
- Pricing (different models, but same field type)
- Availability status
- Reviews (same review system)
- Business/vendor relationships

### 2. **Code Reuse** ✅
- Single set of components (PropertyCard, PropertyProfile, PropertyMap)
- Shared queries and filters
- Unified search/discovery
- Same review system integration
- Shared inquiry/messaging infrastructure

### 3. **Flexible Querying** ✅
- Easy to query "all properties in this area" (both types)
- Unified map view showing both
- Combined filters when it makes sense
- Can still filter by type when needed

### 4. **Aligns with Existing Patterns** ✅
- Platform already uses polymorphic approaches (`user_event_intents` can link to events or market_days)
- Matches the Hub-Spoke architecture (shared infrastructure, distinct features)

### 5. **Future-Proof** ✅
- Easy to add new property types later (e.g., `'commercial'`, `'vacation_rental'`)
- Type-specific features can be added via JSONB or nullable columns
- Maintains schema simplicity

---

## Schema Design

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY,
  property_type TEXT NOT NULL CHECK (property_type IN ('rental', 'event_space')),
  
  -- Shared fields
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  location_coords POINT,
  images TEXT[],
  contact_phone TEXT,
  contact_email TEXT,
  owner_id UUID REFERENCES users(id),
  business_id UUID REFERENCES businesses(id), -- If managed by a business
  
  -- Type-specific fields (nullable, only used for relevant type)
  -- Rental Properties
  bedrooms INTEGER, -- NULL for event_spaces
  bathrooms DECIMAL(3,1), -- NULL for event_spaces
  square_meters INTEGER, -- Used by both
  rental_price_monthly DECIMAL(10,2), -- NULL for event_spaces
  
  -- Event Spaces
  capacity INTEGER, -- NULL for rentals
  hourly_rate DECIMAL(10,2), -- NULL for rentals
  daily_rate DECIMAL(10,2), -- NULL for rentals
  amenities TEXT[], -- Used by both (different values)
  
  -- Availability (different models)
  availability_type TEXT CHECK (availability_type IN ('available', 'booked', 'unavailable')),
  available_from DATE, -- For rentals
  available_to DATE, -- For rentals
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## Type-Specific Features

### Rental Properties
- Long-term availability (available_from/available_to dates)
- Bedrooms/bathrooms/square meters
- Monthly rental price
- Lease terms
- **Integration:** "Rent near this Market" feature
- **Inquiry:** Standard rental inquiry flow

### Event Spaces
- Capacity/amenities
- Hourly/daily rates
- Booking calendar (different from availability)
- **Integration:** RSVP/booking system for events
- **Inquiry:** Event space booking inquiry
- **Link to Events:** Spaces can be linked to specific events/market_days

---

## UI/UX Structure

### Navigation
- **Properties** section with two subsections:
  - "Rentals" (rental properties)
  - "Event Spaces" (venues)

### Discovery
- Unified map view (show both types)
- Separate filtered views (rentals only, event spaces only)
- Combined search with type filter

### Profile Pages
- Same base layout (images, description, location, contact)
- Type-specific sections:
  - Rentals: bedrooms, bathrooms, lease terms
  - Event Spaces: capacity, rates, booking calendar

---

## Implementation Benefits

1. **Single Migration** - One properties table with type distinction
2. **Shared Components** - PropertyCard, PropertyProfile, PropertyMap work for both
3. **Unified Reviews** - Same review system (`subject_type = 'property'`, works for both)
4. **Flexible Queries** - Easy to query both or filter by type
5. **Future Extensions** - Easy to add `'commercial'`, `'vacation_rental'`, etc.

---

## Alternative Considered: Separate Tables

**Why NOT separate tables:**
- Duplicated code (PropertyCard for rentals, VenueCard for events)
- Duplicated queries and API routes
- Harder to do unified discovery ("all properties in this area")
- More migrations and schema complexity
- Can't easily query "all properties managed by this business"

---

## Conclusion

**Single table with `property_type` distinction** provides the best balance of:
- Code reuse
- Query flexibility
- Schema simplicity
- Future extensibility
- Alignment with existing platform patterns

The type-specific features (booking calendar for events, lease terms for rentals) can be handled via nullable columns or JSONB fields, keeping the schema clean while supporting distinct use cases.





