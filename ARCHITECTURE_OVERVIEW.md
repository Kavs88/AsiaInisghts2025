# Asia Insights Architecture Overview

## What Is Asia Insights?

**Asia Insights** is a multi-vertical platform that serves as a comprehensive hub for life, business, and community in Asia. It is not a single product, but rather a unified ecosystem of independent sections, each addressing specific domains while sharing common infrastructure and user experience.

The platform operates on a section-based architecture where each vertical maintains its own content, data models, and business logic while participating in a shared platform identity.

## What Is a "Section"?

A **section** is an independent vertical within the Asia Insights platform. Each section:

- Has a distinct purpose and domain focus
- Maintains its own content, data, and business logic
- Operates under its own URL namespace (e.g., `/markets/*`, `/property/*`)
- Serves specific user types and use cases
- Can evolve independently without affecting other sections

Sections are not separate applications or subdomains. They are integrated parts of the Asia Insights platform that share infrastructure, authentication, and design systems while maintaining functional independence.

## The Six Core Sections

### 1. Markets

**Purpose**: Local marketplace platform connecting vendors, customers, and communities.

**Domain**: Commerce, retail, local business, product catalogs, market events.

**User Types**: Vendors (sellers), customers, market organizers, administrators.

**Key Functions**:
- Vendor and seller listings and profiles
- Product catalogs and shopping experiences
- Market day schedules and venue management
- Order management and customer communication
- Community-driven commerce

**Current Status**: Implemented as the Sunday Market codebase, integrated as the Markets section.

### 2. Property

**Purpose**: Real estate listings, property insights, and market analysis.

**Domain**: Residential and commercial property, real estate transactions, property investment, neighborhood information.

**User Types**: Property buyers, sellers, real estate agents, investors, property seekers.

**Key Functions**:
- Property listings and search
- Market trends and analysis
- Neighborhood guides and insights
- Agent and broker directories
- Property investment resources

**Current Status**: Planned section, not yet implemented.

### 3. Community

**Purpose**: Local events, groups, forums, and community engagement.

**Domain**: Community events, local organizations, discussion forums, community news, volunteer opportunities.

**User Types**: Community residents, event organizers, group administrators, volunteers, community members.

**Key Functions**:
- Community events calendar
- Local groups and organizations directory
- Discussion forums and community conversations
- Community news and updates
- Volunteer and participation opportunities

**Current Status**: Planned section, not yet implemented.

### 4. Business

**Purpose**: Business directory, services, and professional networking.

**Domain**: Business listings, service providers, professional networking, business resources, industry insights.

**User Types**: Business owners, service providers, professionals, entrepreneurs, business seekers.

**Key Functions**:
- Business directory and listings
- Service provider directories
- Professional networking and connections
- Business resources and guides
- Industry insights and information

**Current Status**: Planned section, not yet implemented.

### 5. Lifestyle

**Purpose**: Culture, entertainment, dining, and lifestyle content.

**Domain**: Restaurants and dining, entertainment and events, cultural insights, lifestyle articles, local recommendations.

**User Types**: Residents, visitors, culture enthusiasts, food and entertainment seekers, lifestyle readers.

**Key Functions**:
- Restaurant and dining guides
- Entertainment and event listings
- Cultural content and insights
- Lifestyle articles and recommendations
- Local discovery and recommendations

**Current Status**: Planned section, not yet implemented.

### 6. Resources

**Purpose**: Guides, tools, and reference materials.

**Domain**: How-to guides, toolkits and calculators, reference materials, FAQs, downloadable resources.

**User Types**: All platform users (cross-section utility).

**Key Functions**:
- How-to guides and tutorials
- Interactive tools and calculators
- Reference materials and documentation
- Frequently asked questions and help center
- Downloadable templates and resources

**Current Status**: Planned section, not yet implemented.

## The Homepage as Hub

The Asia Insights homepage (`/`) serves as a **navigation hub**, not a content owner. It does not:

- Own content specific to any section
- Compete with sections for user attention
- Duplicate section functionality

Instead, it provides:

- **Navigation**: Clear entry points to all sections
- **Discovery**: Featured content from across sections
- **Search**: Global search across all sections
- **Context**: Platform-level announcements and updates
- **Orientation**: Help users understand the platform structure

The homepage is intentionally lightweight, directing users to the appropriate section rather than attempting to be all things to all users.

## Section Independence and Boundaries

### Independence Principles

Each section operates independently:

- **Data Independence**: Sections maintain separate data models and tables
- **Logic Independence**: Business logic is section-specific, not shared
- **Route Independence**: Each section has its own URL namespace
- **Evolution Independence**: Sections can evolve without affecting others

### Boundary Enforcement

Sections maintain clear boundaries:

- **No Cross-Section Data Sharing**: Markets vendors are not accessible to Property section
- **No Cross-Section Logic Sharing**: Property search logic is not used by Markets
- **No Cross-Section Dependencies**: One section's functionality does not depend on another's

### What This Means in Practice

