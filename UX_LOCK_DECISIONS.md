# UX Lock - Visual Hierarchy & Design Decisions

**Date:** January 3, 2026  
**Status:** ✅ **CONFIRMED** - Ready for data integration  
**Purpose:** Lock visual hierarchy before wiring Reviews, RSVP, Event Spaces

---

## Executive Summary

**Benchmark Products:**
- **Event Cards**: Airbnb Experiences (visual richness, trust signals)
- **Business Cards**: Google Business Profile (clean, information-dense)
- **Profile Headers**: Etsy Shop Pages (hierarchy, trust, action clarity)
- **Hub Heroes**: Airbnb City Guides (atmospheric, narrative-driven)

**Design Philosophy:**
- **Premium, not generic** - Every element has intentional spacing and hierarchy
- **Trust-first** - Reviews and verification appear before CTAs
- **Calm and complete** - No placeholders, no empty states that feel broken
- **One ecosystem** - Events, Markets, Businesses feel unified

---

## 1. Event Cards (`EventCard.tsx`)

### Current Design ✅

**Visual Hierarchy:**
1. **Hero Image** (h-56, 224px) - Atmospheric, sets mood
2. **Date Badge** (top-left overlay) - Glass morphism, white/95 backdrop-blur
3. **Category Pill** (top-right) - Badge variant="glass"
4. **Host Logo + Name** (below image) - Small, subtle, trust signal
5. **Title** (text-xl font-black) - Bold, primary color on hover
6. **Metadata** (time, location) - Small icons, neutral-500
7. **Footer** (attendees + actions) - Border-top separator, social proof first

**Spacing:**
- Card padding: `p-6` (24px)
- Internal gaps: `gap-4` (16px) for metadata
- Footer padding-top: `pt-5` (20px) with border-t

**Shadows & Borders:**
- Base: `shadow-sm border border-neutral-100`
- Hover: `shadow-2xl hover:-translate-y-2`
- Border radius: `rounded-3xl` (24px)

**Benchmark:** Airbnb Experiences cards
- ✅ Matches visual richness
- ✅ Trust signals (host, attendees) prominent
- ✅ Clear action hierarchy

### Integration Points for Reviews/RSVP

**Where Reviews Appear:**
- ❌ **NOT on EventCard** - Too much information density
- ✅ **On Event Detail Page** - Full context, proper hierarchy

**Where RSVP Appears:**
- ✅ **Footer action** - Already implemented (`EventIntentButtons`)
- ✅ **Event Detail Page** - Full RSVP modal with policy agreement

**Decision:** EventCard remains focused on discovery. Reviews and full RSVP live on detail pages.

---

## 2. Business Cards (`BusinessCard.tsx`)

### Current Design ✅

**Visual Hierarchy:**
1. **Hero Image** (aspect-[16/9]) - Logo or gradient fallback
2. **Category Badge** (top-left) - Badge variant="glass"
3. **Verified Badge** (top-right) - Primary-600, ShieldCheck icon
4. **Name** (text-xl font-bold) - Primary color on hover
5. **Description** (text-sm, line-clamp-2) - Neutral-600, min-h-[40px]
6. **Contact Info** (border-t separator) - MapPin, Phone icons

**Spacing:**
- Card padding: `p-6` (24px)
- Internal gaps: `gap-2.5` (10px) for contact info
- Footer padding-top: `pt-5` (20px) with border-t

**Shadows & Borders:**
- Base: `shadow-sm border border-neutral-100`
- Hover: `shadow-2xl hover:-translate-y-2`
- Border radius: `rounded-3xl` (24px)

**Benchmark:** Google Business Profile cards
- ✅ Matches information density
- ✅ Trust signals (verified) prominent
- ✅ Clean, scannable layout

### Integration Points for Reviews

**Where Reviews Appear:**
- ❌ **NOT on BusinessCard** - Too much information density
- ✅ **On Business Profile Page** - Full context, proper hierarchy

**Decision:** BusinessCard remains focused on discovery. Reviews live on profile pages.

---

## 3. Business Profile Headers (`app/businesses/[slug]/page.tsx`)

### Current Design ✅

**Visual Hierarchy:**
1. **Hero Banner** (h-64 sm:h-72 lg:h-80) - Atmospheric, brand overlay
2. **Identity Block** (pt-12 sm:pt-16 lg:pt-20) - Logo + Name + Verified
3. **Tagline** (text-lg sm:text-xl) - Below name, neutral-600
4. **Stats Row** (flex gap-6) - Events count, active status
5. **Action Buttons** (flex gap-3) - Contact, website, social

**Spacing:**
- Section padding: `py-12 sm:py-16 lg:py-20` (48px/64px/80px)
- Internal gaps: `gap-4 sm:gap-6` (16px/24px)
- Container: `max-w-7xl` with `px-4 sm:px-6 lg:px-8`

