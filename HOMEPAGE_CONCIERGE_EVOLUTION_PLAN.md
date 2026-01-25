# Homepage & Concierge Evolution Plan

> **⚠️ ANALYSIS & RECOMMENDATIONS ONLY**  
> This document provides strategic analysis and recommendations for evolving the Homepage hub and Concierge section.  
> **Status**: Planning document - no implementation  
> **Date**: January 16, 2025

---

## Executive Summary

**Current State**: Homepage functions as a hub with Markets and Concierge as spokes. Markets is the design benchmark. Concierge has been visually elevated but still feels more informational than purposeful.

**Goal**: Elevate Homepage hub clarity and Concierge section to match Markets' confidence level, creating a cohesive, premium platform experience.

**Key Findings**:
1. Homepage hub structure is sound but could better emphasize the platform identity
2. Concierge needs stronger CTAs, larger typography, and more purposeful sections
3. Navigation is clear but could benefit from visual hierarchy improvements
4. Visual consistency between hub and spokes needs refinement

---

## 1. Homepage Hub Recommendations

### Current State Analysis

**Strengths**:
- Clear platform identity ("Asia Insights" hero)
- Section cards for Markets and Concierge are prominent
- Decoupled from Markets data (maintains independence)
- Uses brand blue (#0054b6) consistently

**Gaps**:
- Hero section feels generic (market image doesn't represent platform)
- "Explore Asia Insights" section is functional but not inspiring
- No clear value proposition for the platform itself
- Section cards are equal weight (no hierarchy between active vs coming soon)
- Missing platform-level search or discovery features

### Recommended Homepage Hub Structure

#### 1.1 Hero Section Evolution

**Current**: Large hero with "Asia Insights" heading, tagline, description, search bar

**Recommended**:
- **Platform-Focused Imagery**: Replace market-specific image with Southeast Asia lifestyle imagery (diverse, represents platform breadth)
- **Stronger Value Proposition**: 
  - Primary heading: "Asia Insights" (keep)
  - Subheading: "Your gateway to life, business, and community in Southeast Asia" (keep)
  - **Add**: Short, punchy value statement: "One platform. Multiple sections. Everything you need to thrive in Southeast Asia."
- **Dual CTAs**:
  - Primary: "Explore Sections" (scrolls to section cards)
  - Secondary: "Start Your Journey" (links to most relevant section based on user context, or Markets as default)
- **Search Enhancement**: Keep global search bar, but add context: "Search across Markets, Concierge, and more..."

**Visual Hierarchy**:
- Maintain large typography (`text-9xl` for H1)
- Increase hero padding to `py-16 sm:py-20 md:py-24 lg:py-32` (more generous)
- Add subtle gradient overlay on hero image for text readability

#### 1.2 Section Hub Overview Enhancement

**Current**: Grid of 6 section cards (Markets, Concierge active; Property, Community, Business, Lifestyle coming soon)

**Recommended**:
- **Visual Hierarchy**:
  - **Active sections** (Markets, Concierge): Full color, prominent borders (`border-2 border-primary-500`), hover effects
  - **Coming soon sections**: Reduced opacity (`opacity-60`), muted colors, "Coming Soon" badge
  - **Size differentiation**: Active sections slightly larger or more prominent
- **Section Card Content**:
  - **Icon**: Keep current icons (they're clear)
  - **Title**: Keep current
  - **Description**: Make more action-oriented
    - Markets: "Discover local vendors, products, and market events"
    - Concierge: "Get personalized support for your Southeast Asia journey"
  - **CTA**: 
    - Active: "Explore [Section]" with arrow icon
    - Coming Soon: "Notify Me" or just "Coming Soon" (no link)
- **Layout**:
  - Consider 2-column layout for active sections (larger, more prominent)
  - 3-column for coming soon (smaller, grouped)
  - Or: Active sections in first row, coming soon in second row

**Section Card Improvements**:
- Add hover scale effect (`hover:scale-105 transition-transform`)
- Stronger shadows on active cards (`shadow-lg hover:shadow-xl`)
- Add subtle gradient backgrounds for active cards
- Ensure all text links use brand blue (#0054b6)

#### 1.3 Platform Value Proposition Section (New)

**Recommended Addition**: Add a section between hero and section cards that explains the platform value

**Content**:
- **Heading**: "Why Asia Insights?"
- **Subheading**: "One platform, multiple sections, everything you need"
- **Value Points** (3-4 cards):
  - "Comprehensive Coverage" - Markets, Concierge, Property, Community, Business, Lifestyle
  - "Local Expertise" - Built by people who understand Southeast Asia
  - "Integrated Experience" - Seamless navigation between sections
  - "Growing Platform" - New sections and features regularly
- **Visual**: Cards with icons, brief descriptions
- **CTA**: "Explore Our Sections" (scrolls to section cards)

**Purpose**: Helps users understand the platform before diving into sections

#### 1.4 Featured Content Section (Optional)

**Current**: Markets content removed for independence

**Recommended** (if needed for SEO/content):
- **Static Featured Content**: 
  - "Featured from Markets" - Static preview (no data dependency)
  - "Featured from Concierge" - Static preview
  - Links to full sections
- **Purpose**: Provides content preview without data coupling
- **Alternative**: Skip entirely if hub should be pure navigation

### Homepage Hub Visual Guidelines

**Typography**:
- Hero H1: `text-9xl font-black` (keep Markets scale)
- Section H2: `text-4xl lg:text-5xl font-black` (keep Markets scale)
- Body: `text-lg` for descriptions

**Spacing**:
- Hero: `py-16 sm:py-20 md:py-24 lg:py-32` (more generous)
- Sections: `py-20` minimum (match Markets)
- Card padding: `p-8` for section cards

**Colors**:
- **Brand Blue** (#0054b6): All text links, primary CTAs, active section borders
- **Neutral**: Backgrounds, text, borders
- **Gradients**: Hero overlay, CTA sections

**CTAs**:
- Primary: `bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl px-8 py-4`
- Secondary: `bg-white border-2 border-primary-600 text-primary-600 font-bold rounded-2xl px-8 py-4`
- Text links: `text-primary-600 hover:text-primary-700 font-semibold`

---

## 2. Concierge Section Proposal

### Current State Analysis

**Strengths**:
- Content migrated from legacy WordPress site
- Visual elevation pass applied (spacing, typography improved)
- Contact form functional
- Clear service categories (Expats, Retirees, Digital Nomads, Entrepreneurs)

**Gaps** (from CONCIERGE_GAP_ANALYSIS.md):
1. **Missing CTAs**: Hero and sections lack clear next steps
2. **Weaker Typography**: Headings smaller than Markets benchmark
3. **Thinner Sections**: Less vertical padding than Markets
4. **Informational Tone**: Sections feel like information, not invitations
5. **Hero Lacks Action**: No CTAs in hero section

### Recommended Concierge Landing Page Structure

#### 2.1 Hero Section Enhancement

**Current**: Gradient background, large heading, description, 2 CTAs (Get Started, View Services)

**Recommended**:
- **Typography**:
  - H1: Increase to `text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black` (match Markets)
  - Subheading: `text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold` (larger, bolder)
  - Description: `text-lg sm:text-xl md:text-2xl` (keep current)
- **Background**:
  - **Option A**: Keep gradient (`from-primary-600 to-secondary-600`)
  - **Option B**: Add hero image with gradient overlay (Southeast Asia lifestyle imagery)
  - **Recommendation**: Option B for more visual interest (matches Markets pattern)
- **CTAs** (keep current, enhance):
  - Primary: "Get Started" → Links to `#get-in-touch` (contact form)
  - Secondary: "View Services" → Scrolls to `#our-services` (keep current)
  - **Enhancement**: Make CTAs larger (`px-10 py-5`), add hover scale effect
- **Padding**: Increase to `py-12 sm:py-16 md:py-20 lg:py-32` (match Markets)

#### 2.2 "What the Concierge Does" Section

**Current**: Heading, description, CTA to services

**Recommended**:
- **Typography**:
  - H2: Increase to `text-4xl lg:text-5xl font-black` (match Markets)
  - Description: `text-xl lg:text-2xl font-medium` (larger, medium weight)
- **Content Enhancement**:
  - Add 3-4 key benefit points (cards or list)
  - Examples: "Local Expertise", "Personalized Support", "Trusted Connections", "Seamless Transition"
- **CTA Enhancement**:
  - Keep "Explore Our Services" button
  - Add secondary CTA: "Get in Touch" (links to contact form)
  - Make CTAs more prominent (larger, stronger shadows)
- **Padding**: Increase to `py-20` minimum (match Markets)

#### 2.3 "Where We Go" Section

**Current**: Heading, description, 4 location cards, CTA

**Recommended**:
- **Location Cards Enhancement**:
  - Add brief descriptions to each location (1-2 sentences)
  - Add "Learn More" link to each card (could link to location-specific pages in future)
  - Increase card padding to `p-8` (more substantial)
  - Add hover effects (`hover:scale-105 transition-transform`)
- **CTA Enhancement**:
  - Keep "Learn More About Our Locations" button
  - Make more prominent (larger, stronger)
- **Content Addition**:
  - Consider adding a map visualization (optional, future enhancement)
  - Add "More locations coming soon" if applicable

#### 2.4 "Our Concierge Services" Section

**Current**: Heading, description, 4 service category cards (Expats, Retirees, Digital Nomads, Entrepreneurs)

**Recommended**:
- **Service Cards Enhancement**:
  - Add "Learn More" or "Get Started" CTA to each card
  - Increase card padding to `p-10` (more generous)
  - Add icons or visual elements to each category
  - Consider adding brief "What's Included" sub-list
- **Content Enhancement**:
  - Expand service descriptions (currently just bullet lists)
  - Add "Starting at" pricing if applicable (optional)
  - Add "Most Popular" badge to one category
- **CTA Addition**:
  - Add section-level CTA: "View All Services" or "Get Started Today"
  - Position prominently below service cards

#### 2.5 "What People Say" Section (Testimonials)

**Current**: Heading, description, 3 testimonial cards, CTA

**Recommended**:
- **Testimonial Cards Enhancement**:
  - Add client photos or avatars (if available)
  - Add client location or context (e.g., "Expat in Da Nang")
  - Expand testimonial text (currently placeholder)
  - Add "Read More" link if testimonials are long
- **Content Addition**:
  - Add more testimonials (aim for 4-6 total)
  - Add testimonial categories (filter by service type)
  - Add "See More Testimonials" link (if many exist)
- **CTA Enhancement**:
  - Keep "Get Started Today" button
  - Make more prominent (larger, stronger)

#### 2.6 "Get in Touch" Section (Contact Form)

**Current**: Gradient background, heading, description, contact info, contact form

**Recommended**:
- **Visual Enhancement**:
  - Keep gradient background (matches Markets CTA section pattern)
  - Increase padding to `py-20` (more generous)
  - Make heading larger: `text-4xl lg:text-5xl font-black`
- **Content Enhancement**:
  - Add value proposition: "Ready to start your journey? Let's make it seamless."
  - Add trust signals: "Response within 24 hours", "Free consultation", etc.
  - Add alternative contact methods more prominently (WhatsApp, phone)
- **Form Enhancement**:
  - Keep current form (functional)
  - Add "What can we help you with?" dropdown (service type selection)
  - Add "Preferred contact method" selection
  - Add success message after submission
- **CTA Enhancement**:
  - Make submit button more prominent
  - Add "Or call us" alternative CTA

### Concierge Sub-Page Structure Recommendations

**Current**: `/concierge/services`, `/concierge/relocation`, `/concierge/support` (placeholders)

**Recommended Structure** (based on legacy WordPress content analysis):

#### `/concierge` (Homepage)
- Current structure (enhanced as above)

#### `/concierge/services` (Future)
- **Purpose**: Detailed service offerings
- **Content**:
  - Service categories (Expats, Retirees, Digital Nomads, Entrepreneurs)
  - Detailed service descriptions
  - Pricing or consultation options
  - "Get Started" CTAs
- **Structure**: Similar to Markets product categories page

#### `/concierge/relocation` (Future)
- **Purpose**: Relocation-specific services
- **Content**:
  - Relocation process overview
  - Step-by-step guide
  - Location-specific information
  - "Start Your Relocation" CTA
- **Structure**: Guide-style page with clear steps

#### `/concierge/support` (Future)
- **Purpose**: Ongoing support and resources
- **Content**:
  - Support resources
  - FAQ section
  - Help articles
  - Contact options
- **Structure**: Resource hub with search

#### `/concierge/locations` (New - Recommended)
- **Purpose**: Location-specific information
- **Content**:
  - Detailed location pages (Da Nang, Hua Hin, Sarawak, Sabah)
  - Location-specific services
  - Local insights
  - "Get Support in [Location]" CTAs
- **Structure**: Location cards linking to detailed pages

### Concierge Visual Guidelines

**Typography** (match Markets):
- Hero H1: `text-9xl font-black`
- Section H2: `text-4xl lg:text-5xl font-black`
- Subheadings: `text-xl lg:text-2xl font-medium`
- Body: `text-base` to `text-lg`

**Spacing** (match Markets):
- Hero: `py-12 sm:py-16 md:py-20 lg:py-32`
- Sections: `py-20` minimum
- Card padding: `p-8` to `p-10`

**Colors**:
- **Brand Blue** (#0054b6): Primary color for Concierge
- **Gradients**: Hero and CTA sections
- **Neutral**: Backgrounds, text

**CTAs**:
- Primary: `bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl px-8 py-4`
- Secondary: `bg-white/10 border-2 border-white text-white font-bold rounded-2xl px-8 py-4` (on colored backgrounds)
- Text links: `text-primary-600 hover:text-primary-700 font-semibold`

---

## 3. Navigation Clarity

### Current Navigation Analysis

**Header Navigation**:
- Markets: Dropdown menu (Markets Home, Sellers, Products, Market Days)
- Concierge: Top-level link
- Contact: Top-level link
- Account menu: User account, vendor dashboard, admin (if applicable)

**Homepage Links**:
- Section cards link to `/markets` and `/concierge`
- Coming soon sections are disabled

**Footer Navigation**:
- Markets links (all use `/markets/*` prefix)
- Company links (placeholders)
- Legal links (placeholders)

### Navigation Recommendations

#### 3.1 Header Navigation Enhancement

**Current**: Markets dropdown, Concierge link, Contact link

**Recommended**:
- **Markets Dropdown**: Keep current structure (working well)
- **Concierge Link**: 
  - **Option A**: Keep as top-level link (current)
  - **Option B**: Add dropdown with sub-items (Services, Relocation, Support, Locations)
  - **Recommendation**: Option A for now (simpler), Option B when sub-pages are ready
- **Visual Hierarchy**:
  - Active section indicator (underline or background on current section)
  - Hover states more prominent
  - Ensure all links use brand blue (#0054b6) on hover

#### 3.2 Homepage Navigation Clarity

**Current**: Section cards are clear, but could be more prominent

**Recommended**:
- **Section Cards**: 
  - Make active sections (Markets, Concierge) more prominent
  - Add "Active" badge or indicator
  - Ensure hover states are clear
- **Breadcrumb Context**: 
  - Consider adding breadcrumb navigation on section pages
  - "Home > Markets > Sellers" pattern
- **Back to Hub**: 
  - Ensure all section pages have clear "Back to Home" or "Asia Insights" logo link

#### 3.3 Footer Navigation Enhancement

**Current**: Markets links, company/legal placeholders

**Recommended**:
- **Add Concierge Links**:
  - Concierge Home
  - Services
  - Relocation
  - Support
  - Contact
- **Platform Links**:
  - About Asia Insights
  - Platform Overview
  - Contact (platform-level)
- **Section Links**:
  - Markets
  - Concierge
  - Coming Soon sections (disabled)

#### 3.4 Mobile Navigation

**Current**: Mobile menu with Markets dropdown, Concierge link

**Recommended**:
- **Keep Current Structure**: Mobile menu works well
- **Enhancement**: 
  - Add section indicators (active state)
  - Ensure touch targets are 44px minimum (already implemented)
  - Add visual separation between sections

### Navigation Visual Guidelines

**Active States**:
- Underline or background highlight on current section
- Brand blue (#0054b6) for active links
- Bold or semibold font weight

**Hover States**:
- Brand blue (#0054b6) for text links
- Background highlight for dropdown items
- Smooth transitions

**Hierarchy**:
- Top-level nav: Larger, more prominent
- Dropdown items: Smaller, indented
- Footer links: Smaller, grouped

---

## 4. Visual & Layout Guidance

### Design Principles (From Markets Baseline)

#### 4.1 Typography Scale

**Markets Benchmark**:
- Hero H1: `text-9xl font-black` (128px)
- Section H2: `text-4xl lg:text-5xl font-black` (36px/48px)
- Subheadings: `text-xl font-medium` (20px)
- Body: `text-base` to `text-lg` (16px/18px)

**Apply to**:
- Homepage hub: Match Markets scale
- Concierge: Match Markets scale
- All sections: Consistent typography hierarchy

#### 4.2 Spacing Rhythm

**Markets Benchmark**:
- Hero: `py-12 sm:py-16 md:py-20 lg:py-32` (responsive, generous)
- Sections: `py-20` minimum (80px)
- Cards: `p-6` minimum, `p-8` for emphasis
- Grid gaps: `gap-6` (24px) standard, `gap-8` (32px) for larger

**Apply to**:
- Homepage hub: Match Markets spacing
- Concierge: Match Markets spacing
- All sections: Consistent vertical rhythm

#### 4.3 Card Patterns

**Markets Benchmark**:
- Standard: `rounded-2xl p-6 shadow-sm hover:shadow-md`
- Highlight: `rounded-3xl p-8 lg:p-12` with gradient
- Consistent hover states and transitions

**Apply to**:
- Homepage section cards: Use highlight pattern for active sections
- Concierge service cards: Use standard pattern, enhance with CTAs
- All cards: Consistent styling

#### 4.4 CTA Patterns

**Markets Benchmark**:
- Hero: 2 CTAs (primary + secondary)
- Sections: "View All" or action links
- Bottom: Dedicated CTA section with gradient

**Apply to**:
- Homepage hub: Hero CTAs, section card CTAs
- Concierge: Hero CTAs, section CTAs, prominent contact CTA
- All sections: Every major section has at least one CTA

#### 4.5 Color Usage

**Platform Colors**:
- **Brand Blue** (#0054b6): Platform identity, text links, primary CTAs
- **Markets Purple** (#8c52ff): Markets section only
- **Neutral**: Backgrounds, text, borders
- **Gradients**: Hero overlays, CTA sections

**Application**:
- Homepage hub: Brand blue for all links and CTAs
- Concierge: Brand blue for all links and CTAs
- Markets: Markets purple (unchanged)
- Navigation: Brand blue for platform links

### What to Borrow from Markets

**UI Patterns**:
1. **Card Structure**: Rounded corners, shadows, hover effects
2. **Section Layout**: Alternating backgrounds, generous padding
3. **Typography Scale**: Large, bold headings
4. **CTA Placement**: Every section has clear next steps
5. **Visual Hierarchy**: Clear information structure

**Components** (if reusable):
1. **SearchBar**: Global search component (already shared)
2. **Card Components**: VendorCard pattern (adapt for Concierge service cards)
3. **CTA Buttons**: Button styling and patterns
4. **Section Headers**: Heading + subheading + CTA pattern

### What to Improve vs Current Concierge

**Current Concierge Issues**:
1. **Thinner Sections**: Less vertical padding
2. **Smaller Typography**: Headings not as large/bold
3. **Missing CTAs**: Sections lack clear next steps
4. **Informational Tone**: Feels like information, not invitations
5. **Hero Lacks Impact**: No image, smaller typography

**Improvements Needed**:
1. **Increase Section Padding**: `py-20` minimum (match Markets)
2. **Increase Typography Scale**: `text-9xl` for hero, `text-4xl lg:text-5xl font-black` for sections
3. **Add CTAs Everywhere**: Hero, every section, prominent contact CTA
4. **Make Sections Purposeful**: Each section invites action, not just informs
5. **Enhance Hero**: Add image option, larger typography, dual CTAs

### High-Level Design Principles

1. **Confidence Over Timidity**:
   - Large typography, generous spacing, bold colors
   - No shrinking from prominence
   - Every element serves a purpose

2. **Purposeful Design**:
   - Every section has a clear purpose and CTA
   - Not just information display - action-oriented
   - Clear user journey from discovery to engagement

3. **Consistent Patterns**:
   - Typography, spacing, cards, CTAs follow clear rules
   - Markets sets the standard, other sections match
   - Platform feels cohesive, not fragmented

4. **Visual Weight**:
   - Sections feel substantial, not rushed
   - Enough content to scroll, not sparse
   - Clear visual hierarchy through size and spacing

5. **Action-Oriented**:
   - Every section invites engagement
   - CTAs are prominent but not aggressive
   - Multiple entry points for different user types

---

## 5. Implementation Priorities

### Phase 1: Homepage Hub Enhancement (High Priority)

1. **Hero Section**:
   - Increase typography scale
   - Add dual CTAs
   - Consider hero image option
   - Increase padding

2. **Section Cards**:
   - Visual hierarchy (active vs coming soon)
   - Enhanced hover states
   - Better descriptions
   - Stronger CTAs

3. **Platform Value Proposition** (Optional):
   - Add "Why Asia Insights?" section
   - Platform benefits
   - Clear value statement

**Timeline**: 1-2 weeks

### Phase 2: Concierge Visual Elevation (High Priority)

1. **Hero Section**:
   - Increase typography to Markets scale
   - Enhance CTAs
   - Consider hero image
   - Increase padding

2. **All Sections**:
   - Increase typography scale
   - Increase section padding to `py-20`
   - Add CTAs to every section
   - Make sections more purposeful

3. **Service Cards**:
   - Add CTAs to each card
   - Increase padding
   - Enhance hover states

4. **Contact Section**:
   - Make more prominent
   - Add trust signals
   - Enhance form

**Timeline**: 1-2 weeks

### Phase 3: Navigation Refinement (Medium Priority)

1. **Header Navigation**:
   - Active state indicators
   - Enhanced hover states
   - Visual hierarchy

2. **Footer Navigation**:
   - Add Concierge links
   - Platform-level links
   - Better organization

3. **Breadcrumbs** (Optional):
   - Add to section pages
   - Clear navigation context

**Timeline**: 1 week

### Phase 4: Content Enhancement (Lower Priority)

1. **Concierge Content**:
   - Expand service descriptions
   - Add more testimonials
   - Enhance location cards
   - Add trust signals

2. **Homepage Content**:
   - Platform value proposition
   - Featured content (if needed)
   - Better section descriptions

**Timeline**: Ongoing

---

## 6. Success Criteria

### Homepage Hub Success

- **Clear Platform Identity**: Users understand Asia Insights is a multi-section platform
- **Easy Section Discovery**: Markets and Concierge are clearly accessible
- **Visual Hierarchy**: Active sections are more prominent than coming soon
- **Cohesive Design**: Hub feels integrated with spokes, not separate
- **Action-Oriented**: Clear CTAs guide users to sections

### Concierge Success

- **Matches Markets Confidence**: Typography, spacing, CTAs match Markets level
- **Purposeful Sections**: Every section invites action, not just informs
- **Clear User Journey**: Hero → Services → Testimonials → Contact flow
- **Premium Feel**: Visual design feels intentional, not legacy
- **Integrated Experience**: Feels like part of Asia Insights, not separate site

### Platform Cohesion Success

- **Consistent Design Language**: Typography, spacing, colors consistent
- **Clear Navigation**: Users can move between hub and spokes easily
- **Visual Hierarchy**: Platform identity clear, sections distinct but integrated
- **Brand Consistency**: Brand blue used consistently, Markets purple respected
- **User Confidence**: Platform feels mature, professional, "best in class"

---

## 7. Risks & Considerations

### Risk 1: Over-Designing

**Risk**: Making changes that don't align with Markets benchmark or user needs

**Mitigation**: 
- Follow Markets patterns strictly
- Test with users before major changes
- Incremental improvements, not redesigns

### Risk 2: Breaking Navigation

**Risk**: Navigation changes confuse users or break existing flows

**Mitigation**:
- Maintain current navigation structure
- Enhance, don't replace
- Test navigation paths thoroughly

### Risk 3: Content Gaps

**Risk**: Enhanced design reveals content gaps or placeholder content

**Mitigation**:
- Identify content needs early
- Prioritize content creation alongside design
- Use placeholders strategically

### Risk 4: Performance Impact

**Risk**: Visual enhancements (images, animations) impact performance

**Mitigation**:
- Optimize images (Next.js Image component)
- Use CSS animations (not JavaScript)
- Test performance on mobile

---

## 8. Next Steps

### Immediate Actions (Before Implementation)

1. **Review & Approve**: Review this plan with stakeholders
2. **Content Audit**: Audit Concierge content for gaps
3. **Image Assets**: Identify/acquire hero images for homepage and Concierge
4. **User Testing**: Test current navigation and homepage with users (optional)

### Implementation Approach

1. **Start with Homepage Hub**: Enhance hero and section cards first
2. **Then Concierge**: Apply visual elevation to Concierge sections
3. **Refine Navigation**: Enhance navigation after content is improved
4. **Iterate**: Test, gather feedback, refine

### Documentation Updates

1. **Update Design Baseline**: Document final patterns after implementation
2. **Update Gap Analysis**: Mark resolved gaps
3. **Create Style Guide**: Document platform-wide design patterns

---

## Summary

**Homepage Hub Evolution**:
- Enhance hero with stronger value proposition and dual CTAs
- Improve section cards with visual hierarchy
- Add platform value proposition section (optional)
- Ensure brand blue (#0054b6) used consistently

**Concierge Section Elevation**:
- Match Markets typography and spacing scale
- Add CTAs to every section
- Make sections purposeful, not just informational
- Enhance hero, service cards, and contact section

**Navigation Clarity**:
- Add active state indicators
- Enhance footer with Concierge links
- Ensure clear paths between hub and spokes

**Visual Consistency**:
- Follow Markets design patterns
- Use brand blue for platform, Markets purple for Markets
- Consistent typography, spacing, and card patterns

**Result**: Cohesive, premium platform experience where Homepage hub clearly presents Asia Insights, Markets and Concierge are first-class spokes, and the entire platform feels intentional, modern, and "best in class."

---

**Document Status**: Analysis complete. Ready for review and implementation planning.

**Next Steps**: Review recommendations, approve approach, begin Phase 1 implementation.


