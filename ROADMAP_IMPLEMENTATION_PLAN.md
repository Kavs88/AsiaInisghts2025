# Roadmap Implementation Plan

## Overview
Strategic implementation of Platform Consolidation, Reviews System, and Property Enhancements.

---

## Phase 1: Reviews & Trust System (Starting Point)

### Database Schema Design

**Decisions Needed:**
1. ✅ **Reviews for Markets?** → Recommendation: **YES** - Include 'market_day' as subject_type for market-level reviews
2. ✅ **Moderation?** → Recommendation: **Live with report button** - Faster trust building, easier UX

**Schema Enhancements:**
- Add `subject_type` to include: 'business', 'vendor', 'market_day'
- Add `status` field: 'published', 'reported', 'hidden' (for moderation workflow)
- Add `verified_purchase` boolean (link to orders table)
- Add `helpful_count` for community voting
- Add indexes for performance

### Implementation Steps:
1. ✅ Create migration: `014_reviews_and_trust_system.sql`
2. ✅ Add TypeScript types to `types/database.ts`
3. ✅ Create API routes: `/api/reviews` (GET, POST, PUT, DELETE)
4. ✅ Build UI components:
   - `ReviewTab.tsx` - Review listing component
   - `ReviewSummary.tsx` - Average rating + count header
   - `ReviewModal.tsx` - Leave a review form
   - `StarRating.tsx` - Reusable star component
5. ✅ Integrate into Business/Vendor profiles
6. ✅ Add "Verified Customer" badge logic

---

## Phase 2: Platform Consolidation (Phase 4 Cleanup)

### Properties & Market Synergy
- Link properties to Market Days via junction table
- Add "Rent/Buy near this Market" section to Market Day pages
- Property Spotlight feature for featured properties at markets

### Unified Event RSVP
- Standardize RSVP across Business Events, Market Events, Community meetups
- Use existing `user_event_intents` table
- Create unified RSVP component

### Global Navigation Uplift
- Review and optimize navigation between Hub sections
- Ensure clear pathways: Businesses ↔ Markets ↔ Properties
- Add breadcrumbs and contextual navigation

---

## Phase 3: Advanced Property Functions

### Inquiry System
- Internal messaging system
- WhatsApp/Zalo integration
- Lead capture and tracking

### Availability Calendar
- Visual calendar for short-term rentals
- Booking conflicts management
- Availability status API

### Property Map View
- Integrated map for Discovery hub
- Show properties, businesses, markets simultaneously
- Filter and search on map

---

## Next Immediate Actions

1. **Create Reviews Migration** (Priority 1)
2. **Answer User Questions** (In this response)
3. **Build Review Components** (Priority 2)
4. **Integrate into Profiles** (Priority 3)





