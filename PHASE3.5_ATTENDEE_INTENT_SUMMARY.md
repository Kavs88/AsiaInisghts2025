# Phase 3.5: Attendee Intent & Offer Integration - Execution Summary

**Date:** December 30, 2025  
**Status:** ✅ Complete  
**Build Status:** ✅ Linter checks passed

---

## Executive Summary

Successfully implemented Attendee user intent and Offer linking in a minimal, non-social way:
1. ✅ User Roles (business_user, attendee_user)
2. ✅ Attendee Intent System (favourite, attending)
3. ✅ Event UI Updates (Save event, Plan to attend buttons)
4. ✅ Attendee View (My Events page)
5. ✅ Offer Linking (Business name, validity, event linking)

All features implemented with premium, restrained tone. No feeds, messaging, comments, or ticketing.

---

## 1. User Roles

### Changes Made

**Added Support for New Roles:**
- **File:** `supabase/migrations/010_attendee_intent_and_offers.sql`
- **File:** `types/database.ts`

**Role Updates:**
- `business_user` - Alias for existing vendor users (for clarity)
- `attendee_user` - New lightweight role for event attendees
- Updated `users` table constraint to include new roles
- Backward compatible with existing `customer`, `vendor`, `admin` roles

**Implementation:**
- No UI for role switching (as per requirements)
- Roles are set at user creation/update
- Database constraint updated to allow new roles

### Files Touched
- `supabase/migrations/010_attendee_intent_and_offers.sql`
- `types/database.ts`

---

## 2. Attendee Intent (Core Feature)

### Changes Made

**Created `user_event_intent` Table:**
- **File:** `supabase/migrations/010_attendee_intent_and_offers.sql`

**Table Structure:**
```sql
user_event_intent (
  id UUID PRIMARY KEY
  user_id UUID (references users)
  event_id UUID (flexible - can reference market_days or events)
  intent_type TEXT ('favourite' | 'attending')
  created_at TIMESTAMPTZ
  UNIQUE(user_id, event_id, intent_type)
)
```

**Rules Implemented:**
- ✅ One intent per user per event per type (enforced by UNIQUE constraint)
- ✅ Private by default (RLS policies ensure users only see their own)
- ✅ No notifications (no notification system implemented)
- ✅ No counters required (future-safe, can be added later)

**RLS Policies:**
- Users can read their own intents
- Users can insert their own intents
- Users can delete their own intents
- No public visibility

**Indexes:**
- `idx_user_event_intent_user_id` - Fast user queries
- `idx_user_event_intent_event_id` - Fast event queries
- `idx_user_event_intent_type` - Fast type filtering
- `idx_user_event_intent_user_type` - Composite for My Events queries

### Files Touched
- `supabase/migrations/010_attendee_intent_and_offers.sql`
- `types/database.ts` (added user_event_intent table type)

---

## 3. Event UI Updates

### Changes Made

**Added Event Intent Buttons Component:**
- **File:** `components/ui/EventIntentButtons.tsx`
- **Features:**
  - "Save event" button (favourite intent)
  - "Plan to attend" button (attending intent)
  - Toggle functionality (click to add/remove)
  - Visual feedback (active states)
  - Only visible when user is logged in

**UI Rules Followed:**
- ✅ Small, calm buttons (compact design)
- ✅ No gamification (no badges, scores, points)
- ✅ No visible counts (as per requirements)
- ✅ Subtle visual feedback (color changes on active state)

**Button States:**
- **Save event**: White border → Primary background when active
- **Plan to attend**: White border → Success background when active
- Icons change to filled when active

**Added to Market Days Page:**
- **File:** `app/markets/market-days/page.tsx`
- Buttons appear next to event title
- Only visible to logged-in users

### Files Touched
- `components/ui/EventIntentButtons.tsx` (new)
- `app/markets/market-days/page.tsx`

---

## 4. Attendee View (Minimal)

### Changes Made

**Created "My Events" Page:**
- **File:** `app/markets/my-events/page.tsx`
- **Route:** `/markets/my-events`

**Features:**
- Shows saved events (favourite intent)
- Shows planned events (attending intent)
- Chronological order (sorted by start date)
- Filter tabs: All, Saved, Planning to Attend
- Empty states for each filter
- No social data (as per requirements)

**Page Structure:**
- Header with title and description
- Filter tabs (All, Saved, Planning to Attend)
- Event cards grid
- Each card shows:
  - Date badge
  - Intent indicators (heart for saved, checkmark for attending)
  - Event title
  - Description (if available)
  - Location (if available)
  - Link to event details

**Authentication:**
- Requires user to be logged in
- Shows sign-in prompt if not authenticated
- Gracefully handles loading states

### Files Touched
- `app/markets/my-events/page.tsx` (new)

---

## 5. Offer Linking

### Changes Made

**Updated Deals Table:**
- **File:** `supabase/migrations/010_attendee_intent_and_offers.sql`
- Added `event_id` column (nullable UUID)
- Allows offers to optionally reference events
- Index added for event-based queries

**Offer Display Updates:**

