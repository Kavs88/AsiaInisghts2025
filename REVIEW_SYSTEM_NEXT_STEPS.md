# Review System - Integration Next Steps

## ✅ What's Complete

All core components and APIs are built and ready:

1. ✅ Database schema and migration
2. ✅ All API routes (GET, POST, PUT, DELETE, helpful votes, summary)
3. ✅ All UI components (StarRating, ReviewSummary, ReviewCard, ReviewTab, ReviewModal)

## 🎯 Ready for Integration

The review system is now ready to be integrated into:

1. **Business Profile Pages** (`app/businesses/[slug]/page.tsx`)
2. **Vendor Profile Pages** (`app/vendors/[slug]/page.tsx`)
3. **Market Day Pages** (`app/markets/market-days/[id]/page.tsx`)

## 📝 Integration Checklist

For each profile type:

- [ ] Add Review Summary to header (using `ReviewSummary` component)
- [ ] Add "Leave a Review" button (opens `ReviewModal`)
- [ ] Add Review Tab (using `ReviewTab` component)
- [ ] Fetch review summary data (from `/api/reviews/summary`)
- [ ] Handle review creation success (refresh reviews)

## 🚀 Quick Start Integration

### Example: Adding to Business Profile

```tsx
// 1. Import components
import ReviewSummary from '@/components/ui/ReviewSummary'
import ReviewTab from '@/components/ui/ReviewTab'
import ReviewModal from '@/components/ui/ReviewModal'

// 2. Fetch summary (server-side or client-side)
const summary = await fetch(`/api/reviews/summary?subject_id=${business.id}&subject_type=business`)

// 3. Add to header
<ReviewSummary 
  averageRating={summary.average_rating}
  totalReviews={summary.total_reviews}
/>

// 4. Add Review Tab
<ReviewTab
  subjectId={business.id}
  subjectType="business"
  currentUserId={user?.id}
  onReviewCreate={() => {/* refresh */}}
/>

// 5. Add Modal
<ReviewModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  subjectId={business.id}
  subjectType="business"
  subjectName={business.name}
  onSuccess={() => {/* refresh reviews */}}
/>
```

## 📦 All Files Created

- `supabase/migrations/014_reviews_and_trust_system.sql`
- `app/api/reviews/route.ts`
- `app/api/reviews/[id]/route.ts`
- `app/api/reviews/[id]/helpful/route.ts`
- `app/api/reviews/summary/route.ts`
- `components/ui/StarRating.tsx`
- `components/ui/ReviewSummary.tsx`
- `components/ui/ReviewCard.tsx`
- `components/ui/ReviewTab.tsx`
- `components/ui/ReviewModal.tsx`

**Next:** Integrate into profile pages! 🎉





