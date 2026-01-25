# Concierge Uplift Rules

**Purpose**: Define controlled rules for uplifting Concierge and non-Markets pages to Markets quality level without refactoring Markets itself.

**Date**: January 16, 2025

**Principle**: Use Markets as a **qualitative benchmark**, not a template. Apply the same confidence and maturity, but maintain Concierge's unique identity.

---

## Rule 1: Section Spacing & Density

### Minimum Section Weight
- **Major content sections**: `py-20` (80px) minimum
- **Hero sections**: `py-12 sm:py-16 md:py-20 lg:py-32` (responsive, generous)
- **Page headers**: `py-12 sm:py-16 lg:py-20` (48px/64px/80px)

### Rationale
- Sections must feel substantial, not rushed
- Generous spacing creates confidence and breathing room
- Matches Markets rhythm without copying exact structure

### Application
- Update all Concierge sections from `py-12 sm:py-16 lg:py-20` to `py-20` minimum
- Update hero from `py-16 lg:py-24` to `py-12 sm:py-16 md:py-20 lg:py-32`
- Ensure sections have enough content to justify the spacing

---

## Rule 2: Typography Hierarchy

### Heading Scales
- **Hero H1**: `text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold`
  - Match Markets scale for maximum impact
  - Responsive scaling creates confidence
- **Section H2**: `text-4xl lg:text-5xl font-black`
  - Use `font-black` for authority (not `font-bold`)
  - Match Markets size for consistency
- **Subheadings**: `text-xl text-neutral-600 font-medium`
  - Always include `font-medium` for hierarchy
  - Neutral color for secondary status

### Rationale
- Large, bold typography creates confidence
- Consistent scale across platform creates cohesion
- Weight variation (`font-black` vs `font-bold`) creates clear hierarchy

### Application
- Update Concierge hero H1 to match Markets scale
- Update section H2s to `text-4xl lg:text-5xl font-black`
- Add `font-medium` to all subheadings

---

## Rule 3: CTA Density & Placement

### CTA Requirements
- **Hero sections**: Must have at least 1 primary CTA, ideally 2 (primary + secondary)
- **Content sections**: Every section should have a clear next step (CTA or action link)
- **Bottom of page**: Dedicated CTA section with prominent action

### CTA Styling
- **Primary CTA**: 
  - `px-8 py-4` minimum padding
  - `bg-primary-600 hover:bg-primary-700` (blue for Concierge)
  - `text-white font-semibold` or `font-bold`
  - `rounded-2xl` (modern, friendly)
  - `text-lg` (larger text)
  - `shadow-lg hover:shadow-xl` (elevates on hover)
- **Secondary CTA**:
  - `px-8 py-4` (same size)
  - `bg-white border-2 border-primary-600` (outline style)
  - `text-primary-600` (colored text)
- **Section Links**:
  - `text-primary-600 hover:text-primary-700 font-bold text-lg`
  - `hover:bg-primary-50 rounded-xl`
  - Include icon for direction

### Rationale
- Every section should invite action, not just inform
- CTAs create purposeful navigation
- Multiple entry points increase engagement

### Application
- Add primary CTA to Concierge hero ("Get Started" or "Contact Us")
- Add "Learn More" or "View Services" links to each content section
- Make "Get in Touch" section more prominent and action-oriented
- Add "View All Services" link to services section

---

## Rule 4: Card Usage Patterns

### When to Use Cards
- **Use cards for**: Feature lists, service offerings, location lists, testimonials
- **Don't use cards for**: Long-form content, single-column text blocks

### Card Styling Standards
- **Standard cards**: `p-6` minimum, `rounded-2xl`, `shadow-sm hover:shadow-md`
- **Highlight cards**: `p-8 lg:p-12`, `rounded-3xl`, gradient or colored backgrounds
- **Consistent hover states**: All cards should have hover elevation

### Card Content Requirements
- Cards should have **purpose**, not just information
- Include CTAs within cards when appropriate
- Ensure cards have enough content to feel substantial

### Rationale
- Cards create visual interest and organization
- Consistent patterns create platform cohesion
- Cards should invite interaction, not just display

### Application
- Location cards: Add descriptions or "Learn More" links
- Service cards: Already good, but ensure CTAs are present
- Testimonial cards: Consider adding "Get Started" CTA below

---

## Rule 5: Color Usage (Primary Blue)

