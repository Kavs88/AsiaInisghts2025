# Asia Insights Site Structure Proposal

> **⚠️ WORKING DOCUMENT - PHASE 2**  
> This is the active working document for Phase 2 changes.  
> **Rollback Point**: See `ASIA_INSIGHTS_SITE_STRUCTURE_PROPOSAL_BACKUP_PHASE2.md` for the original, authoritative version before Phase 2 modifications.  
> **Last Updated**: January 16, 2025

## 📊 Implementation Status

### ✅ Completed

#### Homepage Hub (`/`)
- ✅ **Platform Identity**: Asia Insights branding established
- ✅ **Section Overview**: Cards for Markets, Concierge, and placeholders
- ✅ **Color Scheme**: Blue accent (#0054b6) for platform branding
- ✅ **Navigation**: Markets and Concierge in global nav
- ✅ **Featured Content**: Markets content preserved for SEO
- ✅ **Route Updates**: All internal links use `/markets/*` structure

#### Markets Section (`/markets/*`)
- ✅ **Homepage**: `/markets` - Full Markets experience (original Sunday Market)
- ✅ **Sellers Listing**: `/markets/sellers` - Vendor/seller directory
- ✅ **Seller Profiles**: `/markets/sellers/[slug]` - Individual seller pages
- ✅ **Market Days**: `/markets/market-days` - Market calendar
- ✅ **Vendor Dashboard**: `/markets/vendor/dashboard` - Vendor management
- ✅ **Vendor Application**: `/markets/vendor/apply` - New vendor signup
- ✅ **Vendor Profile Edit**: `/markets/vendor/profile/edit` - Vendor editing
- ✅ **Admin Interface**: `/markets/admin/*` - Full admin management
- ✅ **Color Scheme**: Purple accent (#8c52ff) for Markets branding
- ✅ **Route Migration**: All Markets routes under `/markets/*`
- ✅ **Legacy Redirects**: Old routes redirect to new structure

#### Concierge Section (`/concierge/*`)
- ✅ **Homepage**: `/concierge` - Full Concierge homepage with content
- ✅ **Services**: `/concierge/services` - Services overview (placeholder)
- ✅ **Relocation**: `/concierge/relocation` - Relocation services (placeholder)
- ✅ **Support**: `/concierge/support` - Support page (placeholder)
- ✅ **Color Scheme**: Blue accent (#0054b6) matching platform
- ✅ **Navigation**: Concierge in global nav
- ✅ **Content Migration**: Content from asia-insights.com migrated

### 🚧 In Progress / Partial

#### Legacy Route Cleanup
- ⚠️ **Legacy Routes**: Some old routes still exist with redirects
  - `/sellers/*` → redirects to `/markets/sellers/*`
  - `/market-days` → redirects to `/markets/market-days`
  - `/vendor/*` → redirects to `/markets/vendor/*`
  - `/admin/*` → redirects to `/markets/admin/*`
- **Status**: Redirects working, but old route files could be cleaned up

### 📋 Planned / Not Started

#### Property Section (`/property/*`)
- ❌ **Not Implemented**: No routes or pages exist
- **Planned Routes**:
  - `/property` - Section homepage
  - `/property/listings` - Property search and listings
  - `/property/insights` - Market analysis and trends
  - `/property/neighborhoods` - Area guides
  - `/property/agents` - Agent directory

#### Community Section (`/community/*`)
- ❌ **Not Implemented**: No routes or pages exist
- **Planned Routes**:
  - `/community` - Section homepage
  - `/community/events` - Event calendar
  - `/community/groups` - Group directory
  - `/community/forum` - Discussion forums
  - `/community/news` - Community news

#### Business Section (`/business/*`)
- ❌ **Not Implemented**: No routes or pages exist
- **Planned Routes**:
  - `/business` - Section homepage
  - `/business/directory` - Business listings
  - `/business/services` - Service providers
  - `/business/networking` - Professional network
  - `/business/resources` - Guides and tools

#### Lifestyle Section (`/lifestyle/*`)
- ❌ **Not Implemented**: No routes or pages exist
- **Planned Routes**:
  - `/lifestyle` - Section homepage
  - `/lifestyle/dining` - Restaurant guides
  - `/lifestyle/entertainment` - Events and activities
  - `/lifestyle/culture` - Cultural content
  - `/lifestyle/articles` - Lifestyle articles

#### Resources Section (`/resources/*`)
- ❌ **Not Implemented**: No routes or pages exist
- **Planned Routes**:
  - `/resources` - Section homepage
  - `/resources/guides` - How-to guides
  - `/resources/tools` - Interactive tools
  - `/resources/faq` - Frequently asked questions
  - `/resources/downloads` - Templates and downloads

### 🎯 Implementation Summary

| Section | Status | Routes | Content | Color Scheme |
|---------|--------|--------|---------|--------------|
| **Homepage Hub** | ✅ Complete | `/` | Full hub with section cards | Blue (#0054b6) |
| **Markets** | ✅ Complete | `/markets/*` | Full marketplace | Purple (#8c52ff) |
| **Concierge** | ✅ Complete | `/concierge/*` | Homepage + placeholders | Blue (#0054b6) |
| **Property** | ❌ Not Started | - | - | - |
| **Community** | ❌ Not Started | - | - | - |
| **Business** | ❌ Not Started | - | - | - |
| **Lifestyle** | ❌ Not Started | - | - | - |
| **Resources** | ❌ Not Started | - | - | - |

### 📈 Progress Metrics

- **Sections Implemented**: 2 of 6 (33%)
- **Homepage Hub**: ✅ 100% Complete
- **Markets Section**: ✅ 100% Complete
- **Concierge Section**: ✅ 100% Complete (homepage + structure)
- **Remaining Sections**: 4 of 6 (67% remaining)

### 🔄 Next Steps Recommendations

1. **Immediate**:
   - ✅ Homepage hub - **DONE**
   - ✅ Markets migration - **DONE**
   - ✅ Concierge structure - **DONE**

2. **Short-term**:
   - Complete Concierge content migration (services, relocation, support pages)
   - Clean up legacy route files (remove old routes, keep redirects)
   - Add section placeholders to homepage for remaining sections

3. **Medium-term**:
   - Decide priority order for remaining sections (Property, Community, Business, Lifestyle, Resources)
   - Create section scaffolding for next priority section
   - Plan content strategy for each section

4. **Long-term**:
   - Implement remaining sections based on priority
   - Cross-section features (unified search, shared accounts)
   - Advanced integration between sections

---

---

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

### 1. Markets (Sunday Market) ✅ **COMPLETE**
**Purpose**: Local marketplace platform connecting vendors, customers, and communities

**Content Focus**:
- Vendor/seller listings and profiles
- Product catalogs and shopping
- Market day schedules and venues
- Order management and messaging
- Community-driven commerce

**Implementation Status**: ✅ **FULLY IMPLEMENTED**
- All routes migrated to `/markets/*` structure
- Full marketplace functionality operational
- Purple color scheme (#8c52ff) applied
- Vendor dashboard, admin interface, and seller profiles all working
- Legacy routes redirect to new structure

**URL Structure**: `/markets/*` (legacy routes redirect)

### 2. Property ❌ **NOT STARTED**
**Purpose**: Real estate listings, property insights, and market analysis

**Content Focus**:
- Property listings (residential, commercial)
- Market trends and analysis
- Neighborhood guides
- Property investment insights
- Agent/broker profiles

**Implementation Status**: ❌ **NOT IMPLEMENTED**
- No routes or pages exist
- Placeholder card on homepage shows "Coming Soon"

**URL Structure**: `/property/*` (planned)
- `/property/listings` - Property search and listings
- `/property/insights` - Market analysis and trends
- `/property/neighborhoods` - Area guides
- `/property/agents` - Agent directory

### 3. Community ❌ **NOT STARTED**
**Purpose**: Local events, groups, forums, and community engagement

**Content Focus**:
- Community events calendar
- Local groups and organizations
- Discussion forums
- Community news and updates
- Volunteer opportunities

**Implementation Status**: ❌ **NOT IMPLEMENTED**
- No routes or pages exist
- Placeholder card on homepage shows "Coming Soon"

**URL Structure**: `/community/*` (planned)
- `/community/events` - Event calendar
- `/community/groups` - Group directory
- `/community/forum` - Discussion forums
- `/community/news` - Community news

### 4. Business 🚧 **IN PROGRESS**
**Purpose**: Business directory, services, and professional networking

**Content Focus**:
- Business directory
- Service provider listings
- Professional networking
- Business resources and guides
- Industry insights

**Implementation Status**: 🚧 **PARTIALLY IMPLEMENTED**
- ✅ `businesses` table created and active
- ✅ `/businesses` directory page implemented
- ✅ `/businesses/[slug]` profile page implemented
- ✅ Vendor migration logic active
- ⚠️ Service listings not yet implemented
- ⚠️ Networking features not yet implemented

**URL Structure**: `/businesses/*`
- `/businesses` - Business listings (Directory)
- `/businesses/[slug]` - Business Profile
- `/business/networking` - Professional network (Planned)
- `/business/resources` - Guides and tools (Planned)

### 5. Lifestyle ❌ **NOT STARTED**
**Purpose**: Culture, entertainment, dining, and lifestyle content

**Content Focus**:
- Restaurant and dining guides
- Entertainment and events
- Cultural insights
- Lifestyle articles and tips
- Local recommendations

**Implementation Status**: ❌ **NOT IMPLEMENTED**
- No routes or pages exist
- Placeholder card on homepage shows "Coming Soon"

**URL Structure**: `/lifestyle/*` (planned)
- `/lifestyle/dining` - Restaurant guides
- `/lifestyle/entertainment` - Events and activities
- `/lifestyle/culture` - Cultural content
- `/lifestyle/articles` - Lifestyle articles

### 6. Resources ❌ **NOT STARTED**
**Purpose**: Guides, tools, and reference materials

**Content Focus**:
- How-to guides
- Toolkits and calculators
- Reference materials
- FAQs and help center
- Downloads and templates

**Implementation Status**: ❌ **NOT IMPLEMENTED**
- No routes or pages exist
- Not yet added to homepage (only 6 cards shown, Resources not included)

**URL Structure**: `/resources/*` (planned)
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
/businesses/               → Business section homepage
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

## Implementation Phases (Actual Progress)

### Phase 1: Foundation ✅ **COMPLETE**
- ✅ Establish homepage hub
- ✅ Integrate Markets section (current Sunday Market)
- ✅ Basic navigation structure
- ✅ Concierge section structure added
- ✅ Business directory structure seeded

### Phase 2: Core Sections 🚧 **IN PROGRESS**
- 🚧 Business Section (Directory implemented)
- ❌ Add Property section (not started)
- ❌ Add Community section (not started)
- ⚠️ Cross-section search (global search exists, but not section-filtered)

### Phase 3: Expansion 📋 **PLANNED**
- ❌ Add Lifestyle section (not started)
- ❌ Add Resources section (not started)

### Phase 4: Integration 📋 **PLANNED**
- ⚠️ Unified user accounts (shared auth exists, but not fully integrated across sections)
- ❌ Cross-section features (not implemented)
- ❌ Advanced search and filtering (not implemented)

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

### Section-Specific Data Models
- **Markets**: `vendors`, `products`, `orders`, `market_days`
- **Business**: `businesses`, `services` (planned), `inquiries` (planned)

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

### Business Section
- Business claims/signups
- Directory searches
- Profile views

### Overall Platform
- Total active users
- Cross-section user movement
- Section-specific engagement
- Platform growth

## Conclusion

This structure positions **Asia Insights** as a comprehensive platform while maintaining the **Markets** section as a fully functional, independent vertical. The section-based approach allows for:

- **Scalability**: Easy addition of new sections
- **Independence**: Each section can evolve independently
- **Integration**: Shared infrastructure and user experience
- **Clarity**: Clear purpose and boundaries for each section

The current state reflects a successful transition to this architecture, with **Markets** fully migrated and **Business** now entering its initial operational phase.