1. **Business Profile Page:**
   - **File:** `app/markets/sellers/[slug]/page-client.tsx`
   - Offers now display:
     - ✅ Business name ("From {business name}")
     - ✅ Validity period (valid_from - valid_to or valid_to only)
     - ✅ Event link indicator (if `event_id` exists)

2. **Market Days Page:**
   - **File:** `app/markets/market-days/page.tsx`
   - New "Event Offers" section
   - Shows offers if:
     - Offer is linked to the Event (`event_id = market_day.id`)
     - OR Offer belongs to the hosting Business (`vendor_id = host.id`)
   - Section only renders if offers exist (no empty section)
   - Each offer card shows:
     - Business name
     - Offer title
     - Description
     - Validity period

**Offer Query Logic:**
```sql
SELECT * FROM deals
WHERE (event_id = {event_id} OR vendor_id = {host_business_id})
  AND status = 'active'
  AND valid_to >= NOW()
```

### Files Touched
- `supabase/migrations/010_attendee_intent_and_offers.sql`
- `app/markets/sellers/[slug]/page-client.tsx`
- `app/markets/market-days/page.tsx`
- `types/database.ts` (added deals table with event_id)

---

## API Routes Created

### 1. POST/GET `/api/events/[id]/intent`
- **File:** `app/api/events/[id]/intent/route.ts`
- **POST**: Create or toggle event intent
- **GET**: Get user's intents for an event
- **Authentication**: Required
- **Returns**: Intent data or empty array

### 2. GET `/api/my-events`
- **File:** `app/api/my-events/route.ts`
- **Query Params**: `?type=favourite|attending` (optional)
- **Authentication**: Required
- **Returns**: Array of events with intent types
- **Supports**: Both `market_days` and `events` table events

### Files Touched
- `app/api/events/[id]/intent/route.ts` (new)
- `app/api/my-events/route.ts` (new)

---

## Schema Additions

### New Table: `user_event_intent`
```sql
CREATE TABLE public.user_event_intent (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  intent_type TEXT NOT NULL CHECK (intent_type IN ('favourite', 'attending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id, intent_type)
);
```

### Updated Table: `deals`
```sql
ALTER TABLE public.deals
  ADD COLUMN event_id UUID;
```

### Updated Table: `users`
```sql
ALTER TABLE public.users
  DROP CONSTRAINT users_role_check;
  
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('customer', 'vendor', 'admin', 'business_user', 'attendee_user'));
```

---

## Files Modified Summary

### New Files
1. `supabase/migrations/010_attendee_intent_and_offers.sql` - Schema migration
2. `components/ui/EventIntentButtons.tsx` - Intent buttons component
3. `app/markets/my-events/page.tsx` - My Events page
4. `app/api/events/[id]/intent/route.ts` - Intent API route
5. `app/api/my-events/route.ts` - My Events API route

### Modified Files
1. `types/database.ts` - Added user_event_intent, deals, updated user roles
2. `app/markets/market-days/page.tsx` - Added intent buttons and offers section
3. `app/markets/sellers/[slug]/page-client.tsx` - Updated offers display

---

## Constraints Followed

✅ **No feeds** - No activity feeds or social feeds  
✅ **No messaging** - No messaging system  
✅ **No comments** - No comment system  
✅ **No ticketing** - No ticketing system  
✅ **No breaking schema changes** - All changes are additive  
✅ **No new top-level navigation items** - My Events accessible via direct URL or future menu

---

## Technical Details

### Intent Toggle Logic
- Clicking a button checks if intent exists
- If exists: Delete intent (toggle off)
- If not exists: Create intent (toggle on)
- UI updates immediately on success

### Event Query Flexibility
- `event_id` can reference either:
  - `market_days.id` (Market Day events)
  - `events.id` (General events)
- No foreign key constraint to maintain flexibility
- API routes handle both event types

### Offer Linking Logic
- Offers can be linked to events via `event_id`
- Offers can be linked to businesses via `vendor_id`
- Market Days page shows offers if:
  - Offer `event_id` matches market day `id`
  - OR Offer `vendor_id` matches market day host `id`

---

## Build Verification

✅ **Linter Status:** All files pass linting  
✅ **TypeScript:** No type errors  
✅ **No Breaking Changes:** All changes are additive  
✅ **Backward Compatibility:** Existing functionality preserved

---

## Success Criteria Verification

✅ **User Roles:**
- `business_user` and `attendee_user` roles supported
- No UI for role switching (as required)

✅ **Attendee Intent:**
- Users can favourite events
- Users can mark "Planning to attend"
- One intent per user per event per type
- Private by default
- No notifications
- No counters (future-safe)

✅ **Event UI:**
- Small, calm buttons
- No gamification
- No visible counts
- Toggle functionality works

✅ **Attendee View:**
- Shows saved events
- Shows planned events
- Chronological order
- No social data

✅ **Offer Linking:**
- All offers display business name
- All offers display validity period
- Offers can optionally reference events
- Event pages show relevant offers
- Section hidden if no offers

---

## Notes

- All features implemented with premium, restrained tone
- No social features (feeds, messaging, comments)
- No ticketing system
- Intent system is private and non-gamified
- Offers are clearly linked to businesses and events
- My Events page is minimal and focused
- Build passes cleanly

**Phase 3.5 Complete.** ✅





