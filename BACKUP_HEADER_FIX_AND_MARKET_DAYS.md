# Backup: Header Fix & Market Days Management - December 13, 2025

## Summary
This backup documents the header navigation fix and the new market days management system with venue profiles.

## Header Navigation Fix

### Issue Fixed
- Header was "blipping" or glitching when navigating between vendors and products pages
- Loading spinner was appearing during navigation
- Account button was changing size causing layout shifts
- Menus weren't closing on navigation

### Changes Made to `components/ui/Header.tsx`

1. **Added `usePathname` hook** to detect navigation
2. **Added `hasInitiallyLoaded` state** to only show loading spinner on initial page load
3. **Fixed account button dimensions** - All states now use consistent size:
   - Loading: `w-9 h-9 xl:w-10 xl:h-10`
   - Logged in: `w-9 h-9 xl:w-10 xl:h-10`
   - Logged out: `w-9 h-9 xl:w-10 xl:h-10`
4. **Auto-close menus on navigation** - Mobile menu and account menu close when pathname changes
5. **Stabilized SearchBar fallback** - Removed `animate-pulse` from Suspense fallback

### Key Code Changes
```typescript
// Added imports
import { useRouter, usePathname } from 'next/navigation'

// Added state
const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)

// Track initial load
useEffect(() => {
  if (!loading && !hasInitiallyLoaded) {
    setHasInitiallyLoaded(true)
  }
}, [loading, hasInitiallyLoaded])

// Close menus on navigation
useEffect(() => {
  setIsMobileMenuOpen(false)
  setIsAccountMenuOpen(false)
}, [pathname])

// Only show loading spinner on initial load
{loading && !hasInitiallyLoaded ? (
  <div className="p-2 xl:p-2.5 ml-1 w-9 h-9 xl:w-10 xl:h-10 flex items-center justify-center">
    <div className="w-5 h-5 xl:w-6 xl:h-6 border-2 border-neutral-300 border-t-primary-600 rounded-full animate-spin" />
  </div>
) : ...
```

## Market Days Management System

### New Features Added

1. **Admin Market Days Management Interface**
   - List page: `/admin/market-days`
   - Create page: `/admin/market-days/create`
   - Edit page: `/admin/market-days/[id]/edit`

2. **Venue Profile System**
   - Venue profile pages at `/venues/[slug]`
   - Shows venue logo, description, facilities, contact info
   - Lists upcoming markets at that venue

3. **Database Schema Updates**
   - Migration file: `supabase/add_venue_fields.sql`
   - Adds columns to `market_days` table:
     - `venue_logo_url` (TEXT)
     - `venue_description` (TEXT)
     - `venue_facilities` (JSONB)
     - `venue_website_url` (TEXT)
     - `venue_contact_email` (TEXT)
     - `venue_contact_phone` (TEXT)

### Files Created

**Admin Pages:**
- `app/admin/market-days/page.tsx`
- `app/admin/market-days/page-client.tsx`
- `app/admin/market-days/create/page.tsx`
- `app/admin/market-days/create/page-client.tsx`
- `app/admin/market-days/[id]/edit/page.tsx`
- `app/admin/market-days/[id]/edit/page-client.tsx`

**Venue Profile:**
- `app/venues/[slug]/page.tsx`

**Database:**
- `supabase/add_venue_fields.sql`

**Query Functions:**
- `getVenueByLocationName()` added to `lib/supabase/queries.ts`

### Supabase Migration Required

**File:** `supabase/add_venue_fields.sql`

Run this SQL in Supabase SQL Editor to add venue fields to the `market_days` table.

## Homepage Image Update

- Hero background image changed from Unsplash placeholder to `/images/Stalls 6.jpg`
- File: `app/page.tsx` line 99

## Known Issues

⚠️ **CRITICAL:** The `lib/supabase/queries.ts` file was accidentally overwritten and needs to be restored from git. It currently only contains `getVenueByLocationName()` but should have all query functions.

**Required functions that need to be restored:**
- `getVendors()`
- `getProducts()`
- `getVendorBySlug()`
- `getVendorProducts()`
- `getVendorPortfolio()`
- `getUpcomingMarketDays()`
- `getMarketDayWithVendors()`
- `getVendorsAttendingMarket()`
- `searchProducts()`
- `getProductBySlug()`
- `createOrderWithItems()`
- `getCustomerOrderIntents()`
- `updateOrderIntentStatus()`
- `getVendorsAttendanceStatus()`
- `getVendorNextMarketAttendance()`
- `getVendorOrderIntents()`
- `getVenueByLocationName()` (newly added)

## Next Steps

1. Restore `lib/supabase/queries.ts` from git
2. Run `supabase/add_venue_fields.sql` in Supabase
3. Add link to market days management in admin dashboard
4. Update homepage/market-days page to show venue logos
5. Incorporate function from other project (pending user direction)

## Testing Checklist

- [x] Header no longer glitches on navigation
- [x] Account button maintains consistent size
- [x] Menus close on navigation
- [ ] Market days admin interface works
- [ ] Venue profile pages display correctly
- [ ] Database migration applied successfully


