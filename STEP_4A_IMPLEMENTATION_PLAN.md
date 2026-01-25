# Step 4A: Trust & Engagement Feature Wiring - Implementation Plan

**Date:** January 3, 2026  
**Status:** 📋 **PLAN READY**  
**Step 3b Status:** ✅ COMPLETE (All migrations deployed and verified)  
**Step 4 Status:** 🔓 UNBLOCKED

---

## Objective

Wire existing backend systems (Reviews, RSVP, Bookmarks, Event Spaces) into the UI to enable end-to-end functionality before UX polish.

**Scope:** Functional integration only. No visual redesigns, animations, or performance optimization.

---

## Current State Assessment

### ✅ Backend Systems (Ready)
- **Reviews API:** `/api/reviews`, `/api/reviews/summary`, `/api/reviews/[id]/helpful`
- **RSVP API:** `/api/events/[id]/rsvp`, `/api/events/rsvp`
- **Bookmarks API:** `/api/events/[id]/intent`, `/api/my-events`, `/api/discovery`
- **Schema:** All tables created and verified (010-015 migrations)

### ✅ UI Components (Exist)
- **Reviews:** `ReviewSummary`, `ReviewTab`, `ReviewModal`, `ReviewCard`, `ReviewsSection`
- **RSVP:** `RSVPAction`, `RSVPModal`
- **Bookmarks:** `EventIntentButtons`
- **My Events:** Page exists at `/app/markets/my-events/page.tsx`

### ⚠️ Integration Gaps (To Wire)
1. ReviewSummary not displayed on business/event profiles
2. RSVP functionality not integrated into event detail pages
3. My Events page uses outdated intent_type values
4. Event spaces not surfaced in properties listings
5. Reviews section exists but needs proper integration on business pages

---

## Implementation Tasks

### Task 1: Reviews System Integration

#### 1.1 Display ReviewSummary on Business Profiles
**File:** `app/businesses/[slug]/page.tsx`

**Changes Required:**
- Import `ReviewSummary` component
- Fetch review summary data using `/api/reviews/summary?subject_id={businessId}&subject_type=business`
- Display ReviewSummary component in business header section (near stats/stats row)
- Handle loading and error states

**Location:** After line 162 (Stats Row section), before or after Activity Signals

**API Call:**
```typescript
// Server-side fetch in page component
const reviewSummary = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/reviews/summary?subject_id=${biz.id}&subject_type=business`)
  .then(r => r.json())
  .catch(() => null)
```

#### 1.2 Ensure ReviewsSection is Properly Integrated
**File:** `app/businesses/[slug]/page.tsx`

**Status Check:**
- ReviewsSection component exists but needs verification it's displayed
- Should be rendered in main content area (after About section or in tabs)

**Action:** Verify ReviewsSection is rendered. If missing, add it after About section (around line 260).

#### 1.3 Add Reviews to Event Detail Pages
**File:** `app/markets/events/[id]/page.tsx`

**Changes Required:**
- Create client component for reviews section (or reuse existing ReviewsSection)
- Fetch review summary for market_day: `/api/reviews/summary?subject_id={marketDayId}&subject_type=market_day`
- Display ReviewSummary in event header/info section
- Add ReviewsSection component in event content area

**Location:** 
- ReviewSummary: In Info Grid section (after line 157)
- ReviewsSection: After description section (around line 193)

**Note:** Event detail page uses `market_days` table, so subject_type should be 'market_day'.

#### 1.4 Verify Review Submission Works
**Files:** `components/ui/ReviewModal.tsx`, `components/ui/ReviewTab.tsx`

**Status Check:**
- Verify ReviewModal calls `/api/reviews` POST endpoint correctly
- Verify ReviewTab fetches reviews from `/api/reviews` GET endpoint
- Verify helpful vote functionality calls `/api/reviews/[id]/helpful`

**Action:** Review code for correctness. No changes expected if components are properly implemented.

---

### Task 2: RSVP System Integration

#### 2.1 Add RSVP to Event Detail Pages
**File:** `app/markets/events/[id]/page.tsx`

**Changes Required:**
- Import `RSVPAction` component
- Add RSVPAction component to event page layout
- Pass correct `eventId` and `marketDayId` props (use `item.id` for market_day_id)
- Position in sidebar or after event info section

**Location:** After Info Grid section (around line 157), in a dedicated RSVP section

**Implementation:**
```tsx
<RSVPAction 
  eventId={item.id} 
  marketDayId={item.isMarketDay ? item.id : undefined}
