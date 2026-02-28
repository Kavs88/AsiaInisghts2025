-- =============================================================================
-- Migration: 035_performance_indexes_minimal.sql
-- Project:   Asia Insights / Sunday Market Platform
-- Purpose:   Minimal necessary indexes derived from confirmed query patterns.
-- Safety:    Fully idempotent (IF NOT EXISTS). No data modified. No DO blocks.
-- Depends:   001–034
-- =============================================================================


-- =============================================================================
-- SECTION 1: events
-- =============================================================================

-- Market discovery: _fetchMarketEvents()
-- WHERE event_type = 'market' AND status = 'published' [AND start_at >= now]
-- ORDER BY start_at ASC
CREATE INDEX IF NOT EXISTS idx_events_market_published_start
  ON public.events (start_at ASC)
  WHERE event_type = 'market' AND status = 'published';

-- Property-scoped event queries: getUpcomingEventsForProperty(),
-- getLandlordUpcomingEvents(), getLandlordPropertyDetail()
-- WHERE property_id = $id AND [status = 'published' AND] start_at >= now
-- ORDER BY start_at ASC
CREATE INDEX IF NOT EXISTS idx_events_property_status_start
  ON public.events (property_id, status, start_at ASC)
  WHERE property_id IS NOT NULL;


-- =============================================================================
-- SECTION 2: properties
-- =============================================================================

-- Landlord dashboard listing: getLandlordProperties()
-- WHERE owner_id = $uid ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_properties_owner_created
  ON public.properties (owner_id, created_at DESC);

-- Public property listing: _fetchProperties()
-- WHERE is_active = true [AND property_type = $ptype] ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_properties_active_ptype_created
  ON public.properties (is_active, property_type, created_at DESC);

-- Event space venue finder: getEventSpaceProperties()
-- WHERE property_type = 'event_space' AND is_active = true ORDER BY address ASC
CREATE INDEX IF NOT EXISTS idx_properties_event_space_active_addr
  ON public.properties (is_active, address ASC)
  WHERE property_type = 'event_space';

-- Business property lookup: getPropertiesByBusiness()
-- WHERE business_id = $id AND is_active = true
CREATE INDEX IF NOT EXISTS idx_properties_business_id_active
  ON public.properties (business_id, is_active)
  WHERE business_id IS NOT NULL;


-- =============================================================================
-- SECTION 3: property_enquiries
-- =============================================================================

-- Landlord enquiry list: getLandlordEnquiries()
-- WHERE property_id IN ($ids) ORDER BY created_at DESC LIMIT 20
CREATE INDEX IF NOT EXISTS idx_enquiries_property_created
  ON public.property_enquiries (property_id, created_at DESC);


-- =============================================================================
-- SECTION 4: market_days
-- =============================================================================

-- FK enforcement: ON DELETE/UPDATE of events.id, PostgreSQL scans
-- market_days.event_id to apply the FK constraint.
-- PostgreSQL does not auto-create indexes on FK source columns.
CREATE INDEX IF NOT EXISTS idx_market_days_event_id
  ON public.market_days (event_id)
  WHERE event_id IS NOT NULL;


-- =============================================================================
-- SECTION 5: vendors
-- =============================================================================

-- FK enforcement: vendors.user_id ON DELETE SET NULL (migration 033).
-- When a user is deleted, PostgreSQL scans vendors.user_id to NULL matching rows.
CREATE INDEX IF NOT EXISTS idx_vendors_user_id
  ON public.vendors (user_id)
  WHERE user_id IS NOT NULL;
