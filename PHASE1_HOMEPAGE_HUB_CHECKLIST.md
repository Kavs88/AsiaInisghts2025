# Phase 1: Homepage Hub Enhancement - Implementation Checklist

> **⚠️ PLANNING DOCUMENT ONLY**  
> This checklist breaks down Phase 1 from `HOMEPAGE_CONCIERGE_EVOLUTION_PLAN.md` into implementable tasks.  
> **Authority**: `HOMEPAGE_CONCIERGE_EVOLUTION_PLAN.md` is the source of truth.  
> **Status**: Planning checklist - no implementation  
> **Date**: January 16, 2025

---

## Phase 1 Overview

**Goal**: Enhance the Homepage hub to better emphasize platform identity, improve section card hierarchy, and strengthen visual presentation.

**Timeline**: 1-2 weeks (as specified in evolution plan)

**Scope**: Homepage (`app/page.tsx`) only. No Markets changes. No Concierge changes. No navigation structure changes.

---

## Clear Goals

### Primary Goals

1. **Strengthen Platform Identity**
   - Hero section clearly communicates Asia Insights as a multi-section platform
   - Value proposition is clear and compelling
   - Platform feels cohesive and intentional

2. **Improve Section Card Hierarchy**
   - Active sections (Markets, Concierge) are visually more prominent than coming soon sections
   - Visual distinction between active and coming soon is clear
   - Section cards feel premium and intentional

3. **Enhance Visual Presentation**
   - Typography matches Markets confidence level
   - Spacing is generous and matches Markets rhythm
   - CTAs are clear and purposeful

### Secondary Goals (Optional)

4. **Add Platform Value Proposition** (if approved)
   - "Why Asia Insights?" section explains platform value
   - Helps users understand platform before diving into sections

---

## Exact Sections Affected

### File: `app/page.tsx`

#### Section 1: Hero Section
**Current State**:
- Large hero with "Asia Insights" heading
- Tagline: "Your gateway to life, business, and community in Southeast Asia"
- Description paragraph
- HeroSearchBar component
- Market-specific background image

**Changes Required**:
1. **Typography Enhancement**:
   - Ensure H1 uses `text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black`
   - Ensure subheading uses `text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold`
   - Ensure description uses `text-lg sm:text-xl md:text-2xl`

2. **Padding Enhancement**:
   - Change hero padding to `py-12 sm:py-16 md:py-20 lg:py-32` (more generous)

3. **Value Proposition Addition** (OPTIONAL - REQUIRES APPROVAL):
   - **⚠️ DO NOT ADD WITHOUT EXPLICIT APPROVAL**
   - Add short, punchy value statement: "One platform. Multiple sections. Everything you need to thrive in Southeast Asia." (exact text match)
   - **Decision Point**: Requires stakeholder approval before implementation
   - **If Not Approved**: Skip this addition, proceed without value statement

