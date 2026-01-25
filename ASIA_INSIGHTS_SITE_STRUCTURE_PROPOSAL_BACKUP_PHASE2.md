# Asia Insights Site Structure Proposal

## Overview

**Asia Insights** serves as the primary hub for multiple vertical content sections, each addressing different aspects of life, business, and community in Asia. The current Sunday Market project becomes the **Markets** section within this larger ecosystem.

## Site Hierarchy

```
Asia Insights (Homepage Hub)
├── Markets (Sunday Market)
├── Property
├── Community
├── Business
├── Lifestyle
└── Resources
```

## Section Definitions

### 1. Markets (Sunday Market)
**Purpose**: Local marketplace platform connecting vendors, customers, and communities

**Content Focus**:
- Vendor/seller listings and profiles
- Product catalogs and shopping
- Market day schedules and venues
- Order management and messaging
- Community-driven commerce

**Current Implementation**: The existing Sunday Market codebase serves as the complete Markets section.

**URL Structure**: `/markets/*` or `/sellers/*` (current routes can be preserved with redirects)

### 2. Property
**Purpose**: Real estate listings, property insights, and market analysis

**Content Focus**:
- Property listings (residential, commercial)
- Market trends and analysis
- Neighborhood guides
- Property investment insights
- Agent/broker profiles

**URL Structure**: `/property/*`
- `/property/listings` - Property search and listings
- `/property/insights` - Market analysis and trends
- `/property/neighborhoods` - Area guides
- `/property/agents` - Agent directory

### 3. Community
**Purpose**: Local events, groups, forums, and community engagement

**Content Focus**:
- Community events calendar
- Local groups and organizations
- Discussion forums
- Community news and updates
- Volunteer opportunities

**URL Structure**: `/community/*`
- `/community/events` - Event calendar
- `/community/groups` - Group directory
- `/community/forum` - Discussion forums
- `/community/news` - Community news

### 4. Business
**Purpose**: Business directory, services, and professional networking

**Content Focus**:
- Business directory
- Service provider listings
- Professional networking
- Business resources and guides
- Industry insights

**URL Structure**: `/business/*`
- `/business/directory` - Business listings
- `/business/services` - Service providers
- `/business/networking` - Professional network
- `/business/resources` - Guides and tools

### 5. Lifestyle
**Purpose**: Culture, entertainment, dining, and lifestyle content

**Content Focus**:
- Restaurant and dining guides
- Entertainment and events
- Cultural insights
- Lifestyle articles and tips
- Local recommendations

**URL Structure**: `/lifestyle/*`
- `/lifestyle/dining` - Restaurant guides
- `/lifestyle/entertainment` - Events and activities
- `/lifestyle/culture` - Cultural content
- `/lifestyle/articles` - Lifestyle articles

### 6. Resources
**Purpose**: Guides, tools, and reference materials

**Content Focus**:
- How-to guides
- Toolkits and calculators
- Reference materials
- FAQs and help center
- Downloads and templates

**URL Structure**: `/resources/*`
- `/resources/guides` - How-to guides
- `/resources/tools` - Interactive tools
- `/resources/faq` - Frequently asked questions
- `/resources/downloads` - Templates and downloads

## Homepage Hub Structure

The **Asia Insights homepage** (`/`) serves as:

1. **Navigation Hub**: Primary entry point with clear section links
2. **Featured Content**: Highlights from each section
3. **Search**: Global search across all sections
4. **Quick Access**: Direct links to popular destinations
5. **News/Updates**: Cross-section announcements and updates

## URL Structure Recommendations

### Option A: Section Prefix (Recommended)
```
/                          → Asia Insights homepage
/markets/                  → Markets section homepage
/markets/sellers           → Current sellers listing
/markets/sellers/[slug]    → Current seller profiles
/property/                 → Property section homepage
/property/listings         → Property listings
/community/                → Community section homepage
/community/events          → Community events
/business/                 → Business section homepage
/lifestyle/                → Lifestyle section homepage
/resources/                → Resources section homepage
```

**Advantages**:
- Clear section boundaries
- Easy to understand hierarchy
- Scalable for future sections
- SEO-friendly structure

### Option B: Subdomain Approach
```
asia-insights.com          → Homepage hub
markets.asia-insights.com   → Markets section
property.asia-insights.com  → Property section
community.asia-insights.com → Community section
```

**Advantages**:
- Complete section isolation
- Independent deployment possible
- Clear brand separation

**Disadvantages**:
- More complex infrastructure
- SEO considerations across domains
- Cookie/session management complexity

## Markets Section Integration