/>
```

**Note:** Event detail page uses `market_days` table, so `marketDayId` should be `item.id` when `item.isMarketDay` is true.

#### 2.2 Verify RSVP API Integration
**Files:** `components/ui/RSVPAction.tsx`, `components/ui/RSVPModal.tsx`

**Status Check:**
- Verify RSVPAction calls `/api/events/[id]/rsvp` correctly
- Verify RSVPModal calls `/api/events/rsvp` POST/DELETE correctly
- Verify market_day_id parameter is passed correctly

**Action:** Review code. Ensure market_day_id is used (not event_id) per migration 011.

---

### Task 3: Saved/Bookmarked Events Integration

#### 3.1 Fix My Events Page Intent Type Values
**File:** `app/markets/my-events/page.tsx`

**Changes Required:**
- Replace `'favourite'` with `'saved'` (line 24, 99, 123, 184)
- Verify API endpoint returns correct intent_type values
- Update filter logic to use 'saved' instead of 'favourite'

**Lines to Update:**
- Line 24: Filter type from `'favourite'` to `'saved'`
- Line 99: Filter check from `'favourite'` to `'saved'`
- Line 123: Button text/filter from `'favourite'` to `'saved'`
- Line 154: Empty state text from `'favourite'` to `'saved'`
- Line 184: Icon check from `'favourite'` to `'saved'`

**API Verification:**
- Verify `/api/my-events` returns `intent_type: 'saved'` (not 'favourite')
- Verify `/api/events/[id]/intent` accepts `'saved'` (not 'favourite')

#### 3.2 Verify EventIntentButtons Uses Correct Values
**File:** `components/ui/EventIntentButtons.tsx`

**Status Check:**
- Verify component uses `'saved'` instead of `'favourite'`
- Verify component calls `/api/events/[id]/intent` correctly
- Verify intent_type values match migration 010 (saved, planning_to_attend)

**Action:** Review code. Update if 'favourite' is still used.

#### 3.3 Verify My Events API Returns Correct Data
**File:** `app/api/my-events/route.ts`

**Status Check:**
- Verify API queries `user_event_bookmarks` table (not user_event_intent)
- Verify API uses `market_day_id` (not event_id)
- Verify API returns correct intent_type values ('saved', 'planning_to_attend')

**Action:** Review code. Ensure table/column names match migration 010.

---

### Task 4: Event Spaces Integration

#### 4.1 Surface Event Spaces in Properties Listings
**File:** `app/properties/page.tsx`

**Changes Required:**
- Update properties query to filter by `property_type = 'event_space'`
- Add filter option for event spaces
- Display event space specific fields (capacity, hourly_rate, daily_rate)
- Link to business if `business_id` is present

**Location:** Properties listing page

**Query Update:**
```typescript
// Filter for event spaces
.eq('property_type', 'event_space')

