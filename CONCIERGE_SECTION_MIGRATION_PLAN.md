# Concierge Section Migration Plan

> **⚠️ PLANNING DOCUMENT - NOT FOR IMPLEMENTATION**  
> This document proposes the migration of existing asia-insights.com content into the Concierge section of Asia Insights.  
> **Authority**: This plan must align with `.cursor/rules.md` structural guardrails.  
> **Status**: Proposal only - no code changes, no file moves, no route implementations.

---

## 1. Purpose of the Concierge Section

### What Concierge Is

**Concierge** is a service-oriented section within Asia Insights that provides personalized support, guidance, and assistance for individuals and businesses navigating life, business, and relocation in Asia.

Concierge serves as the human-assisted service layer of the platform, complementing the self-service sections (Markets, Property, Community, Business, Lifestyle, Resources) with expert guidance and hands-on support.

### Who It Serves

**Primary Users**:
- **Expatriates and Relocators**: Individuals and families moving to or within Asia
- **Business Entrants**: Companies and entrepreneurs establishing operations in Asia
- **High-Value Service Seekers**: Users requiring personalized, white-glove assistance
- **Complex Case Handlers**: Situations requiring expert navigation of local systems

**User Characteristics**:
- Willing to pay for premium, personalized service
- Facing complex challenges requiring expert knowledge
- Time-constrained or preference for delegation
- Need for cultural and local expertise

### What Problems It Solves

**Core Problems**:
- **Relocation Complexity**: Navigating visas, housing, schools, healthcare, banking in new countries
- **Business Setup**: Company registration, compliance, local partnerships, market entry
- **Cultural Navigation**: Understanding local customs, business practices, social norms
- **Time Constraints**: Delegating research, coordination, and execution to experts
- **Language Barriers**: Accessing services and information in local languages
- **Trust and Verification**: Validating service providers, recommendations, and opportunities

**Value Proposition**:
Concierge provides expert, personalized assistance that saves time, reduces risk, and ensures successful outcomes for complex life and business transitions in Asia.

### How It Fits Alongside Other Sections

**Relationship to Markets**:
- Concierge may refer clients to Markets vendors for specific needs
- Concierge does NOT manage vendors or market days
- Concierge may use Markets data for recommendations (read-only)
- Clear boundary: Concierge is service, Markets is commerce

**Relationship to Property**:
- Concierge may assist with property search and transactions
- Concierge does NOT own property listings
- Concierge may provide property-related services (viewing coordination, negotiation support)
- Clear boundary: Concierge is service, Property is listings

**Relationship to Community**:
- Concierge may help clients connect with community groups
- Concierge does NOT manage community events or forums
- Concierge may facilitate introductions and networking
- Clear boundary: Concierge is service, Community is self-organized

**Relationship to Business**:
- Concierge may assist with business setup and networking
- Concierge does NOT own business directory or listings
- Concierge may provide business advisory services
- Clear boundary: Concierge is service, Business is directory

**Relationship to Lifestyle**:
- Concierge may provide personalized lifestyle recommendations
- Concierge does NOT own lifestyle content or guides
- Concierge may curate experiences based on client preferences
- Clear boundary: Concierge is service, Lifestyle is content

**Relationship to Resources**:
- Concierge may reference Resources guides and tools
- Concierge does NOT own Resources content
- Concierge may provide personalized interpretations of Resources
- Clear boundary: Concierge is service, Resources is self-service

**Summary**: Concierge is the **service layer** that uses other sections as **information sources** and **referral destinations**, but does not own or manage their content or functionality.

---

## 2. Target URL Structure

### Proposed Path Structure

**Primary Section Path**: `/concierge`

**Subpages** (proposed structure):

```
/concierge                          → Concierge homepage (services overview)
/concierge/services                 → Services catalog
/concierge/relocation               → Relocation services
/concierge/business-setup           → Business setup services
/concierge/travel-support           → Travel and logistics support
/concierge/onboarding               → New arrival onboarding
/concierge/consultation             → Consultation booking
/concierge/about                    → About Concierge team
/concierge/contact                  → Contact Concierge
```

### What Remains Global vs Concierge-Only

