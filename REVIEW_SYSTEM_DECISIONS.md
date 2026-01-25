# Review System - Design Decisions

## Questions Answered

### 1. Should reviews be enabled for Markets as well?

**Decision: YES** ✅

**Rationale:**
- Market-level reviews provide valuable feedback on overall market experience
- Different from vendor/business reviews (atmosphere, organization, variety)
- Supports community trust building at multiple levels
- Implementation: Added `'market_day'` to `subject_type` CHECK constraint

**Implementation:**
- `subject_type` includes: `'business'`, `'vendor'`, `'market_day'`
- Verified purchase for markets checks RSVP status (`going` or `interested`)
- Review summaries can aggregate at market level

---

### 2. Admin Moderation vs. Live Reviews?

**Decision: Live Reviews with Report Button** ✅

**Rationale:**
- Faster trust building (reviews appear immediately)
- Better UX (no waiting for moderation)
- Community-driven with report functionality
- Status workflow: `published` → `reported` → `hidden` (admin action)

**Implementation:**
- Default status: `'published'` (live immediately)
- Status options: `'published'`, `'reported'`, `'hidden'`
- Public can only see `published` reviews (RLS policy)
- Admins can manage all statuses
- Future: Add report review functionality (creates `reported` status)

---

## Schema Enhancements Made

### Beyond Original Proposal:

1. **Status Field**
   - Added `status` for moderation workflow
   - Values: `'published'`, `'reported'`, `'hidden'`
   - Default: `'published'` (live reviews)

2. **Helpful Votes System**
   - Added `helpful_count` to reviews table
   - Created `review_helpful_votes` junction table
   - Trigger automatically updates `helpful_count`
   - Community can vote reviews as helpful

3. **Review Summaries View**
   - Aggregated statistics view
   - Includes: total_reviews, average_rating, star distribution
   - Verified reviews count
   - Latest review timestamp

4. **Enhanced Verification**
   - Function: `check_verified_purchase()`
   - For businesses/vendors: Checks orders table
   - For market_day: Checks RSVP status
   - Returns boolean for `is_verified` flag

5. **Comprehensive Indexes**
   - Performance indexes for common queries
   - Composite indexes for filtered queries
   - Indexes on status, rating, created_at

---

## RLS Policies

### Reviews Table:
- ✅ Public: Read published reviews only
- ✅ Authenticated: Create own reviews
- ✅ Users: Update/delete own reviews
- ✅ Admins: Full management (all statuses)

### Review Helpful Votes:
- ✅ Public: Read votes (for counts)
- ✅ Authenticated: Vote helpful (insert)
- ✅ Users: Remove own vote (delete)

---

## Next Steps

1. ✅ Migration created (`014_reviews_and_trust_system.sql`)
2. ⏳ Add TypeScript types to `types/database.ts`
3. ⏳ Create API routes (`/api/reviews`)
4. ⏳ Build UI components (ReviewTab, ReviewSummary, ReviewModal, StarRating)
5. ⏳ Integrate into Business/Vendor/Market Day profiles
6. ⏳ Implement verified purchase badge logic





