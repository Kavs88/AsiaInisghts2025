# Step 4B: UX & Quality Pass — Audit & Improvements

**Date:** Audit completed  
**Scope:** 5 pages (Business Profile, Event Detail, My Events, Properties Listing, Property Detail)

---

## 1️⃣ UX Findings (Per Page)

### Page 1: Business Profile (`app/businesses/[slug]/page.tsx`)

**Primary Purpose:** Display business identity, products, events, and reviews  
**Primary Action:** Browse offerings, contact business, read/write reviews

**Issues Found:**

1. **ReviewSummary buried in stats row** (Line 193-199)
   - Trust signal (reviews) competes with product/event counts
   - Should be more prominent since it's a key trust indicator
   - Currently appears as just another stat, not differentiated

2. **Stats row information density** (Line 180-203)
   - Products count, events count, reviews, and category badge all compete for attention
   - No clear hierarchy — everything feels equal weight
   - Activity signals below feel disconnected

3. **Activity signals placement** (Line 205-218)
   - "Hosted X events" and "Active this month" appear after stats
   - These are trust signals but feel like afterthoughts
   - Could be better integrated with verified badge

4. **About section layout** (Line 229-301)
   - Image takes 1/3 of width on desktop, sticky positioning
   - This pushes content right, but the image isn't essential
   - Could be more space-efficient

**Impact:** Trust signals (reviews, verification, activity) don't feel intentional. User has to hunt for credibility indicators.

---

### Page 2: Event Detail (`app/markets/events/[id]/page.tsx`)

**Primary Purpose:** Show event details, enable RSVP, display reviews  
**Primary Action:** RSVP to event, read reviews, save/bookmark event

**Issues Found:**

1. **RSVP section placement** (Line 236-242)
   - RSVP appears between host info and description
   - Primary action (RSVP) is buried in middle of page
   - Should appear earlier, after key event details

2. **ReviewSummary disconnected** (Line 196-210)
   - ReviewSummary appears in Info Grid (date/time/location)
   - Actual ReviewsSection appears much later, after description
   - Creates confusion — two separate review-related sections

3. **Description placement** (Line 244-254)
   - Description comes after RSVP
   - Users typically want context (description) before committing (RSVP)
   - Logical flow: details → description → action

4. **Duplicate "View Stall Map" buttons** (Line 267-272)
   - For market days, "View Stall Map" appears twice
   - Once after reviews section, once after description
   - Redundant and creates confusion

5. **Info Grid spacing** (Line 157-211)
   - Large gaps (gap-8) between info items
   - Feels spread out, not cohesive
   - Could be tighter for better grouping

**Impact:** Primary actions (RSVP) aren't obvious. Information hierarchy is unclear. Redundant elements create noise.

---

### Page 3: My Events (`app/markets/my-events/page.tsx`)

**Primary Purpose:** Display user's saved and planned events  
**Primary Action:** View event details, filter by type

**Issues Found:**

1. **Incorrect event detail links** (Line 217-225)
   - "View Details" links to `/markets/market-days` for market_day events
   - Should link to `/markets/events/${event.id}` for proper event detail page
   - Breaks user flow — user expects to see specific event details

2. **Event card layout spacing** (Line 175-226)
   - Date badge and intent icons (saved/attending) at top are good
   - But spacing between title, description, location feels tight
   - Could use better visual separation

**Impact:** Broken navigation reduces trust. Users can't access event details from their saved events.

---

### Page 4: Properties Listing (`app/properties/page.tsx`)

**Primary Purpose:** Browse properties and event spaces  
**Primary Action:** Filter, view property details

**Issues Found:**

1. **Non-functional filter button** (Line 80-83)
   - "Filters" button exists but doesn't do anything
   - Creates expectation but fails to deliver
   - Should either be removed or functional (but functionality is out of scope)

2. **Category filter logic clarity** (Line 44)
   - Complex conditional logic for active state
   - Works correctly but feels fragile
   - No UX issue, just implementation note

**Impact:** Non-functional UI element reduces perceived quality. Users might click expecting filters.

---

### Page 5: Property Detail (`app/properties/[id]/page.tsx`)

**Primary Purpose:** Show property details, enable booking/contact  
**Primary Action:** Book/check availability, contact host

**Issues Found:**

1. **Description section minimal** (Line 137-142)
   - Single paragraph, feels sparse
   - No visual hierarchy beyond heading
   - But this is data-dependent, not a layout issue