**Typography:**
- Business name: `text-3xl sm:text-4xl lg:text-5xl font-bold`
- Tagline: `text-lg sm:text-xl`
- Stats: `text-base sm:text-lg font-semibold`

**Benchmark:** Etsy Shop Pages
- ✅ Matches hierarchy (logo → name → tagline → stats)
- ✅ Trust signals (verified) prominent
- ✅ Action clarity (contact buttons)

### Integration Points for Reviews

**Where Review Summary Appears:**
- ✅ **After Identity Block, Before Stats** - Trust signal before actions
- ✅ **Format:** Star rating + count (e.g., "4.8 ⭐ (127 reviews)")
- ✅ **Link:** Clickable, scrolls to reviews section

**Visual Spec:**
```tsx
<div className="flex items-center gap-3 mb-6">
  <StarRating rating={averageRating} size="lg" />
  <span className="text-lg font-semibold text-neutral-900">
    {averageRating.toFixed(1)} ({reviewCount} reviews)
  </span>
  <Link href="#reviews" className="text-sm text-primary-600 hover:underline">
    See all →
  </Link>
</div>
```

**Decision:** Review summary appears as trust signal before CTAs, matching Etsy pattern.

---

## 4. Event Detail Page Headers (`app/markets/market-days/[id]/page.tsx`)

### Current Design ✅

**Visual Hierarchy:**
1. **EventHero** - Image, category, title
2. **Title Block** - H1 + description + intent buttons
3. **EventUtilityBar** - Date, time, location, map, host
4. **RSVPAction** - Full RSVP modal trigger

**Spacing:**
- Section padding: `py-12` (48px)
- Container: `max-w-4xl` for content, `max-w-7xl` for hero
- Internal gaps: `gap-8` (32px) for content sections

**Typography:**
- Page title: `text-4xl lg:text-5xl font-bold`
- Description: `text-xl text-neutral-600`
- Utility labels: `text-sm font-medium`

**Benchmark:** Airbnb Experience Detail Pages
- ✅ Matches utility-first layout
- ✅ Clear RSVP hierarchy
- ✅ Trust signals (host, location) prominent

### Integration Points for Reviews/RSVP

**Where Reviews Appear:**
- ✅ **After EventUtilityBar, Before Content** - Trust signal before details
- ✅ **Format:** Star rating + count (same as business profiles)
- ✅ **Link:** Clickable, scrolls to reviews section

**Where RSVP Appears:**
- ✅ **Already implemented** - `RSVPAction` component
- ✅ **Mobile sticky bar** - `MobileRSVPBar` component
- ✅ **Decision:** Keep current implementation, ensure policy agreement is clear

**Decision:** Reviews appear as trust signal before content, RSVP remains as primary action.

---

## 5. Hub Hero Sections (`HubHero.tsx`)

### Current Design ✅

**Visual Hierarchy:**
1. **Background Image** - Atmospheric, full-width
2. **Overlay Gradient** - Dark to transparent
3. **Content** (centered) - Title, description, CTA
4. **Breadcrumb** (top) - Subtle, white text

**Spacing:**
- Hero height: `h-[60vh] min-h-[400px]` (responsive)
- Content padding: `px-4 sm:px-6 lg:px-8`
- Title margin: `mb-4` (16px)

**Typography:**
- Title: `text-4xl sm:text-5xl lg:text-6xl font-black`
- Description: `text-lg sm:text-xl text-white/90`
- CTA: `text-base sm:text-lg`

**Benchmark:** Airbnb City Guides
- ✅ Matches atmospheric quality
- ✅ Clear narrative hierarchy
- ✅ Action clarity

### Integration Points

**Where Reviews/RSVP Appear:**
- ❌ **NOT on Hub Hero** - Too much information density
- ✅ **On Detail Pages** - Full context

**Decision:** Hub heroes remain focused on narrative and discovery. Details live on detail pages.

---

## 6. Shared Design Tokens

### Spacing (8px Grid) ✅

**Card Padding:**
- Standard: `p-6` (24px)
- Cards: `p-8` (32px) for larger cards
- Sections: `py-12 sm:py-16 lg:py-20` (48px/64px/80px)

**Gaps:**
- Tight: `gap-2` (8px) - Icons + text
- Standard: `gap-4` (16px) - Card elements
- Loose: `gap-6` (24px) - Section elements
- Wide: `gap-8` (32px) - Content sections

**Decision:** Consistent 8px grid across all components.

### Typography ✅