**Global (Homepage Hub)**:
- Platform navigation and section links
- Global search (includes Concierge content)
- Platform-level announcements
- User account management (shared across sections)

**Concierge-Only**:
- Service descriptions and pricing
- Consultation booking and scheduling
- Client portal and case management
- Concierge team profiles and expertise
- Service-specific content and resources

**Shared Infrastructure** (used by Concierge but not owned):
- Authentication system (shared)
- User profiles (shared)
- Media storage (shared, organized by section)
- Design system components (shared)

---

## 3. Content Migration Mapping

### Mapping Strategy

**Approach**: Map existing asia-insights.com pages to new Concierge section structure while preserving content value and SEO authority.

### Content Migration Table

| Current Page (asia-insights.com) | Target Path | Migration Type | Notes |
|----------------------------------|-------------|----------------|-------|
| `/` (homepage) | `/concierge` | **Content Rewrite** | Transform homepage into Concierge section homepage, preserve key messaging |
| `/services` | `/concierge/services` | **Direct Migration** | Service catalog, minimal changes |
| `/relocation` | `/concierge/relocation` | **Direct Migration** | Relocation services, preserve content |
| `/business-support` | `/concierge/business-setup` | **Content Rewrite** | Reframe as business setup service, update terminology |
| `/travel` | `/concierge/travel-support` | **Direct Migration** | Travel services, preserve content |
| `/onboarding` | `/concierge/onboarding` | **Direct Migration** | Onboarding services, preserve content |
| `/contact` | `/concierge/contact` | **Direct Migration** | Contact form and information |
| `/about` | `/concierge/about` | **Content Rewrite** | Reframe as Concierge team/about, not platform about |
| `/blog/*` | `/concierge/resources` or `/resources` | **Content Review** | Determine if blog content belongs in Concierge or Resources section |
| `/testimonials` | `/concierge` (integrated) | **Content Rewrite** | Integrate testimonials into Concierge homepage |
| `/pricing` | `/concierge/services` (integrated) | **Content Rewrite** | Integrate pricing into services pages |

### Migration Type Definitions

**Direct Migration**:
- Content moves as-is with minimal changes
- URL structure changes, content preserved
- SEO redirects required
- Low risk, high preservation

**Content Rewrite**:
- Content reframed for section context
- Messaging updated to reflect Concierge as section, not platform
- Core value preserved, presentation updated
- Medium risk, requires content review

**Content Review**:
- Content evaluated for appropriate section placement
- May move to Concierge, Resources, or other sections
- Requires editorial decision
- Low risk, requires classification

**Content to Deprecate**:
- Platform-level "About Asia Insights" content (moves to homepage hub)
- Duplicate navigation elements (handled by platform navigation)
- Standalone contact pages (consolidate into Concierge contact)
- Outdated service descriptions (update during migration)

### Content Preservation Priorities

**High Priority** (must preserve):
- Service descriptions and value propositions
- Client testimonials and case studies
- Team expertise and credentials
- Contact information and booking flows
- SEO-valuable content and keywords

**Medium Priority** (preserve with updates):
- Pricing information (may need restructuring)
- Process descriptions (update for section context)
- Blog content (evaluate for section placement)

**Low Priority** (can be refreshed):
- Generic platform messaging
- Duplicate navigation elements
- Outdated service offerings

---

## 4. Ownership Boundaries

### What Concierge Owns

**Data Ownership**:
- Client records and case management data
- Service bookings and consultations
- Concierge team profiles and availability
- Service-specific content and resources
- Client testimonials and case studies

**Business Logic Ownership**:
- Consultation booking and scheduling
- Case management and workflow
- Service delivery coordination
- Client communication and updates
- Service pricing and package management

**Content Ownership**:
- Service descriptions and offerings
- Concierge team profiles
- Service-specific guides and resources
- Client success stories (with permission)

**Functional Ownership**:
- Consultation booking system
- Client portal and case tracking
- Service delivery workflows
- Concierge team management

### What Concierge Must NOT Own

**Explicit Prohibitions** (per `.cursor/rules.md`):

