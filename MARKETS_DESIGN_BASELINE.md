# Markets Design Baseline

**Purpose**: Extract and document the design patterns that make Markets feel "complete" and confident, to serve as a benchmark for uplifting other sections.

**Date**: January 16, 2025

---

## Section Density & Rhythm

### Vertical Spacing (Section Padding)
- **Major Sections**: `py-20` (80px) - consistent across all major content sections
- **Hero Section**: `py-12 sm:py-16 md:py-20 lg:py-32` (48px/64px/80px/128px) - generous, responsive scaling
- **Page Headers**: `py-12 sm:py-16 lg:py-20` (48px/64px/80px) - substantial but not overwhelming
- **Content Sections**: `py-20` (80px) - creates breathing room between sections
- **Alternating Backgrounds**: White and `bg-neutral-50` alternate for visual separation

### Horizontal Spacing
- **Container**: `container-custom` with `max-w-7xl` (1280px) for wide content
- **Narrow Content**: `max-w-3xl` (768px) for centered text blocks
- **Grid Gaps**: `gap-6` (24px) for card grids, `gap-8` (32px) for larger layouts

### Section Weight
- Each major section has **minimum 80px vertical padding** (`py-20`)
- Sections feel substantial, not rushed
- Clear visual separation between content blocks

---

## Card Usage Patterns

### Card Types

#### 1. Feature Cards (VendorCard, ProductCard)
- **Padding**: `p-6` (24px) standard
- **Border Radius**: `rounded-2xl` (16px)
- **Shadow**: `shadow-sm hover:shadow-md` - subtle, elevates on interaction
- **Border**: `border border-neutral-100` - very subtle
- **Hover**: Smooth transitions, shadow elevation

#### 2. Highlight Cards (Market Preview)
- **Padding**: `p-8 lg:p-12` (32px/48px) - more generous
- **Border Radius**: `rounded-3xl` (24px) - more prominent
- **Border**: `border-2 border-markets-200` - colored, thicker
- **Background**: `bg-gradient-to-br from-markets-50 to-secondary-50` - gradient
- **Shadow**: `shadow-soft-lg` - stronger shadow for prominence

#### 3. Service Cards (Concierge comparison)
- **Padding**: `p-8` (32px) - matches highlight cards
- **Border Radius**: `rounded-2xl` (16px)
- **Border**: `border border-neutral-200` - standard
- **Background**: `bg-neutral-50` or `bg-white`