If Markets has a "vendors" table, Property cannot use it. Property must create its own equivalent (e.g., "properties" or "listings"). If Markets has vendor search functionality, Property must implement its own search for properties.

This independence ensures:
- Sections can scale independently
- Sections can be developed by different teams
- Sections can have different release cycles
- Sections can be maintained without cross-section coordination

## Shared vs Non-Shared Responsibilities

### Shared Infrastructure (Allowed)

The following are shared across all sections:

- **Authentication**: Single user account system
- **User Management**: Shared user tables and profiles
- **Storage**: Unified media storage (organized by section)
- **Design System**: Shared UI components, styles, and patterns
- **Infrastructure**: Database connections, API utilities, common utilities
- **Platform Identity**: Asia Insights branding and navigation

### Section-Specific (Not Shared)

The following belong to individual sections:

- **Business Logic**: Vendor management (Markets), property search (Property), event management (Community)
- **Data Models**: Vendors table (Markets), properties table (Property), events table (Community)
- **Workflows**: Order processing (Markets), property inquiries (Property), event registration (Community)
- **Section-Specific Features**: Market days (Markets), property comparisons (Property), community forums (Community)

### Rule of Thumb

**If it's about the domain (vendors, properties, events), it's section-specific. If it's about the platform (users, storage, UI), it's shared.**

## Documentation-First Rule

### Documentation Governs Code

In Asia Insights, **documentation defines structure, and code implements structure**. Code does not get to reinterpret or redefine what documentation establishes.

### Authority Hierarchy

1. **Architecture Documentation** (`ARCHITECTURE_OVERVIEW.md`, `ASIA_INSIGHTS_SITE_STRUCTURE_PROPOSAL.md`)
   - Defines structure, hierarchy, and boundaries
   - Authoritative source for architectural decisions
   - Code must align with documented structure

2. **Backup Files** (`*_BACKUP_*.md`)
   - Historical records and rollback points
   - Read-only, immutable
   - Used to restore previous states

3. **Working Documents** (`ASIA_INSIGHTS_SITE_STRUCTURE_PROPOSAL.md`)
   - Active planning and iteration
   - Editable but constrained by original structure
   - Proposals and clarifications, not structural changes

4. **Code Implementation**
   - Implements documented structure
   - Must follow documented routes, boundaries, and patterns
   - Does not define or change structure

### What This Means

If documentation says Markets is at `/markets/*`, code uses `/markets/*`. If documentation says sections are independent, code maintains independence. If documentation says Markets owns vendors, code does not share vendor logic with other sections.

**When documentation and code conflict, documentation wins, and code is updated to match.**

## Platform Identity and Branding

### Master Brand

**Asia Insights** is the master brand and platform identity. It provides:

- Unified user experience across sections
- Consistent design language and navigation
- Shared authentication and user accounts
- Platform-level features and utilities

### Section Brands

Sections may have sub-brands (e.g., "Sunday Market" within Markets) but operate under the Asia Insights umbrella. Section branding:

- Reinforces section identity
- Does not compete with platform identity
- Maintains visual consistency with platform
- Supports section-specific marketing and communication

### Consistency

While sections maintain independence in functionality, they share:

- Design system and UI patterns
- Navigation structure and user flows
- Authentication and user management
- Platform-level features and utilities

This consistency ensures users understand they are within the Asia Insights ecosystem while recognizing the distinct purpose of each section.

## URL Structure and Routing

### Section-Based Routing

Each section operates under its own URL namespace:

- `/markets/*` - Markets section
- `/property/*` - Property section
- `/community/*` - Community section
- `/business/*` - Business section
- `/lifestyle/*` - Lifestyle section
- `/resources/*` - Resources section

### Homepage Hub

The root (`/`) serves as the homepage hub, providing navigation and discovery without competing with sections.

### Route Preservation

Existing routes (e.g., `/sellers/*` for Markets) can be preserved through redirects or direct mapping, ensuring backward compatibility while maintaining the documented structure.

## Development and Maintenance

### Section Development

Sections can be developed independently:

- Different teams can work on different sections
- Sections can have different release cycles
- Sections can use different implementation approaches (within shared infrastructure)
- Sections can evolve at different paces

### Platform Maintenance

Platform-level maintenance affects all sections:

- Infrastructure updates (database, storage, authentication)
- Design system updates
- Platform navigation changes
- Shared utility updates

### Coordination Points

Coordination is required for:

- Platform-level changes affecting all sections
- Shared infrastructure updates
- Design system modifications
- Cross-section user experience improvements

## Summary

Asia Insights is a section-based platform where:

- **Six independent sections** serve distinct domains (Markets, Property, Community, Business, Lifestyle, Resources)
- **Homepage hub** provides navigation and discovery without owning content
- **Section independence** ensures sections can evolve separately
- **Shared infrastructure** provides common utilities while maintaining boundaries
- **Documentation governs code** to ensure structure remains stable and predictable

This architecture enables scalability, independent development, and clear boundaries while maintaining a unified platform identity and user experience.


