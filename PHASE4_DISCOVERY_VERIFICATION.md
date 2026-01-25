# Phase 4: Time-Based Discovery - Verification Guide

**Date:** December 30, 2025  
**Status:** ✅ Complete

---

## Overview

Phase 4 implements a discovery layer for events and markets using attendee intent. The system is calm, factual, non-social, and non-gamified.

---

## Features Implemented

### 1. Discovery Page (`/markets/discovery`)

**Sections:**
- ✅ **This Week** → Events user is planning to attend (if authenticated) or all upcoming events
- ✅ **Next Week** → Upcoming events for next week
- ✅ Markets are highlighted with category badges

**Event Cards Display:**
- ✅ Date and time
- ✅ Location (name and address)
- ✅ Hosting business (with logo and link)
- ✅ Linked offers (if any)
- ✅ EventIntentButtons for interactivity

### 2. Filtering

**Intent Filters (Authenticated Users Only):**
- ✅ All - Shows all events
- ✅ Saved - Shows events with favourite intent
- ✅ Planning to Attend - Shows events with planning_to_attend intent

**Category Filters:**
- ✅ All Categories
- ✅ Market
- ✅ Workshop
- ✅ Meetup
- ✅ Sports

**Ordering:**
- ✅ Chronological (by start date/time)

### 3. Visibility Rules

- ✅ **Authenticated users**: See their own intents on events
- ✅ **Unauthenticated users**: See all upcoming events (no intent filtering)
- ✅ No social counts or public visibility of intents

### 4. Performance

- ✅ Pagination support (50 events per page)
- ✅ Lazy-loading ready (load more button)
- ✅ Efficient Supabase queries using existing indexes

---

## Files Created

### New Files
1. `app/api/discovery/route.ts` - Discovery API endpoint
2. `app/markets/discovery/page.tsx` - Discovery page component
3. `components/ui/EventCard.tsx` - Event card component
4. `PHASE4_DISCOVERY_VERIFICATION.md` - This file

---

## API Endpoint

### GET `/api/discovery`

**Query Parameters:**
- `filter` (optional): `'all'` | `'favourite'` | `'planning_to_attend'`
- `category` (optional): `'Market'` | `'Workshop'` | `'Meetup'` | `'Sports'` | `''`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Events per page (default: 50)

**Response:**
```json
{
  "thisWeek": {
    "events": [...],
    "total": 10,
    "hasMore": false
  },
  "nextWeek": {
    "events": [...],
    "total": 5,
    "hasMore": false
  },
  "page": 1,
  "limit": 50
}
```

**Event Object:**
```json
{
  "id": "uuid",
  "event_type": "market_day" | "event",
  "title": "Event Title",
  "description": "Event description",
  "start_at": "2025-01-01T10:00:00Z",
  "end_at": "2025-01-01T18:00:00Z",
  "location": "Location Name",
  "location_address": "Full Address",
  "category": "Market" | "Workshop" | "Meetup" | "Sports",
  "hosting_business": {
    "id": "uuid",
    "name": "Business Name",
    "slug": "business-slug",
    "logo_url": "https://..."
  },
  "offers": [
    {
      "id": "uuid",
      "title": "Offer Title",
      "description": "Offer description",
      "valid_to": "2025-01-31T23:59:59Z",
      "business": {
        "name": "Business Name",
        "slug": "business-slug"
      }
    }
  ],
  "intents": ["favourite", "planning_to_attend"]
}
```

---

## Database Queries

### Efficient Query Strategy

1. **User Intents Query:**
   - Uses `user_event_intent` table with indexes:
     - `idx_user_event_intent_user_id`
     - `idx_user_event_intent_user_type`
   - Filters by `user_id` and optionally `intent_type`

2. **Market Days Query:**
   - Uses `market_days` table
   - Filters by date range (this week + next week)
   - Joins with `hosts` table for business info
   - Uses existing indexes on `market_date` and `is_published`

3. **Events Query:**
   - Uses `events` table (if exists)
   - Filters by date range and category
   - Handles gracefully if table doesn't exist

4. **Offers Query:**
   - Batch query for all event offers
   - Uses `deals` table with `event_id` index
   - Filters by `status = 'active'` and `valid_to >= now()`

### Index Usage

All queries leverage existing indexes:
- ✅ `market_days`: `market_date`, `is_published`
- ✅ `user_event_intent`: `user_id`, `event_id`, `intent_type`, composite indexes
- ✅ `deals`: `event_id`, `status`, `valid_to`
- ✅ `vendors`: `id` (for hosting business lookups)