### Card Grid Patterns
- **Featured Content**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - 3-column max
- **Product Grids**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` - 4-column max
- **Consistent Gaps**: `gap-6` (24px) standard, `gap-8` (32px) for larger cards

---

## Typography Hierarchy

### Hero Typography
- **H1**: `text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold`
  - Extremely large, bold, confident
  - Responsive scaling from 36px to 128px
  - Line height: `leading-[0.9]` - tight, impactful
  - Tracking: `tracking-tight` - condensed for impact
- **Hero Subheading**: `text-lg sm:text-xl md:text-2xl lg:text-3xl text-neutral-700 font-light`
  - Large but lighter weight
  - Max width: `max-w-2xl` - readable line length
- **Hero Description**: `text-lg sm:text-xl md:text-2xl` - substantial but not overwhelming

### Section Headings
- **H2 (Major Sections)**: `text-4xl lg:text-5xl font-black`
  - Very large, maximum weight
  - Creates strong hierarchy
  - Spacing: `mb-3` or `mb-4` from subheading
- **H2 (Page Headers)**: `text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight`
  - Even larger for dedicated pages
  - Tighter tracking for impact

### Subheadings
- **Section Subheadings**: `text-xl text-neutral-600 font-medium`
  - Clear but secondary
  - Neutral color for hierarchy
  - Medium weight (not bold)

### Body Text
- **Card Text**: `text-base` (16px) - standard readability
- **Descriptive Text**: `text-lg` (18px) - slightly larger for emphasis
- **Small Text**: `text-sm` (14px) - labels, metadata

### Typography Confidence Factors
- **Large Scale**: Headings are genuinely large, not timid
- **Weight Variation**: `font-black` for major headings creates authority
- **Line Length**: `max-w-2xl` or `max-w-3xl` for optimal readability
- **Leading**: `leading-relaxed` for body text, `leading-tight` for headings

---

## CTA Placement & Tone

### Hero CTAs
- **Primary CTA**: 
  - `px-8 py-4` - substantial padding
  - `bg-markets-600 hover:bg-markets-700` - solid color
  - `text-white font-semibold` - clear, confident
  - `rounded-2xl` - modern, friendly
  - `text-lg` - larger text for prominence
  - `shadow-lg hover:shadow-xl` - elevates on hover
- **Secondary CTA**:
  - `px-8 py-4` - same size
  - `bg-white border-2 border-markets-600` - outline style
  - `text-markets-600` - colored text
  - Equal visual weight to primary

### Section CTAs
- **"View All" Links**: 
  - Positioned on right side of section header
  - `text-markets-600 hover:text-markets-700 font-bold text-lg`
  - `hover:bg-markets-50 rounded-xl` - subtle background on hover
  - Icon included for direction
  - Hidden on mobile, shown on `sm:` breakpoint

### Feature Card CTAs
- **Market Preview CTA**:
  - `px-8 py-4` - substantial
  - `bg-markets-600 hover:bg-markets-700 text-white font-bold`
  - `rounded-2xl shadow-lg hover:shadow-xl`
  - Positioned on right side of card
  - `whitespace-nowrap` - prevents wrapping

### CTA Section (Bottom)
- **Full-width gradient background**: `bg-gradient-to-br from-markets-600 to-secondary-600`
- **Centered content**: `text-center`
- **Large heading**: `text-4xl lg:text-5xl font-black`
- **Subheading**: `text-xl lg:text-2xl text-white/90 font-medium`
- **CTA Button**: 
  - `px-10 py-5` - very generous padding
  - `bg-white text-markets-700 font-bold`
  - `rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105` - interactive, confident
  - `text-lg` - large text

### CTA Density Rules
- **Every major section** has at least one CTA
- **Hero sections** have 2 CTAs (primary + secondary)
- **Content sections** have "View All" links
- **Bottom of page** has dedicated CTA section
- CTAs are **purposeful**, not decorative

---

## Perceived Confidence Level

### Why Markets Feels "Complete"

1. **Generous Spacing**
   - Sections don't feel cramped
   - `py-20` creates substantial vertical rhythm
   - Clear separation between content blocks

2. **Bold Typography**
   - `font-black` for major headings
   - Extremely large hero text (up to 128px)
   - Clear hierarchy through size and weight

3. **Purposeful CTAs**
   - Every section has clear next steps
   - CTAs are prominent but not aggressive
   - Multiple entry points for engagement

4. **Consistent Card Patterns**
   - Cards feel substantial (`p-6` minimum)
   - Consistent shadows and borders
   - Clear hover states

5. **Visual Weight**
   - Sections have enough content to feel complete
   - Not just informational - each section invites action
   - Alternating backgrounds create visual rhythm

6. **Confident Color Usage**
   - Markets purple used consistently
   - Not timid - colors are present and purposeful
   - Gradients used for emphasis (hero, CTA sections)

7. **Content Density**
   - Sections have enough content to scroll
   - Not sparse or rushed
   - Each section feels like a complete experience

---

## Key Patterns Summary

### Spacing
- Major sections: `py-20` (80px minimum)
- Hero sections: `py-12 sm:py-16 md:py-20 lg:py-32` (responsive, generous)
- Card padding: `p-6` minimum, `p-8` for emphasis

### Typography
- Hero H1: Up to `text-9xl` (128px) with `font-bold`
- Section H2: `text-4xl lg:text-5xl font-black`
- Subheadings: `text-xl font-medium`
- Body: `text-base` to `text-lg`

### CTAs
- Hero: 2 CTAs (primary + secondary)
- Sections: "View All" links on right
- Bottom: Dedicated CTA section with gradient
- All CTAs: Substantial padding, clear hierarchy

### Cards
- Standard: `rounded-2xl p-6 shadow-sm`
- Highlight: `rounded-3xl p-8 lg:p-12` with gradient
- Consistent hover states and transitions

### Visual Confidence
- Large, bold typography
- Generous spacing
- Purposeful CTAs
- Consistent patterns
- Alternating backgrounds
- Clear visual hierarchy

---

## What Makes Markets Feel "Mature"

1. **No Timidity**: Typography is large, colors are present, spacing is generous
2. **Purposeful Design**: Every element serves a function, CTAs are clear
3. **Consistent Patterns**: Cards, spacing, typography follow clear rules
4. **Visual Weight**: Sections feel substantial, not rushed
5. **Clear Hierarchy**: Typography and spacing create obvious information structure
6. **Action-Oriented**: Every section invites engagement, not just information display