2. **"Nearby Hotspots" section disconnect** (Line 172-198)
   - Appears after location, feels like separate feature
   - Could be better integrated or clearly separated
   - Currently feels like it's "also there"

3. **Gallery image layout** (Line 56-75)
   - Main image + 4 small images is good
   - But if property has fewer images, empty spaces appear
   - Could handle missing images better

**Impact:** Page feels complete but "Nearby Hotspots" feels disconnected. Minor polish opportunity.

---

## 2️⃣ Approved Changes (Implementable Now)

### Change 1: Event Detail — Move RSVP After Description
**File:** `app/markets/events/[id]/page.tsx`  
**Section:** Lines 236-254 (RSVP and Description sections)  
**What to change:** Move RSVP section to appear after description section  
**Why:** Logical flow: key info → context (description) → action (RSVP). Users need context before committing. RSVP is primary action but should come after understanding the event.  
**Constraint check:** ✅ Reordering only, no logic changes

### Change 2: Event Detail — Remove Duplicate "View Stall Map"
**File:** `app/markets/events/[id]/page.tsx`  
**Section:** Lines 267-272 (duplicate View Stall Map button)  
**What to change:** Remove the "View Stall Map" button that appears after description (keep the one after reviews)  
**Why:** Eliminates redundancy and confusion. One clear CTA is better than two identical ones.  
**Constraint check:** ✅ Removing duplicate, no functionality change

### Change 3: Event Detail — Tighten Info Grid Spacing
**File:** `app/markets/events/[id]/page.tsx`  
**Section:** Line 157 (Info Grid gap)  
**What to change:** Change `gap-8` to `gap-6` for tighter, more cohesive grouping  
**Why:** Better visual grouping. Info items should feel related, not spread out.  
**Constraint check:** ✅ Spacing adjustment only

### Change 4: My Events — Fix Event Detail Links
**File:** `app/markets/my-events/page.tsx`  
**Section:** Line 217-225 (View Details link)  
**What to change:** Change link from `/markets/market-days` to `/markets/events/${event.id}` for market_day events  
**Why:** Users expect to see specific event details, not generic market days page. Fixes broken navigation.  
**Constraint check:** ✅ Route correction, no logic changes

### Change 5: Properties Listing — Remove Non-functional Filter Button
**File:** `app/properties/page.tsx`  
**Section:** Lines 80-83 (Filters button)  
**What to change:** Remove the non-functional "Filters" button entirely  
**Why:** Non-functional UI elements reduce perceived quality. Better to remove than leave broken.  
**Constraint check:** ✅ Removing non-functional element

### Change 6: Business Profile — Improve ReviewSummary Placement
**File:** `app/businesses/[slug]/page.tsx`  
**Section:** Lines 180-203 (Stats row)  
**What to change:** Move ReviewSummary outside stats row, place it below tagline but above stats row as its own line  
**Why:** Trust signals (reviews) should be more prominent and not compete with product/event counts. Creates clearer hierarchy.  
**Constraint check:** ✅ Reordering only, no logic changes

---

## 3️⃣ Out-of-Scope Observations

### Not to Implement Now (Future Considerations)

1. **Business Profile — About Section Layout**
   - Current: Image takes 1/3 width, sticky
   - Better: Could use image in hero or remove sticky positioning
   - **Why out of scope:** Requires layout restructuring, may affect mobile

2. **Business Profile — Activity Signals Integration**
   - Current: "Hosted X events" and "Active this month" appear after stats
   - Better: Could integrate with verified badge or create trust badge group
   - **Why out of scope:** Requires component restructuring

3. **Event Detail — ReviewSummary in Info Grid**
   - Current: ReviewSummary in Info Grid, ReviewsSection below
   - Better: Could combine or remove ReviewSummary from Info Grid
   - **Why out of scope:** Changes information architecture significantly

4. **Property Detail — "Nearby Hotspots" Integration**
   - Current: Feels disconnected after location
   - Better: Could be in sidebar or better visually separated
   - **Why out of scope:** Requires layout restructuring

5. **Properties Listing — Functional Filters**
   - Current: Filter button non-functional
   - Better: Add filter dropdown/modal functionality
   - **Why out of scope:** Requires new functionality/API changes

6. **Property Detail — Gallery Empty State**
   - Current: Empty image placeholders when images missing
   - Better: Conditional rendering based on image count
   - **Why out of scope:** Requires logic changes, may affect layout

---

**Audit Complete. Ready for implementation of approved changes.**