---

## Verification Steps

### 1. Test Discovery Page

1. **Navigate to `/markets/discovery`**
   - Should load without errors
   - Should show "This Week" and "Next Week" sections

2. **Test as Unauthenticated User:**
   - Should see all upcoming events
   - Should NOT see intent filter buttons
   - Should see category filter

3. **Test as Authenticated User:**
   - Should see intent filter buttons (All, Saved, Planning to Attend)
   - Should see their own intents on events
   - Should be able to filter by intent

### 2. Test Filtering

1. **Intent Filters:**
   - Click "Saved" → Should show only events with favourite intent
   - Click "Planning to Attend" → Should show only events with planning_to_attend intent
   - Click "All" → Should show all events

2. **Category Filters:**
   - Select "Market" → Should show only market days
   - Select "Workshop" → Should show only workshop events (if any)
   - Select "All Categories" → Should show all events

### 3. Test Event Cards

1. **Verify Event Card Displays:**
   - Date and time
   - Location
   - Hosting business (if applicable)
   - Linked offers (if any)
   - Intent buttons (if authenticated)

2. **Test Intent Buttons:**
   - Click "Save event" → Should toggle favourite intent
   - Click "Plan to attend" → Should toggle planning_to_attend intent
   - Buttons should update immediately

### 4. Test API Endpoint

1. **Test Basic Query:**
   ```bash
   curl http://localhost:3001/api/discovery
   ```
   - Should return JSON with thisWeek and nextWeek events

2. **Test Filters:**
   ```bash
   curl "http://localhost:3001/api/discovery?filter=favourite&category=Market"
   ```
   - Should return filtered results

3. **Test Pagination:**
   ```bash
   curl "http://localhost:3001/api/discovery?page=2&limit=10"
   ```
   - Should return paginated results

### 5. Test Performance

1. **Load Page with Many Events:**
   - Should load within 2-3 seconds
   - Should show "Load More" button if >50 events

2. **Test Database Queries:**
   - Check Supabase logs for query performance
   - All queries should use indexes
   - No full table scans

---

## Edge Cases Handled

✅ **No Events:**
- Shows empty state with helpful message
- Suggests adjusting filters

✅ **Events Table Missing:**
- API handles gracefully
- Only queries market_days if events table doesn't exist

✅ **No User Intents:**
- Unauthenticated users see all events
- Authenticated users see events with their intents

✅ **No Offers:**
- Event cards don't show offers section if none exist
- Offers query handles empty results

✅ **Date Range Edge Cases:**
- Handles week boundaries correctly
- Handles timezone differences

---

## Build Verification

✅ **Linter Status:** All files pass linting  
✅ **TypeScript:** No type errors  
✅ **No Breaking Changes:** All changes are additive  
✅ **Backward Compatibility:** Existing functionality preserved

---

## Performance Considerations

### Query Optimization

1. **Batch Queries:**
   - User intents fetched once
   - Offers fetched in single batch query
   - Vendor info fetched in batch for hosting businesses

2. **Index Usage:**
   - All date range queries use indexed columns
   - Intent queries use composite indexes
   - Offer queries use event_id index

3. **Pagination:**
   - Default limit: 50 events per page
   - Load more button for additional events
   - Prevents loading too many events at once

### Frontend Optimization

1. **Lazy Loading:**
   - Events loaded on page load
   - Additional events loaded on "Load More" click

2. **Component Optimization:**
   - EventCard is a client component
   - EventIntentButtons only render for authenticated users
   - Filters use state management

---

## Success Criteria

✅ **Discovery Page:**
- Shows This Week and Next Week sections
- Displays event cards with all required information
- Filters work correctly
- Chronological ordering

✅ **Event Cards:**
- Show date, location, business, offers
- Include intent buttons
- Link to event details

✅ **Filtering:**
- Intent filters (All/Saved/Planning)
- Category filters
- Combined filters work

✅ **Performance:**
- Page loads quickly
- Queries use indexes
- Pagination works

✅ **UX:**
- Calm, factual tone
- No gamification
- No social counts
- Private intents

---

## Next Steps

The discovery system is complete and ready for use. Future enhancements could include:
- Search functionality
- Date range picker
- Map view
- Calendar export

**Phase 4 Complete.** ✅