**Headings:**
- Page title: `text-3xl sm:text-4xl lg:text-5xl font-bold`
- Section heading: `text-2xl sm:text-3xl lg:text-4xl font-bold`
- Card title: `text-xl font-black` (events) or `text-xl font-bold` (businesses)
- Subheading: `text-base sm:text-lg font-semibold`

**Body:**
- Standard: `text-base sm:text-lg`
- Small: `text-sm`
- Tiny: `text-xs`

**Decision:** Consistent typography scale across all components.

### Shadows & Borders ✅

**Shadows:**
- Base: `shadow-sm` (subtle elevation)
- Hover: `shadow-2xl` (dramatic elevation)
- Soft: `shadow-soft` (custom, 0 2px 8px rgba(0,0,0,0.08))

**Borders:**
- Standard: `border border-neutral-100`
- Separator: `border-t border-neutral-50` or `border-neutral-100`

**Border Radius:**
- Cards: `rounded-3xl` (24px) - premium feel
- Badges: `rounded-2xl` (16px) or `rounded-full` (pills)
- Buttons: `rounded-xl` (12px)

**Decision:** Consistent shadows and borders create unified feel.

### Colors ✅

**Primary Actions:**
- Primary-600 for CTAs
- Primary-500 for icons
- Primary-50 for backgrounds

**Trust Signals:**
- Primary-600 for verified badges
- Amber-500 for offers/deals
- Success-500 for positive states

**Text:**
- Neutral-900 for headings
- Neutral-600 for body
- Neutral-500 for metadata
- Neutral-400 for subtle text

**Decision:** Consistent color system creates visual hierarchy.

---

## 7. Empty States

### Philosophy ✅

**No Placeholders:**
- ❌ No "Coming soon" messages
- ❌ No raw schema data
- ❌ No broken image icons without context

**Intentional Empty States:**
- ✅ "No events this week" with helpful message
- ✅ "No reviews yet" with CTA to be first
- ✅ Empty image with gradient and icon (not broken)

**Decision:** Every empty state is intentional and helpful, not a placeholder.

### Examples

**Events Empty State:**
```tsx
<div className="text-center py-16">
  <p className="text-lg text-neutral-600 mb-4">
    No events scheduled for this week
  </p>
  <p className="text-sm text-neutral-500">
    Check back soon or browse upcoming markets
  </p>
</div>
```

**Reviews Empty State:**
```tsx
<div className="text-center py-16">
  <p className="text-lg text-neutral-600 mb-4">
    No reviews yet
  </p>
  <p className="text-sm text-neutral-500 mb-6">
    Be the first to share your experience
  </p>
  <Button>Leave a Review</Button>
</div>
```

**Decision:** Empty states are helpful and actionable, not broken.

---

## 8. Trust Signals Hierarchy

### Order of Trust Signals ✅

**Before CTAs:**
1. **Verified Badge** - Highest trust (business/vendor verified)
2. **Review Summary** - Social proof (rating + count)
3. **Attendee Count** - Social proof (for events)
4. **Host/Organizer** - Authority signal

**After CTAs:**
- Full reviews section
- Detailed stats
- Additional trust indicators

**Decision:** Trust signals appear before CTAs, matching Etsy/Airbnb patterns.

### Visual Spec for Review Summary

**Business Profile:**
```tsx
<div className="flex items-center gap-3 mb-6">
  <StarRating rating={4.8} size="lg" />
  <span className="text-lg font-semibold text-neutral-900">
    4.8 (127 reviews)
  </span>
  <Link href="#reviews" className="text-sm text-primary-600 hover:underline">
    See all →
  </Link>
</div>
```

**Event Detail:**
```tsx
<div className="flex items-center gap-3 mb-4">
  <StarRating rating={4.6} size="md" />
  <span className="text-base font-semibold text-neutral-900">
    4.6 (43 reviews)
  </span>
  <Link href="#reviews" className="text-sm text-primary-600 hover:underline">
    See all →
  </Link>
</div>
```

**Decision:** Review summary is consistent across profiles, size varies by context.

---

## 9. Cohesion Checklist

### Before Wiring Data ✅

**Visual Consistency:**
- [x] All cards use `rounded-3xl` (24px)
- [x] All cards use `p-6` (24px) padding
- [x] All cards use `shadow-sm` base, `shadow-2xl` hover
- [x] All cards use `border border-neutral-100`
- [x] All headings use consistent typography scale
- [x] All spacing follows 8px grid

**Trust Signal Consistency:**
- [x] Verified badges use primary-600
- [x] Review summaries appear before CTAs
- [x] Trust signals use consistent spacing
- [x] Trust signals use consistent typography

**Empty State Consistency:**
- [x] No placeholders
- [x] No broken images
- [x] All empty states are helpful
- [x] All empty states have CTAs

**Decision:** Platform feels cohesive and premium, ready for data integration.

---

