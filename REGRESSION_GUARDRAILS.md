# Regression Guardrails & High-Risk Components

**Last Updated:** December 2024  
**Purpose:** Prevent reintroduction of layout bugs, clipping issues, and accessibility regressions

---

## Z-Index Scale

**Location:** `app/globals.css` (documented in comments)

Use this scale to prevent z-index conflicts:

- `z-10`: Card overlays, badges, tooltips
- `z-20`: Product card hover overlays
- `z-30`: Interactive elements within cards
- `z-40`: Sticky elements (VendorStripe, filters)
- `z-50`: MegaMenu, Modal backdrop, Toast
- `z-[9998]`: Cart drawer backdrop
- `z-[9999]`: Main header, Cart drawer, SearchBar overlay
- `z-[10000]`: Dropdowns, Account menu, SearchBar results
- `z-[10001]`: Modal content, CustomerInfoModal, SubmitOrderModal

**Rule:** Never exceed `z-[10001]` without documenting why.

---

## Container Overflow Rules

**Location:** `app/globals.css` (`.container-custom` class)

### Critical Rule

**`.container-custom` has `overflow-x: hidden`** to prevent horizontal scroll.

### Components That MUST Be Outside Container

These components **must never** be inside `.container-custom` because they need to extend or be fully visible:

1. **Action Buttons** (`app/sellers/[slug]/page.tsx`)
   - Contact, Email, Share buttons
   - **Why:** Buttons get clipped on mobile if inside container
   - **Solution:** Place buttons in separate div with matching padding

2. **Wide Tables** (if any)
   - Tables that need horizontal scroll
   - **Why:** Container clipping prevents scroll
   - **Solution:** Use `overflow-x-auto` on table wrapper outside container

### Components Safe Inside Container

- Text content
- Images
- Cards
- Forms (with max-width constraints)
- Grids

---

## High-Risk Components

### 1. **Vendor Profile Action Buttons** ⚠️ CRITICAL

**File:** `app/sellers/[slug]/page.tsx` (lines 230-272)

**Why It's Fragile:**
- Buttons were previously clipped on mobile due to container overflow
- Structure depends on buttons being outside `.container-custom`
- Multiple conditional buttons (Edit, Contact, Email, Share) with variable counts

**What Must NOT Be Changed:**
- ❌ DO NOT move buttons inside `.container-custom`
- ❌ DO NOT remove `overflow-x: hidden` from `.container-custom`
- ❌ DO NOT use fixed widths that break on 2-4 button scenarios
- ❌ DO NOT remove `flex-wrap` on mobile

**What to Test After Edits:**
1. Test on 320px width (iPhone SE) with 2 buttons
2. Test on 375px width (iPhone 12/13) with 4 buttons
3. Verify no horizontal scroll
4. Verify all buttons fully visible (no clipping)
5. Verify buttons don't overlap text/logo
6. Test desktop layout unchanged

**Guardrail Comment:** ✅ Added to code

---

### 2. **Header Touch Targets** ⚠️ HIGH RISK

**File:** `components/ui/Header.tsx`

**Why It's Fragile:**
- WCAG 2.5.5 requires 44px minimum touch targets
- Multiple buttons (Cart, Account, Mobile Menu) must maintain size
- Easy to accidentally reduce size when styling

**What Must NOT Be Changed:**
- ❌ DO NOT reduce button sizes below `w-11 h-11` (44px)
- ❌ DO NOT remove padding that makes buttons smaller
- ❌ DO NOT use `w-10 h-10` or smaller
- ❌ DO NOT remove `p-2.5` padding

