# Concierge Gap Analysis

**Purpose**: Compare Concierge pages against Markets design baseline to identify where hierarchy, spacing, CTAs, and perceived confidence fall short.

**Date**: January 16, 2025

---

## Overall Assessment

Concierge feels **informational** rather than **purposeful**. Sections lack the visual weight and action-orientation that makes Markets feel complete.

---

## Gap 1: Section Spacing & Density

### Markets Standard
- Major sections: `py-20` (80px)
- Hero: `py-12 sm:py-16 md:py-20 lg:py-32` (responsive, generous)

### Concierge Current
- Sections: `py-12 sm:py-16 lg:py-20` (48px/64px/80px)
- Hero: `py-16 lg:py-24` (64px/96px)

### Gap
- **Concierge sections feel thinner** - `py-12` on mobile vs Markets `py-20`
- **Hero is less generous** - `py-16` vs Markets `py-12 sm:py-16 md:py-20 lg:py-32`
- **Less vertical rhythm** - sections don't have the same weight

### Impact
- Sections feel rushed, not substantial
- Less breathing room between content blocks
- Doesn't create the same "complete experience" feeling

---

## Gap 2: Typography Hierarchy

### Markets Standard
- Hero H1: `text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold`
- Section H2: `text-4xl lg:text-5xl font-black`
- Subheadings: `text-xl text-neutral-600 font-medium`

### Concierge Current
- Hero H1: `text-5xl lg:text-6xl xl:text-7xl font-black`
- Section H2: `text-3xl lg:text-4xl font-bold`
- Subheadings: `text-lg text-neutral-600` (no font-medium)

### Gap
- **Hero H1 is smaller** - maxes at `text-7xl` (72px) vs Markets `text-9xl` (128px)
- **Section H2s are smaller** - `text-3xl lg:text-4xl` vs Markets `text-4xl lg:text-5xl`
- **Section H2s use `font-bold`** vs Markets `font-black` - less authoritative
- **Subheadings lack weight** - no `font-medium`, just default weight

### Impact
- Typography feels less confident
- Hierarchy is weaker
- Sections don't command the same attention

---

## Gap 3: CTA Placement & Density

### Markets Standard
- Hero: 2 CTAs (primary + secondary)
- Every section: "View All" or action link
- Bottom: Dedicated CTA section with gradient

### Concierge Current
- Hero: **No CTAs** - just text
- Sections: **No CTAs** - informational only
- Bottom: Contact form section (functional but not action-oriented)

### Gap
- **Hero has no CTAs** - users don't know what to do next
- **Sections lack action links** - "What the Concierge Does" has no CTA
- **"Where We Go" has no CTA** - just location cards
- **Services section has no CTA** - lists services but no "Get Started" or "Learn More"
- **Testimonials have no CTA** - just social proof, no next step
- **Contact form is functional but not prominent** - feels like a form, not an invitation

### Impact
- Pages feel informational, not actionable
- Users don't have clear next steps
- Lacks the "purposeful" feeling of Markets

---

## Gap 4: Card Usage & Visual Weight

### Markets Standard
- Feature cards: `p-6` minimum, `rounded-2xl`, `shadow-sm hover:shadow-md`
- Highlight cards: `p-8 lg:p-12`, `rounded-3xl`, gradient backgrounds
- Consistent hover states

### Concierge Current
- Location cards: `p-6`, `rounded-2xl`, `shadow-sm hover:shadow-md` ✅ (matches)
- Service cards: `p-8`, `rounded-2xl`, `bg-neutral-50`, `border border-neutral-200` ✅ (good)
- Testimonial cards: `p-6`, `rounded-2xl`, `border border-neutral-200 shadow-sm` ✅ (matches)

### Gap
- **Cards are actually fine** - they match Markets patterns
- **Issue is card content** - location cards are just names, no descriptions or CTAs
- **Service cards are good** but could use CTAs

### Impact
- Cards feel complete visually
- But content within cards lacks purpose (location cards especially)

---

## Gap 5: Section Purpose & Anchoring

