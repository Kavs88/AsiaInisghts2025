# Review System - Integration Summary & Next Steps

## ✅ What's Complete

### 1. Database & Schema ✅
- Migration: `014_reviews_and_trust_system.sql` (ready to deploy)
- TypeScript types: `types/database.ts` (complete)
- Reviews table with RLS policies
- Review summaries view
- Verified purchase function

### 2. API Routes ✅
- `GET /api/reviews` - Fetch reviews with pagination/filtering
- `POST /api/reviews` - Create review
- `PUT /api/reviews/[id]` - Update review
- `DELETE /api/reviews/[id]` - Delete review
- `POST /api/reviews/[id]/helpful` - Vote helpful
- `DELETE /api/reviews/[id]/helpful` - Remove helpful vote
- `GET /api/reviews/summary` - Get review summary stats

### 3. UI Components ✅
- `StarRating.tsx` - Interactive star rating
- `ReviewSummary.tsx` - Average rating + count display
- `ReviewCard.tsx` - Individual review card
- `ReviewTab.tsx` - Review listing with filters
- `ReviewModal.tsx` - Leave a review form

### 4. Business Profile Integration ✅
- `app/businesses/[slug]/reviews-section.tsx` - Reviews section component (ready to use)

---

## ⏳ Next Steps: Integration

### Step 1: Deploy Database Migration

Run in Supabase SQL Editor:
```sql
-- Copy contents of: supabase/migrations/014_reviews_and_trust_system.sql
-- Paste and execute in Supabase SQL Editor
```

### Step 2: Integrate into Business Profile

**File:** `app/businesses/[slug]/page.tsx`

1. **Fetch review summary (server-side)** - Add after line 52:
```typescript
// Fetch review summary
const { data: reviewSummary } = await supabase
  .from('review_summaries')
  .select('*')
  .eq('subject_id', biz.id)
  .eq('subject_type', 'business')
  .maybeSingle()
```

2. **Add ReviewSummary to header** (after line 151, in stats row):
```tsx
{reviewSummary && reviewSummary.total_reviews > 0 && (
  <ReviewSummary
    averageRating={reviewSummary.average_rating}
    totalReviews={reviewSummary.total_reviews}
    size="md"
  />
)}
```

3. **Add Reviews section** (after Gallery section, before closing `</div>` at line 297):
```tsx
{/* Reviews */}
<ReviewsSection
  businessId={biz.id}
  businessName={biz.name}
/>
```

4. **Import components** at top:
```typescript
import ReviewSummary from '@/components/ui/ReviewSummary'
import ReviewsSection from './reviews-section'
```

### Step 3: Integrate into Seller Profile

**File:** `app/markets/sellers/[slug]/page.tsx`

1. **Fetch review summary** (around line 118, after activityStats):
```typescript
const { data: reviewSummary } = await supabase
  .from('review_summaries')
  .select('*')
  .eq('subject_id', vendor.id)
  .eq('subject_type', 'vendor')
  .maybeSingle()
```

2. **Pass to client component** - Add to mappedVendor or pass separately

**File:** `app/markets/sellers/[slug]/page-client.tsx`

1. **Replace reviews tab placeholder** (lines 582-595) with:
```tsx
{activeTab === 'reviews' && (
  <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50">
    <div className="container-custom max-w-7xl">
      <ReviewTab
        subjectId={vendor.id}
        subjectType="vendor"
        currentUserId={/* get from props or client-side check */}
        onReviewCreate={() => {/* refresh */}}
      />
    </div>
  </section>
)}
```

2. **Add ReviewSummary to header** (similar to business profile)

3. **Add ReviewModal** with trigger button

---

## 🎯 Quick Integration Checklist

- [ ] Run migration 014 in Supabase
- [ ] Add ReviewSummary to business profile header
- [ ] Add ReviewsSection to business profile page
- [ ] Add ReviewSummary to seller profile header  
- [ ] Replace seller reviews tab placeholder with ReviewTab
- [ ] Add ReviewModal triggers
- [ ] Test review creation
- [ ] Test review display
- [ ] Test helpful votes
- [ ] Test verified badges

---

## 📝 Notes

- Reviews are **live by default** (no moderation required)
- Verified purchase badges appear automatically for users with completed orders
- Helpful votes work immediately
- Review summaries update automatically via view

---

**All components are ready - just need integration!** 🚀





