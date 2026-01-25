# Mobile Button Overlap Issue - Diagnostic Report

**Date:** December 16, 2024  
**Location:** `/app/sellers/[slug]/page.tsx` - Vendor Profile Header  
**Issue:** Contact, Email, and Share buttons overlapping on mobile view  
**Status:** Persistent after multiple fix attempts

---

## Problem Description

On mobile viewports (typically < 640px), the vendor profile header buttons (Contact, Email, Share) are overlapping or not displaying correctly. The buttons should be visible and properly spaced, but they appear to be colliding or cut off.

**Expected Behavior:**
- Buttons should be visible on mobile
- Buttons should have proper spacing (no overlap)
- Buttons should be touch-friendly (44px minimum)
- Layout should be responsive and work on all mobile screen sizes

**Actual Behavior:**
- Buttons appear to overlap or be cut off
- Icons may not be visible
- Layout breaks on mobile viewports

---

## Current Code Structure

### File: `app/sellers/[slug]/page.tsx` (Lines 185-268)

```tsx
{/* Shop Header - Inline identity block */}
<section className="relative bg-white border-b border-neutral-100 overflow-visible">
  <div className="container-custom max-w-7xl overflow-visible">
    <div className="pt-12 sm:pt-16 lg:pt-20 pb-12">
      {/* Identity Block - Inline Layout (Logo + Name + Buttons) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
        {/* Logo + Name Row on Mobile */}
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-1 min-w-0">
          {/* Logo */}
          <div className="flex-shrink-0">
            {/* Logo image or placeholder */}
          </div>
          {/* Name + Verified Badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <h1 className="text-2xl ... truncate">{mappedVendor.name}</h1>
            {/* Verified badge */}
          </div>
        </div>

        {/* Contact & Share buttons - Grid on mobile, flex on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto sm:justify-end">
          {/* Edit Profile Button (conditional) */}
          {isOwnProfile && (
            <Link className="... h-11 w-full sm:h-auto sm:w-auto ...">
              {/* Icon + text */}
            </Link>
          )}
          {/* Contact Button (conditional) */}
          {mappedVendor.contactPhone && (
            <a className="... h-11 w-full sm:h-auto sm:w-auto ...">
              {/* Icon + text */}
            </a>
          )}
          {/* Email Button (conditional) */}
          {mappedVendor.contactEmail && (
            <a className="... h-11 w-full sm:h-auto sm:w-auto ...">
              {/* Icon + text */}
            </a>
          )}
          {/* Share Button (always present) */}
          <ShareButton vendorName={mappedVendor.name} />
        </div>
      </div>
    </div>
  </div>
</section>
```

### File: `components/ui/ShareButton.tsx`

```tsx
<button
  className="flex items-center justify-center gap-0 sm:gap-2 p-0 sm:px-5 sm:py-3 ... h-11 w-full sm:h-auto sm:w-auto ... col-span-2 sm:col-span-1"
>
  {/* Share icon + text */}
</button>
```

---

## CSS Constraints Analysis

### Global CSS (`app/globals.css`)

**Critical Constraint:**
```css
.container-custom {
  @apply max-w-7xl mx-auto px-3 sm:px-4 lg:px-6;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;  /* ⚠️ THIS IS THE PROBLEM */
}
```

**Additional Constraints:**
```css
html {
  overflow-x: hidden;  /* Applied globally */
}

body {
  overflow-x: hidden;  /* Applied globally */
  max-width: 100vw;
}
```

### The Problem

1. **`container-custom` has `overflow-x: hidden`** - This is defined in `globals.css` line 40
2. **We added `overflow-visible` to the div** - But CSS specificity means the class definition may win
3. **Grid layout with `grid-cols-2`** - Should work, but may be constrained by parent overflow
4. **Buttons have `w-full` on mobile** - Should fill grid cells, but may be clipped

---

## Attempted Fixes (All Failed)

### Attempt 1: Text Truncation
- Added `truncate` to vendor name
- Added `line-clamp-1` to vendor name
- **Result:** Text no longer overlaps, but buttons still overlap