### Current Routes (Preserved)
- `/sellers` → `/markets/sellers` (redirect or direct)
- `/sellers/[slug]` → `/markets/sellers/[slug]` (redirect or direct)
- `/admin/*` → `/markets/admin/*` (admin routes can remain or move)

### Markets Section Homepage
**Purpose**: Entry point for the Markets vertical

**Content**:
- Featured vendors/sellers
- Upcoming market days
- Popular products
- Quick links to seller directory, market calendar
- Market-specific search

**URL**: `/markets` or `/markets/home`

## Navigation Structure

### Global Navigation (All Pages)
- Home (Asia Insights hub)
- Markets
- Property
- Community
- Business
- Lifestyle
- Resources

### Section-Specific Navigation
Each section has its own sub-navigation:
- **Markets**: Sellers, Products, Market Days, Orders
- **Property**: Listings, Insights, Neighborhoods, Agents
- **Community**: Events, Groups, Forum, News
- **Business**: Directory, Services, Networking, Resources
- **Lifestyle**: Dining, Entertainment, Culture, Articles
- **Resources**: Guides, Tools, FAQ, Downloads

## Content Purpose by Section

### Markets
**Goal**: Enable local commerce and vendor-customer connections
**User Types**: Vendors, Customers, Admins
**Key Actions**: Browse, Shop, Order, Manage

### Property
**Goal**: Facilitate property discovery and real estate transactions
**User Types**: Buyers, Sellers, Agents, Investors
**Key Actions**: Search, View, Compare, Contact

### Community
**Goal**: Build and strengthen local community connections
**User Types**: Residents, Organizers, Volunteers
**Key Actions**: Discover, Join, Participate, Share

### Business
**Goal**: Connect businesses with customers and each other
**User Types**: Business Owners, Service Providers, Professionals
**Key Actions**: List, Network, Promote, Collaborate

### Lifestyle
**Goal**: Provide cultural and lifestyle insights and recommendations
**User Types**: Residents, Visitors, Culture Enthusiasts
**Key Actions**: Explore, Discover, Learn, Experience

### Resources
**Goal**: Offer practical tools and information
**User Types**: All user types
**Key Actions**: Access, Download, Learn, Use

## Design Considerations

### Visual Hierarchy
- **Homepage**: Equal weight to all sections, clear visual separation
- **Section Pages**: Section branding with global navigation
- **Content Pages**: Section context maintained, breadcrumbs for navigation

### Branding
- **Asia Insights**: Master brand, umbrella identity
- **Section Brands**: Sub-brands (e.g., "Sunday Market" within Markets)
- **Consistency**: Shared design system, varied section colors/themes

### User Experience
- **Seamless Navigation**: Easy movement between sections
- **Context Preservation**: Users understand which section they're in
- **Unified Search**: Search across all sections from homepage
- **Account Integration**: Single account system across all sections

## Implementation Phases (Conceptual)

### Phase 1: Foundation
- Establish homepage hub
- Integrate Markets section (current Sunday Market)
- Basic navigation structure

### Phase 2: Core Sections
- Add Property section
- Add Community section
- Cross-section search

### Phase 3: Expansion
- Add Business section
- Add Lifestyle section
- Add Resources section

### Phase 4: Integration
- Unified user accounts
- Cross-section features
- Advanced search and filtering

## Technical Considerations

### Shared Infrastructure
- **Authentication**: Single auth system across all sections
- **Database**: Shared user tables, section-specific content tables
- **Storage**: Unified media storage with section organization
- **Search**: Global search index with section filtering

### Section Independence
- **Code Organization**: Each section can be a separate module/route group
- **Deployment**: Sections can be developed and deployed independently
- **Scaling**: Each section can scale independently based on traffic

### Data Model
- **Users**: Shared across all sections
- **Content**: Section-specific tables (vendors, properties, events, etc.)
- **Relationships**: Cross-section relationships where needed (e.g., vendor properties)

## Success Metrics

### Homepage Hub
- Cross-section navigation usage
- Search query distribution
- Section entry points

### Markets Section
- Vendor sign-ups
- Product listings
- Order volume
- User engagement

### Overall Platform
- Total active users
- Cross-section user movement
- Section-specific engagement
- Platform growth

## Conclusion

This structure positions **Asia Insights** as a comprehensive platform while maintaining the **Markets** section (Sunday Market) as a fully functional, independent vertical. The section-based approach allows for:

- **Scalability**: Easy addition of new sections
- **Independence**: Each section can evolve independently
- **Integration**: Shared infrastructure and user experience
- **Clarity**: Clear purpose and boundaries for each section

The current Sunday Market implementation becomes the Markets section with minimal disruption, preserving all existing functionality while gaining the context of a larger platform ecosystem.