// Select event space fields
.select('*, businesses(id, name, slug)')
```

#### 4.2 Display Event Space Details on Property Detail Page
**File:** `app/properties/[id]/page.tsx`

**Changes Required:**
- Display capacity, hourly_rate, daily_rate if property_type is 'event_space'
- Display linked business information if business_id exists
- Show event space specific information

**Location:** Property detail page

**Fields to Display:**
- Capacity (if property_type = 'event_space')
- Hourly rate (if property_type = 'event_space')
- Daily rate (if property_type = 'event_space')
- Business link (if business_id exists)

---

## File-Level Touch Points

### Files to Modify

1. **app/businesses/[slug]/page.tsx**
   - Add ReviewSummary display
   - Verify ReviewsSection rendering

2. **app/markets/events/[id]/page.tsx**
   - Add ReviewSummary display
   - Add ReviewsSection component
   - Add RSVPAction component

3. **app/markets/my-events/page.tsx**
   - Replace 'favourite' with 'saved' (5 occurrences)

4. **app/properties/page.tsx**
   - Add event space filtering
   - Display event space fields

5. **app/properties/[id]/page.tsx**
   - Display event space details
   - Link to business if present

### Files to Review (No Changes Expected)

1. **components/ui/ReviewModal.tsx** - Verify API calls
2. **components/ui/ReviewTab.tsx** - Verify API calls
3. **components/ui/RSVPAction.tsx** - Verify API calls
4. **components/ui/RSVPModal.tsx** - Verify API calls
5. **components/ui/EventIntentButtons.tsx** - Verify intent_type values
6. **app/api/my-events/route.ts** - Verify table/column names

---

## Verification Checklist

### Reviews System
- [ ] ReviewSummary displays on business profile pages
- [ ] ReviewSummary displays on event detail pages
- [ ] ReviewsSection renders on business profile pages
- [ ] ReviewsSection renders on event detail pages
- [ ] Review submission works (POST /api/reviews)
- [ ] Review listing works (GET /api/reviews)
- [ ] Review summary statistics display correctly
- [ ] Helpful votes work (POST /api/reviews/[id]/helpful)

### RSVP System
- [ ] RSVPAction component displays on event detail pages
- [ ] RSVP submission works (POST /api/events/rsvp)
- [ ] RSVP status displays correctly
- [ ] RSVP counts display correctly
- [ ] RSVP cancellation works (DELETE /api/events/rsvp)
- [ ] RSVP modal opens and functions correctly

### Saved/Bookmarked Events
- [ ] My Events page uses 'saved' (not 'favourite')
- [ ] EventIntentButtons uses 'saved' (not 'favourite')
- [ ] Bookmarks API returns correct intent_type values
- [ ] My Events page displays saved events correctly
- [ ] My Events page displays planning_to_attend events correctly
- [ ] Bookmark actions (save/unsave) work correctly

### Event Spaces
- [ ] Event spaces appear in properties listings
- [ ] Event space filtering works
- [ ] Event space details display on property detail page
- [ ] Event space business links work
- [ ] Capacity, rates display correctly

### End-to-End Tests
- [ ] User can view reviews on business profile
- [ ] User can submit review on business profile
- [ ] User can view reviews on event detail page
- [ ] User can submit review on event detail page
- [ ] User can RSVP to event
- [ ] User can view RSVP status
- [ ] User can save/bookmark event
- [ ] User can view saved events in My Events
- [ ] User can view event spaces in properties
- [ ] User can view event space details

---

## Implementation Order

### Phase 1: Reviews System (Highest Priority)
1. Task 1.1: ReviewSummary on Business Profiles
2. Task 1.2: Verify ReviewsSection Integration
3. Task 1.3: Reviews on Event Detail Pages
4. Task 1.4: Verify Review Submission

### Phase 2: RSVP System
5. Task 2.1: RSVP on Event Detail Pages
6. Task 2.2: Verify RSVP API Integration

### Phase 3: Bookmarks
7. Task 3.1: Fix My Events Intent Types
8. Task 3.2: Verify EventIntentButtons
9. Task 3.3: Verify My Events API

### Phase 4: Event Spaces
10. Task 4.1: Event Spaces in Listings
11. Task 4.2: Event Space Details

---

## Constraints & Notes

### Do NOT
- ❌ Modify database schema
- ❌ Create new API routes (use existing ones)
- ❌ Redesign visual components
- ❌ Add animations or transitions
- ❌ Optimize performance (yet)
- ❌ Change component styling

### DO
- ✅ Wire existing components to existing APIs
- ✅ Fix intent_type value mismatches
- ✅ Display data from backend systems
- ✅ Ensure functionality works end-to-end
- ✅ Handle loading and error states
- ✅ Verify API integrations

### API Endpoint Notes
- Reviews: `/api/reviews`, `/api/reviews/summary`, `/api/reviews/[id]/helpful`
- RSVP: `/api/events/[id]/rsvp`, `/api/events/rsvp`
- Bookmarks: `/api/events/[id]/intent`, `/api/my-events`
- All APIs use correct table names per migrations (010-015)

### Table/Column Reference
- Reviews: `reviews` table, `review_summaries` view
- RSVP: `user_event_rsvps` table (composite PK: user_id, market_day_id)
- Bookmarks: `user_event_bookmarks` table (intent_type: 'saved', 'planning_to_attend')
- Event Spaces: `properties` table (property_type: 'event_space')

---

## Success Criteria

Step 4A is complete when:
1. ✅ All review functionality works on business and event pages
2. ✅ All RSVP functionality works on event detail pages
3. ✅ All bookmark functionality works (save/unsave, My Events page)
4. ✅ Event spaces are visible and functional
5. ✅ All verification checklist items pass
6. ✅ No API errors in browser console
7. ✅ All data displays correctly from backend

---

**Step 4A plan ready for execution.**