### Markets Standard
- Every section has a clear purpose and CTA
- "Featured Sellers" → "View All" link
- "Popular Products" → "View All" link
- "Upcoming Market" → "View Market Details" button

### Concierge Current
- "What the Concierge Does" → **No CTA** - just explanation
- "Where We Go" → **No CTA** - just location list
- "Our Concierge Services" → **No CTA** - just service lists
- "What People Say" → **No CTA** - just testimonials
- "Get in Touch" → Contact form (functional but not prominent)

### Gap
- **Sections are informational, not actionable**
- **No clear progression** from information to action
- **Contact form is buried** at the bottom, not featured

### Impact
- Users read information but don't know what to do next
- Lacks the "guided journey" feeling of Markets
- Feels like a brochure, not a service platform

---

## Gap 6: Hero Section Confidence

### Markets Standard
- Large hero image with overlay
- Extremely large typography (up to 128px)
- 2 prominent CTAs
- Search bar integration
- Generous padding

### Concierge Current
- Gradient background (no image)
- Smaller typography (max 72px)
- No CTAs
- No search or interactive elements
- Less generous padding

### Gap
- **No hero image** - less visual interest
- **Smaller typography** - less impact
- **No CTAs** - no clear next step
- **Less padding** - feels less generous

### Impact
- Hero feels less confident and engaging
- Users don't have immediate action options
- Less "premium" feeling

---

## Gap 7: Content Density & Scrolling Experience

### Markets Standard
- Multiple substantial sections
- Each section has enough content to scroll
- Clear visual rhythm with alternating backgrounds
- Sections feel complete, not sparse

### Concierge Current
- Sections are present but feel lighter
- Less content per section
- Alternating backgrounds ✅ (matches)
- Some sections feel sparse (location cards, testimonials)

### Impact
- Page feels shorter, less substantial
- Sections don't create the same "complete experience" feeling
- Less engaging scrolling experience

---

## Summary of Gaps

### Critical Gaps (High Impact)
1. **Missing CTAs** - Every section needs a clear next step
2. **Weaker Typography** - Headings need to be larger and bolder
3. **Thinner Sections** - Need more vertical padding for weight
4. **Hero Lacks Action** - No CTAs in hero section

### Moderate Gaps (Medium Impact)
5. **Less Generous Hero** - Smaller padding, no image
6. **Informational Tone** - Sections feel like information, not invitations
7. **Lighter Content Density** - Some sections feel sparse

### Minor Gaps (Low Impact)
8. **Subheading Weight** - Missing `font-medium` on some subheadings
9. **Card Content** - Location cards could have more purpose

---

## What Concierge Needs

1. **Hero CTAs** - "Get Started" or "Contact Us" buttons
2. **Section CTAs** - "Learn More", "View Services", "Get in Touch" links
3. **Larger Typography** - Match Markets scale
4. **More Section Padding** - `py-20` minimum for major sections
5. **Prominent Contact CTA** - Make "Get in Touch" more action-oriented
6. **Purposeful Sections** - Each section should invite action, not just inform

---

## Comparison Table

| Element | Markets | Concierge | Gap |
|---------|---------|-----------|-----|
| Hero H1 Size | `text-9xl` (128px) | `text-7xl` (72px) | **-56px** |
| Section H2 Size | `text-4xl lg:text-5xl` | `text-3xl lg:text-4xl` | **-1 size level** |
| Section H2 Weight | `font-black` | `font-bold` | **Less weight** |
| Section Padding | `py-20` | `py-12 sm:py-16 lg:py-20` | **Thinner on mobile** |
| Hero CTAs | 2 CTAs | 0 CTAs | **Missing** |
| Section CTAs | Every section | None | **Missing** |
| Hero Padding | `py-12 sm:py-16 md:py-20 lg:py-32` | `py-16 lg:py-24` | **Less generous** |
| Subheading Weight | `font-medium` | Default | **Missing weight** |

---

## Next Steps

1. Add CTAs to hero and every section
2. Increase typography scale to match Markets
3. Increase section padding to `py-20` minimum
4. Make contact section more prominent and action-oriented
5. Add purpose to each section (not just information)