4. **CTA Addition**:
   - Add primary CTA: "Explore Sections" (exact text match)
     - Scrolls to section cards section (target: `id="explore-asia-insights"` or first section after hero)
     - Styling: `bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl px-8 py-4`
     - Minimum height: 44px (WCAG touch target requirement)
   - Add secondary CTA: "Start Your Journey" (exact text match)
     - Links to `/markets` route (exact href: `/markets`)
     - Styling: `bg-white border-2 border-primary-600 text-primary-600 font-bold rounded-2xl px-8 py-4`
     - Minimum height: 44px (WCAG touch target requirement)
   - Both CTAs use brand blue (#0054b6) for text/borders (verify via browser inspector)

5. **Background Image Change** (OPTIONAL - REQUIRES APPROVAL):
   - **⚠️ DO NOT CHANGE IMAGE WITHOUT EXPLICIT APPROVAL**
   - **Decision Point**: Image change requires stakeholder approval and image asset availability
   - **Current Image**: `/images/Stalls 6.jpg` (market-specific)
   - **If Approved**:
     - New image asset exists at `/public/images/[new-filename].jpg`
     - New image represents platform breadth (Southeast Asia lifestyle, diverse)
     - Image is optimized (Next.js Image component, proper sizing)
     - Gradient overlay ensures text readability (test: verify text is readable over image)
     - Image loads quickly (< 3 seconds on 3G connection)
   - **If Not Approved**:
     - Current image `/images/Stalls 6.jpg` remains unchanged
     - No image-related code modifications
     - Gradient overlay remains if it exists, or is not added if it doesn't
   - **Verification**: Git diff shows no image path changes if not approved

6. **Search Bar Context Text** (OPTIONAL - REQUIRES APPROVAL):
   - **⚠️ DO NOT MODIFY HeroSearchBar COMPONENT**
   - **Decision Point**: Context text addition requires approval and must not modify shared component
   - **If Approved**:
     - Context text appears near HeroSearchBar in `app/page.tsx` only (above, below, or as placeholder)
     - Context text: "Search across Markets, Concierge, and more..." (exact text match)
     - Context text is styled consistently (brand blue #0054b6 or neutral)
     - HeroSearchBar component (`components/ui/HeroSearchBar.tsx`) is NOT modified
   - **If Not Approved**:
     - No context text added
     - HeroSearchBar remains unchanged
     - No placeholder text modifications
   - **Verification**: Git diff shows no changes to `components/ui/HeroSearchBar.tsx`

#### Section 2: "Explore Asia Insights" Section Cards
**Current State**:
- Grid of 6 section cards (Markets, Concierge active; Property, Community, Business, Lifestyle coming soon)
- All cards have equal visual weight
- Active cards link to sections, coming soon cards are disabled

**Changes Required**:
1. **Visual Hierarchy**:
   - **Active sections** (Markets, Concierge):
     - Full color, prominent borders: `border-2 border-primary-500`
     - Stronger shadows: `shadow-lg hover:shadow-xl`
     - Hover effects: `hover:scale-105 transition-transform`
     - Full opacity: `opacity-100`
   - **Coming soon sections** (Property, Community, Business, Lifestyle):
     - Reduced opacity: `opacity-60`
     - Muted colors: Use `bg-neutral-50` and `border-neutral-200`
     - "Coming Soon" badge or text
     - No hover scale effect

2. **Card Content Enhancement**:
   - **Descriptions**: Make more action-oriented
     - Markets: "Discover local vendors, products, and market events"
     - Concierge: "Get personalized support for your Southeast Asia journey"
   - **CTAs**:
     - Active: "Explore [Section]" with arrow icon (`text-primary-600`)
     - Coming Soon: "Coming Soon" text only (no link, `text-neutral-500`)

3. **Layout Consideration** (optional):
   - Consider 2-column layout for active sections (larger, more prominent)
   - 3-column for coming soon (smaller, grouped)
   - Or: Active sections in first row, coming soon in second row
   - Current grid structure can remain: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

4. **Card Styling Enhancement**:
   - Active cards: Add subtle gradient backgrounds (optional)
   - Ensure all text links use brand blue (#0054b6)
   - Hover states: `hover:scale-105 transition-transform` for active cards only

#### Section 3: Platform Value Proposition (NEW - OPTIONAL - REQUIRES APPROVAL)

**⚠️ DO NOT IMPLEMENT WITHOUT EXPLICIT APPROVAL**

**Current State**: Does not exist

**Decision Point**: This section requires stakeholder approval before implementation.

**If Approved**:
1. **New Section Between Hero and Section Cards**:
   - Heading: "Why Asia Insights?" (exact text match)
   - Subheading: "One platform, multiple sections, everything you need" (exact text match)
   - Value Points (3-4 cards, count verification):
     - "Comprehensive Coverage" - Markets, Concierge, Property, Community, Business, Lifestyle
     - "Local Expertise" - Built by people who understand Southeast Asia
     - "Integrated Experience" - Seamless navigation between sections
     - "Growing Platform" - New sections and features regularly
   - CTA: "Explore Our Sections" (exact text match, scrolls to section cards)
   - Visual: Cards with icons, brief descriptions
   - Styling: Match Markets section patterns (`py-20` padding, `text-4xl lg:text-5xl font-black` for heading)

**If Not Approved**:
- Section does not exist in code
- No placeholder or TODO comments for this section
- Hero section flows directly to section cards (no intermediate section)

**Verification**: Git diff shows no new section code if not approved

---

## What Stays Unchanged - Scope Protection Checklist

### Markets Section Protection

**⚠️ CRITICAL: No Markets modifications allowed in Phase 1**

- [ ] **Markets routes unchanged**: All `/markets/*` routes exist and function (test: navigate to `/markets`, `/markets/sellers`, `/markets/market-days`, verify pages load)
- [ ] **Markets content unchanged**: Markets pages content matches pre-Phase 1 state (screenshot comparison or git diff)
- [ ] **Markets styling unchanged**: No CSS classes modified in Markets route files (git diff verification: `app/markets/**/*.tsx`)
- [ ] **Markets color unchanged**: Markets section uses `markets-*` colors (#8c52ff), not `primary-*` colors (#0054b6) (verify via browser inspector on Markets pages)
- [ ] **Markets links unchanged**: Homepage section card links to `/markets` only, no new Markets sub-routes added
- [ ] **Markets components unchanged**: No changes to Markets-specific components (VendorCard, ProductCard, etc.) (git diff verification: `components/ui/VendorCard.tsx`, `components/ui/ProductCard.tsx`)
- [ ] **Markets data unchanged**: No changes to Markets data fetching or database queries (git diff verification: `lib/supabase/queries.ts`, `app/markets/**/*.tsx`)
- [ ] **Markets functionality unchanged**: All Markets features work as before Phase 1 (test: vendor signup, product browsing, market days)

**Verification Method**: Run `git diff` on Markets-related files before Phase 1 completion. No changes should appear.

### Concierge Section Protection (Phase 2 Scope)

**⚠️ CRITICAL: No Concierge modifications allowed in Phase 1**

- [ ] **Concierge routes unchanged**: `/concierge` route exists and functions (test: navigate to `/concierge`, verify page loads)
- [ ] **Concierge content unchanged**: `/concierge` page content matches pre-Phase 1 state (screenshot comparison or git diff)
- [ ] **Concierge styling unchanged**: No CSS classes modified in `app/concierge/page.tsx` (git diff verification)
- [ ] **Concierge links unchanged**: Homepage section card links to `/concierge` only, no new Concierge sub-routes added
- [ ] **Concierge components unchanged**: No changes to Concierge-specific components (git diff verification: `app/concierge/**/*.tsx`)
- [ ] **Concierge sub-pages unchanged**: `/concierge/services`, `/concierge/relocation`, `/concierge/support` remain as placeholders (test: navigate, verify placeholder content)

**Verification Method**: Run `git diff` on Concierge-related files before Phase 1 completion. No changes should appear.

### Navigation Structure Protection

**⚠️ CRITICAL: No navigation modifications allowed in Phase 1**

- [ ] **Header component unchanged**: No modifications to `components/ui/Header.tsx` (git diff verification)
- [ ] **Header navigation unchanged**: Markets dropdown, Concierge link, Contact link remain in same positions (visual inspection)
- [ ] **Header routes unchanged**: All header links point to same routes as pre-Phase 1 (test: click all nav links, verify routes match)
- [ ] **Footer component unchanged**: No modifications to `components/ui/Footer.tsx` (git diff verification)
- [ ] **Footer links unchanged**: Footer links remain same as pre-Phase 1 (test: verify all footer links, check href attributes)
- [ ] **Mobile menu unchanged**: Mobile navigation structure and behavior unchanged (test: open mobile menu, verify links and structure)
- [ ] **Navigation styling unchanged**: No CSS classes modified in Header or Footer components (git diff verification)

**Verification Method**: Run `git diff` on `components/ui/Header.tsx` and `components/ui/Footer.tsx` before Phase 1 completion. No changes should appear.

### Global Components Protection

- [ ] **HeroSearchBar component unchanged**: No modifications to `components/ui/HeroSearchBar.tsx` (git diff verification)
- [ ] **HeroSearchBar usage**: Context text may be added to `app/page.tsx` only, not to component itself
- [ ] **Shared design system unchanged**: No modifications to shared components (Card, Button, Modal, etc.) (git diff verification: `components/ui/*.tsx`)

**Verification Method**: Run `git diff` on `components/ui/HeroSearchBar.tsx` and other shared components. No changes should appear.

### Data & Backend Protection

- [ ] **Data fetching unchanged**: Homepage already decoupled from Markets (verify: `app/page.tsx` has no Markets data imports)
- [ ] **Database schema unchanged**: No migrations or schema changes (git diff verification: `supabase/**/*.sql`)
- [ ] **API routes unchanged**: No API route modifications (git diff verification: `app/api/**/*.ts`)
- [ ] **Authentication unchanged**: No authentication or user management changes (git diff verification: `lib/auth/**/*.ts`)

**Verification Method**: Run `git diff` on data/backend files. No changes should appear.

### Other Sections Protection

- [ ] **Property section unchanged**: Remains placeholder only (test: verify no `/property` routes exist)
- [ ] **Community section unchanged**: Remains placeholder only (test: verify no `/community` routes exist)
- [ ] **Business section unchanged**: Remains placeholder only (test: verify no `/business` routes exist)
- [ ] **Lifestyle section unchanged**: Remains placeholder only (test: verify no `/lifestyle` routes exist)
- [ ] **Coming soon cards**: Only visual styling changes allowed (opacity, colors, borders), no functionality changes

---

## Acceptance Criteria for Completion

### Hero Section Enhancement

- [ ] **Typography Scale**
  - H1 uses `text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black` (responsive scale)
  - H1 reaches `text-9xl` (128px) at `xl:` breakpoint (1280px+)
  - Verification: Inspect element at 1280px width, confirm computed font-size is 128px for H1
  - Subheading uses `text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold` (responsive scale)
  - Subheading reaches `text-4xl` (36px) at `lg:` breakpoint (1024px+)
  - Verification: Inspect element at 1024px width, confirm computed font-size is 36px for subheading
  - Description uses `text-lg sm:text-xl md:text-2xl` (responsive scale)
  - Description reaches `text-2xl` (24px) at `md:` breakpoint (768px+)
  - Verification: Inspect element at 768px width, confirm computed font-size is 24px for description
  - Typography scales responsively across all breakpoints (test: 320px, 640px, 768px, 1024px, 1280px, 1920px)

- [ ] **Padding**
  - Hero section uses `py-12 sm:py-16 md:py-20 lg:py-32` (responsive padding)
  - Verification: Inspect element, verify hero section computed padding-top and padding-bottom match expected values:
    - Mobile (320px): padding-top = 48px (py-12), padding-bottom = 48px (py-12)
    - Tablet (768px): padding-top = 80px (md:py-20), padding-bottom = 80px (md:py-20)
    - Desktop (1024px+): padding-top = 128px (lg:py-32), padding-bottom = 128px (lg:py-32)
  - Padding matches Markets hero padding at same breakpoints (compare with Markets hero section)

- [ ] **CTAs**
  - Primary CTA "Explore Sections" button exists with exact text match
  - Primary CTA has `href="#explore-asia-insights"` OR `onClick` handler that scrolls to section cards
  - Primary CTA scroll behavior: Smooth scroll to section cards section (test: click, verify section cards are in viewport)
  - Primary CTA scroll target: Section cards section has `id="explore-asia-insights"` OR is first element with class containing "section" after hero
  - Primary CTA styling: `bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl px-8 py-4`
  - Primary CTA color verification: Background color is #0054b6 (verify via browser inspector)
  - Secondary CTA "Start Your Journey" button exists with exact text match
  - Secondary CTA has `href="/markets"` (exact route match)
  - Secondary CTA navigation: Clicking navigates to `/markets` route (test: click, verify URL changes to `/markets`, page loads)
  - Secondary CTA styling: `bg-white border-2 border-primary-600 text-primary-600 font-bold rounded-2xl px-8 py-4`
  - Secondary CTA color verification: Border and text color is #0054b6 (verify via browser inspector)
  - Both CTAs are visible on mobile (320px width) without horizontal scroll (test: view at 320px, verify no horizontal scrollbar)
  - Both CTAs have minimum 44px height (WCAG touch target requirement) (verify via browser inspector: computed height ≥ 44px)

- [ ] **Value Proposition** (OPTIONAL - REQUIRES APPROVAL)
  - **If Approved**:
    - Short value statement is present: "One platform. Multiple sections. Everything you need to thrive in Southeast Asia." (exact text match)
    - Value statement is positioned between hero heading and description (verify DOM order)
  - **If Not Approved**:
    - No value statement exists in code
    - No placeholder or TODO comments for value statement
    - Hero flows directly from subheading to description
  - **Verification**: Git diff shows no value statement code if not approved

- [ ] **Background Image** (OPTIONAL - REQUIRES APPROVAL)
  - **If Approved**:
    - New image asset exists at `/public/images/[new-filename].jpg` (verify file exists)
    - Image path updated in `app/page.tsx` (verify via git diff)
    - Image represents platform breadth (Southeast Asia lifestyle, diverse) (visual inspection)
    - Gradient overlay ensures text readability (test: verify text is readable over image, contrast ratio ≥ 4.5:1)
    - Image is optimized (Next.js Image component, proper sizing) (verify: Image component used, not `<img>` tag)
    - Image loads quickly (< 3 seconds on 3G connection) (test: throttle network to 3G, measure load time)
  - **If Not Approved**:
    - Current image `/images/Stalls 6.jpg` remains unchanged (verify via git diff: no image path changes)
    - No image-related code modifications (verify via git diff)
    - Gradient overlay remains if it exists, or is not added if it doesn't
  - **Verification**: Git diff shows no image path changes if not approved

- [ ] **Search Bar Context Text** (OPTIONAL - REQUIRES APPROVAL)
  - **If Approved**:
    - Context text is present: "Search across Markets, Concierge, and more..." (exact text match)
    - Context text appears in `app/page.tsx` only, not in HeroSearchBar component (verify via git diff)
    - Context text is styled consistently (brand blue #0054b6 or neutral) (verify via browser inspector)
    - HeroSearchBar component (`components/ui/HeroSearchBar.tsx`) is NOT modified (verify via git diff: no changes)
    - Search functionality remains unchanged (test: search bar still functions as before)
  - **If Not Approved**:
    - No context text added (verify via git diff: no new text elements)
    - HeroSearchBar remains unchanged (verify via git diff)
    - No placeholder text modifications
  - **Verification**: Git diff shows no changes to `components/ui/HeroSearchBar.tsx`

### Section Cards Enhancement

- [ ] **Visual Hierarchy**
  - Active section cards use `border-2 border-primary-500` where `primary-500` = #0054b6 (verify via computed styles: border-color is #0054b6)
  - Coming soon section cards use `border-2 border-neutral-200` (verify via computed styles: border-color is #e5e7eb)
  - Active section cards use `opacity-100` (computed: opacity: 1) (verify via browser inspector)
  - Coming soon section cards use `opacity-60` (computed: opacity: 0.6) (verify via browser inspector)
  - Active section cards use `shadow-lg` (verify shadow exists and is stronger than coming soon) (verify via computed styles: box-shadow property exists)
  - Coming soon section cards use `shadow-sm` or no shadow (verify shadow is weaker or absent) (verify via computed styles)
  - Active section cards use `shadow-lg hover:shadow-xl` on hover (test: hover over active card, verify shadow increases)
  - Visual prominence test: Side-by-side comparison shows active cards are more visually prominent (screenshot comparison)
  - Border color verification: Active cards border color is #0054b6 (use browser color picker to verify)

- [ ] **Card Content**
  - Active section descriptions are action-oriented (exact text matches):
    - Markets: "Discover local vendors, products, and market events" (exact text match)
    - Concierge: "Get personalized support for your Southeast Asia journey" (exact text match)
  - Active section CTAs say "Explore [Section]" with arrow icon (exact text match: "Explore Markets" or "Explore Concierge")
  - Active section CTA links use brand blue (#0054b6) (verify via browser inspector: color is #0054b6)
  - Coming soon sections show "Coming Soon" text (no link, `text-neutral-500`) (verify: no `<a>` tag, text color is #737373)
  - All text links use brand blue (#0054b6) (verify all `<a>` tags have color #0054b6 via browser inspector)

- [ ] **Hover Effects**
  - Active cards have `hover:scale-105 transition-transform` effect (test: hover over active card, verify scale increases to 1.05)
  - Coming soon cards do not have scale effect (test: hover over coming soon card, verify no scale change)
  - Hover states are smooth (test: verify transition is smooth, no jank, 60fps)
  - Transition duration is reasonable (verify via computed styles: transition-duration exists)

- [ ] **Layout**
  - Grid layout maintains responsiveness (verify: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` classes present)
  - Mobile (320px): 1 column layout (verify: cards stack vertically)
  - Tablet (768px): 2 column layout (verify: cards display in 2 columns)
  - Desktop (1280px+): 3 column layout (verify: cards display in 3 columns)
  - Active sections are visually prominent (verify: active cards appear before coming soon in DOM order OR are visually larger)
  - Layout works on mobile, tablet, and desktop (test: view at 320px, 768px, 1280px, verify no clipping or overflow)

### Platform Value Proposition Section (OPTIONAL - REQUIRES APPROVAL)

**⚠️ DO NOT IMPLEMENT WITHOUT EXPLICIT APPROVAL**

- [ ] **Section Structure** (if approved)
  - New section exists between hero and section cards (verify DOM order)
  - Heading: "Why Asia Insights?" (exact text match)
  - Subheading: "One platform, multiple sections, everything you need" (exact text match)
  - 3-4 value point cards are present (count verification: 3 or 4 cards)
  - CTA "Explore Our Sections" is present and functional (exact text match, test: click, verify scroll behavior)

- [ ] **Visual Styling** (if approved)
  - Section uses `py-20` padding (verify via computed styles: padding-top and padding-bottom are 80px)
  - Heading uses `text-4xl lg:text-5xl font-black` (verify via computed styles: font-size is 36px at base, 48px at lg breakpoint)
  - Cards follow Markets card patterns (verify: `rounded-2xl`, `shadow-sm`, `p-6` or similar)
  - Section styling matches Markets section patterns (compare with Markets section styling)

- [ ] **If Not Approved**:
  - Section does not exist in code (verify via git diff: no new section code)
  - No placeholder or TODO comments for this section (verify via code search)
  - Hero section flows directly to section cards (verify DOM order: hero → section cards, no intermediate section)

### Overall Quality

- [ ] **Brand Consistency**
  - All text links use brand blue (#0054b6) (verify via browser inspector: all `<a>` tags have color #0054b6)
  - No Markets purple (#8c52ff) used on homepage (verify via browser inspector: no elements have color #8c52ff, except Markets card icon if applicable)
  - Color usage is consistent (verify: all primary CTAs use #0054b6, all secondary CTAs use #0054b6 for borders/text)
  - Active section card borders use #0054b6 (verify via browser color picker)

- [ ] **Typography Consistency**
  - Typography scale matches Markets benchmark (compare H1 font-size at 1280px: both should be 128px)
  - Headings are large and confident (`font-black` for major headings) (verify: H1 uses `font-black`, computed font-weight is 900)
  - Hierarchy is clear through size and weight (verify: H1 > subheading > description in font-size, H1 uses font-black, subheading uses font-bold)
  - Hero H1 font-size matches Markets hero H1 font-size at same breakpoint (measure both at 1280px, should both be 128px)

- [ ] **Spacing Consistency**
  - Section padding matches Markets rhythm (`py-20` minimum) (verify: section cards section uses `py-20`, computed padding is 80px)
  - Card padding is generous (`p-8` for section cards) (verify: section cards use `p-8`, computed padding is 32px)
  - Spacing is consistent (verify: all major sections use `py-20`, all section cards use `p-8`)

- [ ] **Responsive Design**
  - Mobile (320px width):
    - No horizontal scrolling (test: scroll horizontally, verify no scrollbar appears)
    - All text is readable (font-size ≥ 14px, contrast ratio ≥ 4.5:1) (verify via browser inspector)
    - All CTAs are tappable (minimum 44px height/width) (verify via browser inspector: computed height/width ≥ 44px)
    - Hero H1 is at least `text-4xl` (36px) (verify computed font-size ≥ 36px)
    - Section cards stack vertically (1 column layout) (verify: grid displays 1 column)
    - No content clipped or overlapping (visual inspection)
  - Tablet (768px width):
    - Section cards display in 2 columns (verify: grid displays 2 columns)
    - Hero H1 is at least `text-6xl` (60px) (verify computed font-size ≥ 60px)
    - All CTAs are visible without scrolling (above fold) (test: verify CTAs visible on initial load)
  - Desktop (1280px width):
    - Section cards display in 3 columns (verify: grid displays 3 columns)
    - Hero H1 reaches `text-9xl` (128px) (verify computed font-size is 128px)
    - All content is properly spaced (no cramped sections) (visual inspection)
  - Touch targets are 44px minimum (verify all interactive elements: computed height/width ≥ 44px)
  - No horizontal scrolling or clipping (test: view at all breakpoints, verify no horizontal scrollbar)

- [ ] **Accessibility**
  - All CTAs are keyboard accessible (test: Tab through page, verify all CTAs receive focus)
  - Color contrast meets WCAG AA standards (verify: text/background contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text) (use browser accessibility tools)
  - Screen reader labels are present where needed (verify: all CTAs have accessible text or aria-labels)
  - Focus states are visible (test: Tab through page, verify focus outline is visible on all interactive elements)
  - Touch targets are 44px minimum (verify: all buttons/links have computed height/width ≥ 44px)

- [ ] **Performance**
  - Page load time is acceptable (< 3 seconds) (test: measure page load time, verify < 3 seconds)
  - Images are optimized (if changed) (verify: Next.js Image component used, not `<img>` tag, proper sizing attributes)
  - No layout shift during load (test: verify no CLS (Cumulative Layout Shift) issues, use browser DevTools)
  - Smooth animations (CSS-based, not JavaScript) (verify: animations use CSS transitions/transforms, not JavaScript)
  - Images load quickly (if changed) (< 3 seconds on 3G connection) (test: throttle network to 3G, measure image load time)

### Documentation

- [ ] **Code Comments**
  - Changes are documented with inline comments
  - Comments explain intent (why, not just what)
  - Comments reference evolution plan where applicable

- [ ] **Visual Verification**
  - Visual consistency: All brand blue (#0054b6) links use same color value (verify via browser inspector)
  - Visual consistency: All section cards use consistent border radius (`rounded-2xl` = 16px) (verify via computed styles: border-radius is 16px)
  - Visual hierarchy: Active section cards have `border-2` (2px) vs coming soon `border-2` but different color (verify: active border is #0054b6, coming soon border is #e5e7eb)
  - Visual hierarchy: Active section cards use `shadow-lg` (verify shadow exists and is stronger than coming soon)
  - Visual hierarchy: Coming soon cards use `opacity-60` (computed: opacity: 0.6) (verify via browser inspector)
  - Platform identity: Hero H1 text is "Asia Insights" (exact match) (verify: text content is exactly "Asia Insights")
  - Platform identity: Hero subheading contains "gateway to life, business, and community" (exact match) (verify: subheading text contains this phrase)
  - Section hierarchy: Active cards appear before coming soon cards in DOM order OR are visually larger (verify DOM order or visual size comparison)
  - Markets comparison: Hero H1 font-size matches Markets hero H1 font-size at same breakpoint (measure both at 1280px, should both be 128px)

---

## Implementation Order (Suggested)

### Step 1: Hero Section Typography & Padding (Low Risk)

**Why Low Risk**: Visual-only changes, no functionality, no data dependencies, easily reversible

**Specific Changes**:
- Change H1 from current classes to `text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black`
- Change subheading from current classes to `text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold`
- Change hero section padding from current to `py-12 sm:py-16 md:py-20 lg:py-32`

**Verification**:
- Inspect element at 1280px width, verify H1 computed font-size is 128px
- Inspect element at 1024px width, verify subheading computed font-size is 36px
- Inspect element, verify hero section computed padding-top and padding-bottom match expected values

**Rollback Plan**: Git revert if typography or padding causes layout issues

**Files**: `app/page.tsx` (hero section)

### Step 2: Hero Section CTAs (Medium Risk)

**Why Medium Risk**: Adds new functionality (scroll behavior, navigation), needs testing to ensure links work correctly

**Specific Changes**:
- Add primary CTA button: "Explore Sections" with `href="#explore-asia-insights"` OR `onClick` handler
- Add secondary CTA button: "Start Your Journey" with `href="/markets"`
- Apply styling: Primary `bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl px-8 py-4`
- Apply styling: Secondary `bg-white border-2 border-primary-600 text-primary-600 font-bold rounded-2xl px-8 py-4`

**Verification**:
- Test primary CTA: Click, verify smooth scroll to section cards section
- Test secondary CTA: Click, verify navigation to `/markets` route
- Verify both CTAs have minimum 44px height (WCAG requirement)

**Rollback Plan**: Remove CTAs if scroll behavior or navigation doesn't work correctly

**Files**: `app/page.tsx` (hero section)

### Step 3: Section Cards Visual Hierarchy (Low Risk)
- Apply visual styling to active vs coming soon cards
- Add borders, shadows, opacity differences
- **Risk**: Low - visual only, no functionality changes
- **Files**: `app/page.tsx` (section cards)

### Step 4: Section Cards Content & CTAs (Medium Risk)
- Update descriptions to be action-oriented
- Add/update CTAs on cards
- Ensure links work correctly
- **Risk**: Medium - content changes, link functionality
- **Files**: `app/page.tsx` (section cards)

### Step 5: Section Cards Hover Effects (Low Risk)
- Add hover scale effects to active cards
- Ensure smooth transitions
- **Risk**: Low - visual only, no functionality changes
- **Files**: `app/page.tsx` (section cards)

### Step 6: Platform Value Proposition (OPTIONAL - REQUIRES APPROVAL - Medium Risk)

**⚠️ DO NOT IMPLEMENT WITHOUT EXPLICIT APPROVAL**

**Why Medium Risk**: New content section, needs approval, adds complexity

**Decision Point**: This section requires stakeholder approval before implementation.

**If Approved**:
- Add new section between hero and section cards
- Create value point cards (3-4 cards)
- Add CTA "Explore Our Sections" that scrolls to section cards
- Apply styling: `py-20` padding, `text-4xl lg:text-5xl font-black` for heading

**If Not Approved**:
- Skip this step entirely
- Do not add placeholder or TODO comments
- Proceed to next step

**Verification**: Git diff shows no new section code if not approved

**Files**: `app/page.tsx` (new section, only if approved)

### Step 7: Background Image (OPTIONAL - REQUIRES APPROVAL - Low Risk)

**⚠️ DO NOT CHANGE IMAGE WITHOUT EXPLICIT APPROVAL**

**Why Low Risk**: Visual-only change, but needs image asset and approval

**Decision Point**: Image change requires stakeholder approval and image asset availability.

**Current Image**: `/images/Stalls 6.jpg` (market-specific)

**If Approved**:
- Replace image path in `app/page.tsx` with new image asset
- Add gradient overlay for text readability
- Optimize image (Next.js Image component, proper sizing)
- Verify image loads quickly (< 3 seconds on 3G)

**If Not Approved**:
- Keep current image `/images/Stalls 6.jpg` unchanged
- Do not modify image-related code
- Proceed to next step

**Verification**: Git diff shows no image path changes if not approved

**Files**: `app/page.tsx` (hero section), `/public/images/[new-filename].jpg` (only if approved)

### Step 8: Search Bar Context Text (OPTIONAL - REQUIRES APPROVAL - Low Risk)

**⚠️ DO NOT MODIFY HeroSearchBar COMPONENT**

**Why Low Risk**: Text addition only, but must not modify shared component

**Decision Point**: Context text addition requires approval and must not modify shared component.

**If Approved**:
- Add context text in `app/page.tsx` only (near HeroSearchBar, not inside component)
- Text: "Search across Markets, Concierge, and more..." (exact text match)
- Style consistently (brand blue #0054b6 or neutral)
- Verify HeroSearchBar component is NOT modified

**If Not Approved**:
- Skip this step
- Do not add context text
- Proceed to completion

**Verification**: Git diff shows no changes to `components/ui/HeroSearchBar.tsx`

**Files**: `app/page.tsx` (hero section, only if approved)

---

## Files/Components Likely Affected

### Primary File
- **`app/page.tsx`**: Main homepage file
  - Hero section (lines ~22-52)
  - Section cards section (lines ~59-159)
  - New platform value proposition section (if approved)

### Potential Image Assets
- **`/public/images/`**: New hero image (if approved)
  - Southeast Asia lifestyle imagery
  - Optimized for web (Next.js Image component)

### No Other Files Affected
- Header component: Unchanged
- Footer component: Unchanged
- HeroSearchBar component: Usage may change, component unchanged
- Markets routes: Unchanged
- Concierge routes: Unchanged
- Navigation: Unchanged

---

## Testing Checklist

### Visual Testing
- [ ] Hero typography scales correctly on all breakpoints (test: 320px, 640px, 768px, 1024px, 1280px, verify font-size increases)
- [ ] Hero H1 reaches 128px at 1280px width (verify via browser inspector)
- [ ] Hero CTAs are visible and functional (test: verify CTAs are visible, click both, verify behavior)
- [ ] Section cards have clear visual hierarchy (verify: active cards have stronger borders/shadows than coming soon)
- [ ] Active cards are more prominent than coming soon cards (verify: active cards opacity 1.0, coming soon opacity 0.6)
- [ ] Hover effects work smoothly (test: hover over active cards, verify scale effect, 60fps)
- [ ] Brand blue (#0054b6) is used consistently (verify via browser inspector: all links/CTAs use #0054b6)
- [ ] No Markets purple (#8c52ff) appears on homepage (verify via browser inspector: no elements use #8c52ff, except Markets card icon if applicable)

### Functional Testing
- [ ] "Explore Sections" CTA scrolls to section cards (test: click, verify smooth scroll, section cards in viewport)
- [ ] "Start Your Journey" CTA links to Markets (test: click, verify URL changes to `/markets`, page loads)
- [ ] Active section cards link to correct routes (test: Markets card links to `/markets`, Concierge card links to `/concierge`)
- [ ] Coming soon cards do not have active links (test: verify coming soon cards have no `<a>` tags, only text)
- [ ] All links work correctly (test: click all links, verify navigation works)
- [ ] Search bar functions correctly (if enhanced) (test: search bar still functions as before, context text doesn't break functionality)

### Responsive Testing
- [ ] Mobile (320px width):
  - No horizontal scrolling (test: verify no horizontal scrollbar)
  - Text readable (font-size ≥ 14px, contrast ≥ 4.5:1)
  - CTAs accessible (height/width ≥ 44px)
  - Cards stack vertically (1 column)
  - Hero H1 is at least 36px
- [ ] Tablet (768px width):
  - Cards display in 2 columns (verify grid layout)
  - Hero H1 is at least 60px
  - CTAs visible above fold
- [ ] Desktop (1280px width):
  - Cards display in 3 columns (verify grid layout)
  - Hero H1 reaches 128px
  - Visual hierarchy is clear (active cards more prominent)

### Accessibility Testing
- [ ] Keyboard navigation works (Tab through CTAs and links)
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus states are visible
- [ ] Touch targets are 44px minimum

### Performance Testing
- [ ] Page load time is acceptable (< 3 seconds)
- [ ] Images load quickly (if changed)
- [ ] No layout shift during load
- [ ] Animations are smooth (60fps)

---

## Risks & Mitigation

### Risk 1: Visual Inconsistency
**Risk**: Changes don't match Markets benchmark or feel disconnected

**Mitigation**:
- Follow Markets typography and spacing patterns strictly
- Use brand blue (#0054b6) consistently
- Test visual consistency across sections

### Risk 2: Breaking Existing Functionality
**Risk**: Changes break existing links or navigation

**Mitigation**:
- Test all links after changes
- Maintain existing route structure
- Don't modify navigation components

### Risk 3: Content Gaps
**Risk**: Enhanced design reveals content gaps or placeholder text

**Mitigation**:
- Review all content before implementation
- Ensure descriptions are clear and action-oriented
- Use placeholders strategically

### Risk 4: Performance Impact
**Risk**: Visual enhancements impact page load time

**Mitigation**:
- Optimize images (Next.js Image component)
- Use CSS animations (not JavaScript)
- Test performance on mobile

---

## Success Metrics

### Quantitative
- Page load time: < 3 seconds
- All links functional: 100% success rate
- Responsive breakpoints: All tested and working
- Accessibility score: WCAG AA compliant

### Qualitative (Subjective but Verifiable)
- Homepage clearly communicates platform identity (verify: Hero H1 is "Asia Insights", subheading mentions platform)
- Section hierarchy is obvious (active vs coming soon) (verify: active cards have stronger visual treatment)
- Visual quality matches Markets confidence level (verify: Hero H1 font-size matches Markets at same breakpoint)
- Platform feels cohesive and intentional (verify: consistent use of brand blue, consistent spacing patterns)
- Users understand Asia Insights is a multi-section platform (verify: section cards are visible and clearly labeled)

---

## Completion Definition

**Phase 1 is complete when**:

1. ✅ All acceptance criteria are met (all checkboxes checked)
2. ✅ All testing checklist items pass (all tests verified)
3. ✅ Visual quality matches Markets benchmark (Hero H1 font-size matches Markets at 1280px: both 128px)
4. ✅ Platform identity is clear (Hero H1 is "Asia Insights", subheading mentions platform)
5. ✅ Section hierarchy is obvious (active cards have stronger visual treatment: opacity 1.0, stronger borders/shadows)
6. ✅ No regressions in existing functionality (all existing links work, no broken navigation)
7. ✅ Scope protection verified (git diff shows no changes to Markets, Concierge, Navigation, or global components)
8. ✅ Documentation is updated (if needed) (code comments added where applicable)

**Phase 1 is NOT complete if**:
- Markets functionality is affected (git diff shows changes to Markets files)
- Navigation structure is changed (git diff shows changes to Header/Footer components)
- Concierge section is modified (git diff shows changes to Concierge files)
- Business section is introduced (no Business routes or components created)
- Visual quality doesn't match Markets benchmark (Hero H1 font-size doesn't match Markets at same breakpoint)
- Optional items implemented without approval (git diff shows Platform Value Proposition or image changes without approval)

---

## Next Steps After Phase 1

Once Phase 1 is complete and approved:

1. **Review & Feedback**: Gather feedback on Phase 1 changes
2. **Documentation Update**: Update design baseline if needed
3. **Phase 2 Planning**: Begin planning Phase 2 (Concierge Visual Elevation)
4. **Iteration**: Refine Phase 1 based on feedback (if needed)

---

**Document Status**: Planning checklist complete. Ready for implementation when approved.

**Authority**: This checklist implements Phase 1 from `HOMEPAGE_CONCIERGE_EVOLUTION_PLAN.md`. No scope expansion beyond the evolution plan.