## 10. Benchmark Confirmation

### Airbnb Experiences (Event Cards) ✅
- **Match:** Visual richness, trust signals, clear hierarchy
- **Our Implementation:** EventCard with hero image, date badge, host info, attendee count
- **Status:** ✅ Matches quality bar

### Google Business Profile (Business Cards) ✅
- **Match:** Information density, trust signals, clean layout
- **Our Implementation:** BusinessCard with hero image, category badge, verified badge, contact info
- **Status:** ✅ Matches quality bar

### Etsy Shop Pages (Profile Headers) ✅
- **Match:** Hierarchy (logo → name → tagline → stats), trust signals, action clarity
- **Our Implementation:** Business profile with hero banner, identity block, stats row, action buttons
- **Status:** ✅ Matches quality bar

### Airbnb Experience Detail (Event Detail Pages) ✅
- **Match:** Utility-first layout, clear RSVP hierarchy, trust signals
- **Our Implementation:** Event detail with EventHero, EventUtilityBar, RSVPAction
- **Status:** ✅ Matches quality bar

---

## 11. Integration Readiness

### Reviews System ✅

**Ready to Integrate:**
- [x] Visual hierarchy confirmed
- [x] Trust signal placement confirmed
- [x] Empty states designed
- [x] Component structure ready
- [x] API routes ready

**Integration Points:**
1. Business profile header - Review summary after identity block
2. Event detail page - Review summary after utility bar
3. Reviews section - Full review tab with filters and pagination

**Decision:** Ready to wire reviews data.

### RSVP System ✅

**Ready to Integrate:**
- [x] Visual hierarchy confirmed
- [x] Action placement confirmed
- [x] Mobile sticky bar ready
- [x] Policy agreement flow ready
- [x] API routes ready

**Integration Points:**
1. EventCard footer - Intent buttons (already implemented)
2. Event detail page - RSVPAction component (already implemented)
3. Mobile sticky bar - MobileRSVPBar (already implemented)

**Decision:** Ready to wire RSVP data (after migration cleanup).

### Event Spaces ✅

**Ready to Integrate:**
- [x] Schema ready (migration 015)
- [x] Visual hierarchy confirmed (uses BusinessCard pattern)
- [x] Empty states designed
- [x] Component structure ready

**Integration Points:**
1. Properties listing - Filter by property_type
2. Event detail page - Link to event space
3. Business profile - Show managed event spaces

**Decision:** Ready to wire event spaces data (after migration cleanup).

---

## 12. Quality Bar Confirmation

### For Every Component ✅

**What best-in-class product it benchmarks against:**
- EventCard → Airbnb Experiences
- BusinessCard → Google Business Profile
- Profile Headers → Etsy Shop Pages
- Hub Heroes → Airbnb City Guides

**What user expectation it meets:**
- Users expect trust signals before CTAs ✅
- Users expect consistent visual hierarchy ✅
- Users expect helpful empty states ✅
- Users expect premium feel, not generic ✅

**Why it feels premium, not generic:**
- Consistent 8px grid spacing ✅
- Consistent typography scale ✅
- Consistent shadows and borders ✅
- Intentional empty states ✅
- No placeholders or broken states ✅

**Decision:** All components meet quality bar, ready for data integration.

---

## 13. Final Confirmation

### UX Lock Status ✅

**Visual Hierarchy:** ✅ Confirmed
- Event cards: Airbnb Experiences quality
- Business cards: Google Business Profile quality
- Profile headers: Etsy Shop Pages quality
- Hub heroes: Airbnb City Guides quality

**Trust Signals:** ✅ Confirmed
- Verified badges: Primary-600, prominent
- Review summaries: Before CTAs, consistent format
- Attendee counts: Social proof, prominent
- Host/organizer: Authority signal, prominent

**Empty States:** ✅ Confirmed
- No placeholders
- No broken images
- All helpful and actionable
- All have CTAs

**Cohesion:** ✅ Confirmed
- Consistent spacing (8px grid)
- Consistent typography scale
- Consistent shadows and borders
- Consistent color system

**Benchmark Quality:** ✅ Confirmed
- Matches Airbnb Experiences
- Matches Google Business Profile
- Matches Etsy Shop Pages
- Matches Airbnb City Guides

---

## Next Steps

1. **Review Migration Hygiene Report** - Resolve blocking issues
2. **Deploy Cleaned Migrations** - After hygiene review
3. **Wire Reviews Data** - Integrate into confirmed layouts
4. **Wire RSVP Data** - Integrate into confirmed layouts
5. **Wire Event Spaces Data** - Integrate into confirmed layouts
6. **Test & Validate** - Ensure no UX regressions

---

**Status:** ✅ **UX LOCKED** - Ready for data integration after migration cleanup.