**What to Test After Edits:**
1. Test all header buttons on mobile (320px-375px)
2. Verify buttons are easily tappable
3. Verify no overlap between buttons
4. Test account menu positioning (doesn't clip)

**Guardrail Comment:** ✅ Added to code

---

### 3. **VendorCard Text Overflow** ⚠️ MEDIUM RISK

**File:** `components/ui/VendorCard.tsx`

**Why It's Fragile:**
- Long vendor names can break layout
- Category badges can overflow
- Taglines can wrap awkwardly

**What Must NOT Be Changed:**
- ❌ DO NOT remove `line-clamp-1` from vendor name
- ❌ DO NOT remove `truncate max-w-[120px]` from category badge
- ❌ DO NOT remove `line-clamp-2` from tagline
- ❌ DO NOT increase badge max-width without testing long text

**What to Test After Edits:**
1. Test with vendor name: "Very Long Vendor Name That Could Overflow"
2. Test with category: "Very Long Category Name"
3. Test with long tagline (100+ characters)
4. Verify no text overlaps images or badges
5. Verify cards maintain equal height

**Guardrail Comment:** ✅ Added to code

---

### 4. **VendorStripe Sticky Positioning** ⚠️ MEDIUM RISK

**File:** `components/ui/VendorStripe.tsx`

**Why It's Fragile:**
- Must account for responsive header height
- Header height changes: 64px (mobile) / 80px (desktop)
- Wrong offset causes overlap with header

**What Must NOT Be Changed:**
- ❌ DO NOT use fixed pixel values (e.g., `top-[64px]`)
- ❌ DO NOT remove responsive offset (`top-16 lg:top-20`)
- ❌ DO NOT change z-index without checking scale
- ❌ DO NOT use `top-0` (will overlap header)

**What to Test After Edits:**
1. Test on mobile (header height 64px)
2. Test on desktop (header height 80px)
3. Scroll page and verify VendorStripe doesn't overlap header
4. Verify VendorStripe appears below header when sticky
5. Test with different header states (scrolled/unscrolled)

**Guardrail Comment:** ✅ Added to code

---

### 5. **Admin Form Width Constraints** ⚠️ LOW-MEDIUM RISK

**Files:** 
- `app/admin/vendors/[id]/edit/page-client.tsx`
- `app/admin/vendors/create/page-client.tsx`
- `app/admin/market-days/create/page-client.tsx`
- `app/admin/market-days/[id]/edit/page-client.tsx`

**Why It's Fragile:**
- Forms wider than 896px become hard to read
- Easy to accidentally remove max-width constraint
- Full-width forms look unprofessional

**What Must NOT Be Changed:**
- ❌ DO NOT remove `max-w-4xl` constraint
- ❌ DO NOT increase beyond `max-w-5xl` (1024px)
- ❌ DO NOT use full-width (`max-w-7xl`) for forms
- ❌ DO NOT remove container padding

**What to Test After Edits:**
1. Test form on large desktop (1920px+)
2. Verify form doesn't stretch full width
3. Verify form is centered and readable
4. Test form on tablet (768px) - should still be readable

**Guardrail Comment:** ✅ Added to code

---

### 6. **Sticky Filter Bars** ⚠️ LOW-MEDIUM RISK

**Files:**
- `app/sellers/page.tsx` (line 76)
- Any page with sticky filters

**Why It's Fragile:**
- Must account for responsive header height
- Wrong offset causes overlap
- Multiple pages use this pattern

**What Must NOT Be Changed:**
- ❌ DO NOT use fixed pixel values
- ❌ DO NOT use `top-0` (will overlap header)
- ❌ DO NOT remove responsive offset

**What to Test After Edits:**
1. Test sticky filters on mobile (320px-375px)
2. Test sticky filters on desktop (1024px+)
3. Scroll page and verify filters don't overlap header
4. Verify filters appear below header when sticky

**Standard Pattern:**
```tsx
className="sticky top-16 lg:top-20 z-40"
```

---

### 7. **ProductCard Overlay Interactions** ⚠️ LOW RISK

**File:** `components/ui/ProductCard.tsx`

**Why It's Fragile:**
- Complex z-index layering (z-10, z-20, z-30)
- Overlay interactions depend on correct z-index
- Quick add button must be above image overlay

**What Must NOT Be Changed:**
- ❌ DO NOT change z-index values without checking scale
- ❌ DO NOT remove `pointer-events-none` from content
- ❌ DO NOT remove `pointer-events-auto` from interactive elements

**What to Test After Edits:**
1. Hover over product card
2. Verify quick add button appears
3. Verify button is clickable
4. Verify vendor name link works
5. Test on mobile (touch interactions)

---

## Testing Checklist for Future Changes

When editing any of the above components, test:

### Mobile (320px-375px)
- [ ] No horizontal scroll
- [ ] No button/text clipping
- [ ] All buttons fully visible
- [ ] Touch targets ≥ 44px
- [ ] No overlapping elements

### Tablet (768px-1024px)
- [ ] Layout transitions smoothly
- [ ] No awkward spacing
- [ ] Forms readable and centered

### Desktop (1024px+)
- [ ] Forms don't stretch full width
- [ ] Sticky elements don't overlap
- [ ] Text doesn't overflow

### Accessibility
- [ ] Focus states visible
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Color contrast sufficient

---

## Quick Reference: Common Mistakes to Avoid

1. **Moving buttons inside `.container-custom`**
   - ❌ Will cause clipping on mobile
   - ✅ Keep action buttons outside container

2. **Using fixed pixel values for sticky offsets**
   - ❌ `top-[64px]` breaks on desktop
   - ✅ Use `top-16 lg:top-20` (responsive)

3. **Removing text truncation**
   - ❌ Long text breaks layout
   - ✅ Always use `truncate` or `line-clamp`

4. **Reducing touch target sizes**
   - ❌ `w-10 h-10` fails WCAG
   - ✅ Always use `w-11 h-11` minimum (44px)

5. **Removing max-width from admin forms**
   - ❌ Forms become unreadable
   - ✅ Always use `max-w-4xl` for forms

6. **Changing z-index without checking scale**
   - ❌ Causes layering conflicts
   - ✅ Use documented z-index scale

---

## Documentation Updates

When adding new components that:
- Use sticky positioning → Document header offset
- Have action buttons → Check if they need to be outside container
- Display user-generated text → Add truncation/line-clamp
- Are interactive → Ensure 44px touch targets
- Use z-index → Follow documented scale

---

**Remember:** These guardrails prevent bugs that took significant time to fix. Respect them! 🛡️