- **Vendor/Seller Management**: Markets owns vendors, sellers, and market days
- **Property Listings**: Property section owns property data
- **Community Events**: Community section owns events and groups
- **Business Directory**: Business section owns business listings
- **Lifestyle Content**: Lifestyle section owns lifestyle articles
- **Resource Guides**: Resources section owns guides and tools

**Cross-Section Boundaries**:

- **No Shared Tables**: Concierge cannot use Markets' vendors table, Property's listings table, etc.
- **No Shared Logic**: Concierge cannot reuse Markets' vendor search logic, Property's listing logic, etc.
- **No Shared Workflows**: Concierge cannot manage Markets orders, Property inquiries, etc.

### How Concierge Interacts with Other Sections

**Allowed Interactions**:

- **Links and Referrals**: Concierge can link to Markets vendors, Property listings, Community events
- **Read-Only Data Access**: Concierge can read Markets vendor data for recommendations (via API, not direct table access)
- **Recommendations**: Concierge can recommend Markets vendors, Property listings, etc. based on client needs
- **Cross-Section Navigation**: Concierge can direct clients to appropriate sections

**Prohibited Interactions**:

- **Shared Data Models**: Concierge cannot create dependencies on other sections' tables
- **Shared Business Logic**: Concierge cannot reuse other sections' search, filtering, or management logic
- **Shared Workflows**: Concierge cannot manage other sections' core functionality
- **Data Ownership**: Concierge cannot claim ownership of other sections' data

**Rule of Thumb**: Concierge can **reference** and **recommend** other sections, but cannot **own** or **manage** their content or functionality.

---

## 5. SEO & Redirect Strategy (High-Level)

### SEO Preservation Goals

**Primary Objectives**:
- Preserve existing domain authority and rankings
- Maintain keyword rankings for service-related searches
- Ensure no broken links or 404 errors
- Preserve backlink value and referral traffic

### Redirect Strategy

**Permanent Redirects (301)**:
- `/services` → `/concierge/services`
- `/relocation` → `/concierge/relocation`
- `/business-support` → `/concierge/business-setup`
- `/travel` → `/concierge/travel-support`
- `/onboarding` → `/concierge/onboarding`
- `/contact` → `/concierge/contact`

**Temporary Redirects (302)** (if needed):
- Homepage redirects during migration period
- Test pages or staging redirects

**Redirect Implementation Notes**:
- Implement at server/application level (Next.js redirects)
- Preserve query parameters where applicable
- Maintain redirect chains (avoid double redirects)
- Monitor redirect performance and user behavior

### SEO Considerations

**URL Structure**:
- Maintain descriptive, keyword-rich URLs
- Preserve URL hierarchy and structure where possible
- Use consistent URL patterns within Concierge section

**Content Optimization**:
- Preserve existing SEO-optimized content
- Update meta tags and descriptions for section context
- Maintain internal linking structure
- Preserve external backlinks and references

**Technical SEO**:
- Update sitemap.xml to include new Concierge URLs
- Submit updated sitemap to search engines
- Monitor crawl errors and fix promptly
- Preserve canonical tags and structured data

**No Implementation Yet**: This is a planning document. Redirect implementation will be handled in a separate, implementation-focused task.

---

## 6. Risks & Guardrails

### What Could Go Wrong

**Structural Risks**:
- **Section Boundary Violations**: Accidentally sharing data or logic with other sections
- **Route Conflicts**: New routes conflicting with existing platform routes
- **Navigation Confusion**: Users unable to find Concierge or understand its relationship to other sections

**Content Risks**:
- **SEO Loss**: Poor redirect implementation causing ranking drops
- **Broken Links**: Internal or external links pointing to old URLs
- **Content Duplication**: Same content appearing in multiple sections

**Technical Risks**:
- **Performance Impact**: Additional routes and content affecting load times
- **Authentication Issues**: Concierge-specific access controls conflicting with platform auth
- **Data Migration Errors**: Client data or content lost during migration

**User Experience Risks**:
- **Confusion**: Users not understanding Concierge's role vs. self-service sections
- **Access Issues**: Existing users unable to access migrated content
- **Booking Disruption**: Consultation booking system downtime during migration

### What Must Not Be Changed

**Structural Constraints** (per `.cursor/rules.md`):