### Attempt 2: Touch Target Sizing
- Changed buttons from `w-10 h-10` to `w-11 h-11` (44px)
- **Result:** Buttons are correct size, but still overlap

### Attempt 3: Sticky Offset Fixes
- Fixed VendorStripe positioning
- **Result:** Unrelated to button overlap issue

### Attempt 4: Padding Removal
- Removed padding on mobile (`p-0` on mobile, `sm:px-5` on desktop)
- **Result:** Buttons are exact 44px, but still overlap

### Attempt 5: Gap Adjustments
- Changed gap from `gap-2` to `gap-2.5`
- **Result:** Slightly better spacing, but overlap persists

### Attempt 6: Negative Margins
- Added `-mx-1` to extend beyond container
- **Result:** Buttons get clipped by `overflow-x: hidden`

### Attempt 7: Overflow Visible
- Added `overflow-visible` to section and container divs
- **Result:** May not override `container-custom` class specificity

### Attempt 8: CSS Grid Layout
- Changed from `flex` to `grid grid-cols-2` on mobile
- **Result:** Grid should prevent overlap, but issue persists

---

## Root Cause Analysis

### Primary Suspect: CSS Specificity Conflict

**The Issue:**
- `.container-custom` class has `overflow-x: hidden` defined in `globals.css`
- We're trying to override with `overflow-visible` inline class
- Tailwind's `overflow-visible` may not have enough specificity to override the `@apply` rule

**CSS Cascade:**
```
.container-custom (globals.css) → overflow-x: hidden
+ overflow-visible (Tailwind class) → May not override @apply rule
= Result: overflow-x: hidden wins, buttons get clipped
```

### Secondary Issues:

1. **Grid Column Count Mismatch:**
   - Using `grid-cols-2` but potentially have 3-4 buttons
   - ShareButton has `col-span-2` which may cause layout issues
   - If 3 buttons in 2-column grid: 2 in row 1, 1 in row 2 (should work)
   - If 4 buttons: 2 per row (should work)

2. **Conditional Button Rendering:**
   - Edit Profile: Only if `isOwnProfile`
   - Contact: Only if `contactPhone` exists
   - Email: Only if `contactEmail` exists
   - Share: Always present
   - **Problem:** Grid layout doesn't adapt to variable button count

3. **Container Padding:**
   - Mobile: `px-3` (12px each side = 24px total)
   - Available width on 320px screen: 320 - 24 = 296px
   - 2 buttons at 44px each + gap: (44 × 2) + 8 = 96px (should fit)
   - **But:** Grid with `w-full` should handle this automatically

---

## Technical Details

### Current Button Classes (Mobile)

**Contact Button:**
```tsx
className="... h-11 w-full ... p-0 ..."
```
- Height: 44px (h-11)
- Width: 100% (w-full) - fills grid cell
- Padding: 0 (p-0) - no padding on mobile
- Gap: 0 (gap-0) - no gap between icon and text on mobile

**Email Button:**
```tsx
className="... h-11 w-full ... p-0 ..."
```
- Same as Contact

**Share Button:**
```tsx
className="... h-11 w-full ... p-0 ... col-span-2 sm:col-span-1"
```
- Same as others
- **BUT:** `col-span-2` makes it span 2 columns on mobile
- This could cause layout issues if grid expects 2 columns

### Grid Layout

**Mobile:**
```tsx
className="grid grid-cols-2 ..."
```
- Creates 2 equal columns
- Each button should take 1 column (50% width)
- ShareButton spans 2 columns (100% width) - **This is the issue!**

**The Problem:**
- If we have 3 buttons (Contact, Email, Share) in a 2-column grid:
  - Contact: Column 1
  - Email: Column 2
  - Share: Spans columns 1-2 (full width, new row)
  - **This should work, but ShareButton's `col-span-2` may be causing issues**

---

## Potential Solutions (Not Yet Tried)

### Solution 1: Remove col-span-2 from ShareButton
**Rationale:** ShareButton shouldn't span 2 columns if we want equal button sizes
```tsx
// Remove col-span-2, let it be a normal grid item
className="... h-11 w-full ..." // Remove col-span-2
```