### Color Application
- **Primary accent**: Use `primary-600` (#0054b6) for all Concierge CTAs and accents
- **Hover states**: `primary-700` for darker hover
- **Backgrounds**: `primary-50` and `primary-100` for subtle backgrounds
- **Borders**: `primary-200` for card borders when needed

### Rationale
- Blue (#0054b6) is the platform color for non-Markets sections
- Consistent color usage creates brand cohesion
- Don't use Markets purple - maintain section identity

### Application
- All Concierge CTAs use `primary-600` (blue)
- Hover states use `primary-700`
- Section links use `primary-600` with `primary-50` hover background

---

## Rule 6: Section Purpose & Anchoring

### Section Requirements
- Every section must have a **clear purpose** beyond information
- Sections should **invite action**, not just inform
- Each section should have a **clear next step** (CTA or link)

### Section Types
1. **Hero**: Introduction + primary CTA
2. **Feature**: Information + "Learn More" link
3. **Services**: List + "View All Services" or "Get Started" CTA
4. **Testimonials**: Social proof + "Get Started" CTA
5. **Contact**: Form + prominent "Send Message" button

### Rationale
- Purposeful sections create guided user journeys
- Action-oriented design increases engagement
- Clear next steps reduce friction

### Application
- "What the Concierge Does" → Add "Get Started" or "Contact Us" CTA
- "Where We Go" → Add "Learn More" links to location cards or section-level CTA
- "Our Concierge Services" → Add "View All Services" or "Get Started" link
- "What People Say" → Add "Get Started" CTA below testimonials
- "Get in Touch" → Make more prominent, add "Schedule a Call" option

---

## Rule 7: Visual Confidence Factors

### Confidence Indicators
- **Large typography**: Don't be timid with heading sizes
- **Generous spacing**: Sections should breathe
- **Purposeful CTAs**: Every section invites action
- **Consistent patterns**: Cards, spacing, typography follow rules
- **Clear hierarchy**: Typography and spacing create obvious structure

### What to Avoid
- **Over-design**: Don't add unnecessary animations or effects
- **Timidity**: Typography and spacing should be confident, not minimal
- **Information-only sections**: Every section should have a purpose
- **Sparse content**: Sections should feel substantial

### Rationale
- Confidence comes from bold choices, not decoration
- Restraint and clarity create service confidence
- Purposeful design feels professional

### Application
- Increase all typography to match Markets scale
- Increase section padding to create weight
- Add CTAs to create purpose
- Ensure sections have enough content to feel complete

---

## Rule 8: Hero Section Standards

### Hero Requirements
- **Large typography**: Match Markets scale (`text-4xl` to `text-9xl`)
- **Generous padding**: `py-12 sm:py-16 md:py-20 lg:py-32`
- **At least 1 CTA**: Primary action button
- **Clear value proposition**: What does this section offer?

### Hero Options
- **With image**: Large hero image with overlay (like Markets)
- **Without image**: Gradient background (like current Concierge)
- **Both valid**: Choose based on content needs

### Rationale
- Hero sets the tone for the entire page
- Large typography and CTAs create immediate engagement
- Generous padding creates premium feeling

### Application
- Update Concierge hero typography to Markets scale
- Add primary CTA ("Get Started" or "Contact Us")
- Increase hero padding to match Markets
- Consider adding hero image (optional, not required)

---

## Rule 9: Content Density

### Minimum Content Requirements
- Sections should have **enough content to scroll**
- Each section should feel **complete**, not sparse
- Content should justify the section's existence

### Content Types
- **Feature sections**: 3-6 items (cards, services, etc.)
- **List sections**: Enough items to create visual interest
- **Text sections**: Substantial copy, not just a sentence

### Rationale
- Sparse sections feel rushed or incomplete
- Substantial content creates confidence
- Users should feel they're getting value

### Application
- Ensure location cards have descriptions or purpose
- Ensure service lists are comprehensive
- Ensure testimonials section has enough content
- Add content where sections feel sparse

---

## Rule 10: Alternating Backgrounds

### Background Pattern
- **Alternate**: White and `bg-neutral-50` between sections
- **Purpose**: Create visual separation and rhythm
- **Consistency**: Follow the pattern throughout the page

### Rationale
- Alternating backgrounds create visual rhythm
- Clear separation between sections
- Matches Markets pattern for platform cohesion

### Application
- Ensure Concierge sections alternate backgrounds
- Hero → White → Neutral-50 → White → Neutral-50 pattern

---

## Application Priority

### High Priority (Critical Gaps)
1. Add CTAs to hero and every section
2. Increase typography scale (H1, H2)
3. Increase section padding to `py-20` minimum
4. Add `font-black` to section H2s

### Medium Priority (Moderate Impact)
5. Make contact section more prominent
6. Add purpose to location cards
7. Increase hero padding

### Low Priority (Polish)
8. Add `font-medium` to subheadings
9. Ensure alternating backgrounds
10. Verify card hover states

---

## Constraints

### What NOT to Do
- ❌ Don't copy Markets layout exactly
- ❌ Don't use Markets purple color
- ❌ Don't refactor Markets components
- ❌ Don't change Markets spacing or typography
- ❌ Don't add unnecessary animations
- ❌ Don't over-design

### What TO Do
- ✅ Apply Markets confidence level
- ✅ Use Markets spacing and typography scales
- ✅ Add purposeful CTAs
- ✅ Maintain Concierge identity (blue color)
- ✅ Create guided user journeys
- ✅ Ensure sections feel substantial

---

## Success Criteria

After uplift, Concierge should:
1. Feel as **confident** as Markets (large typography, generous spacing)
2. Have **purposeful sections** (every section invites action)
3. Maintain **Concierge identity** (blue color, unique content)
4. Create **guided journeys** (clear CTAs, next steps)
5. Feel **substantial** (enough content, proper spacing)
6. Match **platform quality** (same maturity level as Markets)

---

## Notes

- These rules are **principles**, not templates
- Apply Markets **confidence**, not Markets **design**
- Maintain section **independence** while achieving **cohesion**
- Focus on **purpose** and **action**, not decoration