- **Site Hierarchy**: Cannot change the six-section structure
- **Section Boundaries**: Cannot merge or collapse sections
- **Route Structure**: Cannot move Markets outside `/markets`, cannot move Concierge outside `/concierge`
- **Section Independence**: Cannot create cross-section dependencies

**Functional Constraints**:

- **Markets Ownership**: Cannot move vendor/seller functionality to Concierge
- **Shared Infrastructure**: Cannot modify shared auth, storage, or design system without platform approval
- **Documentation Authority**: Code must follow documented structure, not reinterpret it

**Content Constraints**:

- **Backup Files**: Cannot modify backup files (`*_BACKUP_*.md`)
- **Architecture Documentation**: Cannot change documented architecture without approval
- **Working Documents**: Can add proposals but cannot change original structure

### Rollback Considerations

**Rollback Triggers**:
- Significant SEO ranking drops
- User access issues or broken functionality
- Data loss or corruption
- Structural boundary violations

**Rollback Strategy**:
- Maintain backup of original asia-insights.com content
- Preserve original URL structure until migration is verified
- Keep redirects active during rollback period
- Document rollback procedures before migration

**Rollback Documentation**:
- Document all changes made during migration
- Maintain change log for easy reversal
- Preserve original file locations and structures
- Keep backup of database and content before migration

### Guardrails and Safety Measures

**Pre-Migration Checklist**:
- [ ] Review and approve migration plan
- [ ] Verify section boundaries are respected
- [ ] Confirm redirect strategy is non-breaking
- [ ] Backup all existing content and data
- [ ] Test migration in staging environment
- [ ] Verify SEO preservation strategy

**During Migration**:
- [ ] Monitor for structural boundary violations
- [ ] Verify redirects are working correctly
- [ ] Check for broken links or 404 errors
- [ ] Ensure section independence is maintained
- [ ] Validate content ownership boundaries

**Post-Migration**:
- [ ] Verify SEO rankings are preserved
- [ ] Confirm user access and functionality
- [ ] Check for cross-section dependency violations
- [ ] Monitor performance and user behavior
- [ ] Document any issues or deviations

### Explicit "Not in Scope" Items

**Out of Scope for This Migration**:
- Implementation of routes or file moves (separate task)
- Changes to Markets, Property, or other sections
- Modifications to shared infrastructure
- New feature development for Concierge
- Changes to platform navigation (beyond Concierge links)
- Monetization or pricing strategy changes
- Team structure or operational changes

**Future Considerations** (not part of this plan):
- Integration with other sections' APIs
- Advanced cross-section features
- Concierge-specific mobile app
- White-label Concierge offerings

---

## 7. Implementation Readiness

### Prerequisites

**Before Migration Can Begin**:
- Architecture documentation approved and finalized
- Section boundaries clearly defined and documented
- Redirect strategy approved by SEO team
- Content migration mapping reviewed and approved
- Rollback procedures documented and tested

### Dependencies

**Required Before Implementation**:
- Asia Insights platform structure established
- Homepage hub navigation in place
- Section routing framework ready
- Shared infrastructure (auth, storage) operational
- Design system components available

### Next Steps (After Plan Approval)

1. **Content Audit**: Review all existing asia-insights.com content
2. **Staging Migration**: Test migration in staging environment
3. **SEO Preparation**: Prepare redirects and sitemap updates
4. **User Communication**: Notify existing users of upcoming changes
5. **Implementation**: Execute migration following this plan
6. **Verification**: Verify all guardrails and boundaries are respected
7. **Monitoring**: Monitor SEO, performance, and user behavior post-migration

---

## Summary

This migration plan proposes moving existing asia-insights.com content into a new **Concierge section** within the Asia Insights platform, maintaining section independence while preserving content value and SEO authority.

**Key Principles**:
- Concierge is a **service section**, not a content owner of other sections
- Migration preserves **existing content value** while reframing for section context
- **Section boundaries** are strictly maintained per `.cursor/rules.md`
- **SEO and user experience** are preserved through careful redirect strategy
- **Rollback procedures** ensure safety and reversibility

**Status**: This is a **planning document only**. No code changes, file moves, or route implementations are included. Implementation will follow in a separate, approved task.


