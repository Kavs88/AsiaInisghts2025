# Review Integration Guide

## Integration Steps Completed

### ✅ 1. Reviews Section Component Created
- `app/businesses/[slug]/reviews-section.tsx` - Client component for reviews section

### ⏳ 2. Business Profile Integration (Next)
- Add ReviewSummary to header (fetch summary server-side)
- Add Reviews section after Gallery section
- Import and use ReviewsSection component

### ⏳ 3. Seller Profile Integration (Next)
- Add ReviewSummary to header (fetch summary server-side)
- Replace placeholder reviews tab content with ReviewTab component
- Add ReviewModal trigger button

## Files to Modify

### Business Profile:
1. `app/businesses/[slug]/page.tsx` - Add ReviewSummary to header, add Reviews section

### Seller Profile:
1. `app/markets/sellers/[slug]/page.tsx` - Fetch review summary, pass to client
2. `app/markets/sellers/[slug]/page-client.tsx` - Add ReviewSummary to header, replace reviews tab

## Review Summary API

Fetch review summary server-side:
```typescript
const summaryResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/reviews/summary?subject_id=${id}&subject_type=business`)
const summary = await summaryResponse.json()
```

Or use Supabase directly (faster):
```typescript
const { data } = await supabase
  .from('review_summaries')
  .select('*')
  .eq('subject_id', id)
  .eq('subject_type', 'business')
  .maybeSingle()
```