### Solution 2: Use CSS !important Override
**Rationale:** Force overflow-visible to override container-custom
```tsx
<div className="container-custom max-w-7xl" style={{ overflowX: 'visible' }}>
```

### Solution 3: Break Out of Container
**Rationale:** Move buttons outside container-custom wrapper
```tsx
<div className="container-custom">
  {/* Logo + Name */}
</div>
<div className="px-3 sm:px-4 lg:px-6"> {/* Manual padding */}
  {/* Buttons */}
</div>
```

### Solution 4: Use Flexbox with Explicit Sizing
**Rationale:** Abandon grid, use flex with explicit min-widths
```tsx
<div className="flex gap-2 w-full">
  <button className="flex-1 min-w-[44px] h-11">Contact</button>
  <button className="flex-1 min-w-[44px] h-11">Email</button>
  <button className="flex-1 min-w-[44px] h-11">Share</button>
</div>
```

### Solution 5: Use CSS Custom Properties
**Rationale:** Override container-custom overflow via CSS variable
```css
.container-custom {
  overflow-x: var(--container-overflow, hidden);
}
```

### Solution 6: Conditional Grid Columns
**Rationale:** Adjust grid columns based on button count
```tsx
const buttonCount = [isOwnProfile, contactPhone, contactEmail, true].filter(Boolean).length
<div className={`grid grid-cols-${buttonCount <= 2 ? 2 : 3} ...`}>
```

---

## Recommended Next Steps

### Immediate Action:
1. **Remove `col-span-2` from ShareButton** - This is likely causing the layout issue
2. **Use inline style for overflow** - `style={{ overflowX: 'visible' }}` to override CSS class
3. **Test with fixed button count** - Temporarily show all buttons to verify grid works

### If Still Failing:
1. **Break buttons out of container-custom** - Use manual padding instead
2. **Use flexbox with flex-1** - Equal width buttons that can't overlap
3. **Consider horizontal scroll** - If buttons truly can't fit, allow scrolling

### Debugging Steps:
1. Inspect element in browser DevTools
2. Check computed styles for `overflow-x` value
3. Verify grid is actually being applied (check `display: grid`)
4. Check if buttons are being rendered (check DOM)
5. Verify button widths are correct (should be ~50% each in 2-col grid)

---

## Code to Test

### Test 1: Remove col-span-2
```tsx
// ShareButton.tsx - Remove col-span-2
className="... h-11 w-full ..." // Remove col-span-2 sm:col-span-1
```

### Test 2: Force Overflow Visible
```tsx
// page.tsx - Use inline style
<div className="container-custom max-w-7xl" style={{ overflowX: 'visible' }}>
```

### Test 3: Simplify Grid
```tsx
// Use auto-fit for flexible columns
<div className="grid grid-cols-[repeat(auto-fit,minmax(44px,1fr))] ...">
```

---

## Environment Details

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Container System:** Custom `.container-custom` class
- **Mobile Breakpoint:** `sm:` = 640px
- **Container Padding (Mobile):** `px-3` = 12px each side
- **Button Size (Mobile):** 44px × 44px (h-11 w-11)
- **Grid Gap:** `gap-2` = 8px

---

## Files Involved

1. **`app/sellers/[slug]/page.tsx`** (Lines 185-268) - Main layout
2. **`components/ui/ShareButton.tsx`** - Share button component
3. **`app/globals.css`** (Line 35-41) - Container-custom definition

---

## Summary

**The Issue:** Buttons overlap on mobile despite multiple fix attempts.

**Root Cause:** Likely a combination of:
1. CSS specificity conflict (`container-custom` overflow-x: hidden overriding overflow-visible)
2. ShareButton's `col-span-2` causing grid layout issues
3. Grid column count may not match actual button count

**Next Steps:** 
1. Remove `col-span-2` from ShareButton
2. Use inline style to force `overflow-x: visible`
3. Consider breaking buttons out of container-custom if needed
4. Test with browser DevTools to verify actual computed styles

**Status:** Ready for external review and fresh perspective.


