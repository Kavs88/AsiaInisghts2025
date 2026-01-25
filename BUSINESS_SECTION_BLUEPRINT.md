# Business Section Blueprint

> **⚠️ PLANNING DOCUMENT ONLY**  
> This document defines the architectural blueprint for a future Business section.  
> **Status**: Planning phase - no implementation  
> **Authority**: Per `.cursor/rules.md` and `ARCHITECTURE_OVERVIEW.md`, Business will be an independent section.  
> **Last Updated**: January 16, 2025

---

## 1. Purpose & Scope

### What Business Is

**Business** is an independent vertical section within the Asia Insights platform that provides:

- **General business directory**: Comprehensive listings of businesses across Southeast Asia
- **Service-based discovery**: Service offerings, not product catalogs
- **Professional networking**: Business-to-business connections and referrals
- **Customer inquiry system**: Inquiry and booking workflows (not e-commerce orders)
- **Industry classification**: Business categorization by industry, service type, and specialization

**Business serves**: Business owners, service providers, professionals, entrepreneurs, and customers seeking services.

### What Business Is Not

**Business is NOT**:

- A marketplace for products (that's Markets)
- A real estate platform (that's Property)
- A community events platform (that's Community)
- A lifestyle content platform (that's Lifestyle)
- A general resources library (that's Resources)

**Business does NOT**:

- Share data models with Markets
- Reuse Markets business logic
- Depend on Markets functionality
- Own Markets data or workflows

### How Business Differs from Markets

| Aspect | Markets | Business |
|--------|---------|---------|
| **Primary Focus** | Market vendors selling products | General businesses offering services |
| **Transaction Model** | E-commerce orders with cart/checkout | Inquiries, bookings, consultations |
| **Event Model** | Market days with stalls and attendance | Business hours, availability, appointments |
| **Product Model** | Physical products with inventory | Services with descriptions and pricing |
| **Discovery Context** | Market events, vendor stalls | Business directory, industry search |
| **User Type** | Market vendors, market customers | Business owners, service seekers, professionals |

**Key Distinction**: Markets is event-driven commerce (market days, products, orders). Business is service-driven discovery (directory, services, inquiries).

---

## 2. Relationship to Markets

### Patterns Reused (UI/UX Only)

**Business will reuse the following UI/UX patterns from Markets**:

1. **Profile Structure**
   - Business profile pages (similar to vendor profiles)
   - Name, description, images, contact information
   - Social media links, verification badges
   - Location and address display

2. **Search & Discovery**
   - Search bar component (adapted for business search)
   - Filtering by category, location, verification status
   - Listing page with cards/grid layout
   - Category-based navigation

3. **Verification System**
   - Verification badges and trust signals
   - Admin verification workflow
   - Tier/premium business features (optional)

4. **Admin Management**
   - Admin interface patterns for business management
   - Business approval workflows
   - Content moderation patterns

5. **Image Management**
   - Image upload patterns
   - Logo and hero image handling
   - Portfolio/gallery display

**Rule**: These are UI/UX patterns only. Business implements its own data models and business logic.

### Patterns NOT Reused (Markets-Specific)

**Business will NOT reuse**:

1. **Product Catalog System**
   - Markets: `products` table, inventory management, pricing
   - Business: `services` table (different structure), service descriptions, inquiry-based pricing

2. **Market Day System**
   - Markets: `market_days`, `market_stalls`, attendance tracking
   - Business: Business hours, availability calendar, appointment scheduling

3. **Order Management**
   - Markets: `orders`, `order_items`, cart/checkout workflow
   - Business: `inquiries`, `bookings`, consultation requests

4. **Vendor Dashboard**
   - Markets: Vendor-specific order management, product management
   - Business: Business-specific inquiry management, service management

**Rule**: Business implements its own domain-specific logic. No shared business logic or data models.

### Explicit Non-Overlap Rules

**Markets and Business maintain strict boundaries**:

1. **Data Independence**
   - Markets owns `vendors` table
   - Business owns `businesses` table
   - No shared tables or foreign key relationships between sections

2. **Logic Independence**
   - Markets search logic is Markets-specific
   - Business search logic is Business-specific
   - No shared business logic functions

3. **Workflow Independence**
   - Markets order processing is Markets-specific
   - Business inquiry processing is Business-specific
   - No shared workflows or processes

4. **Ownership Independence**
   - Markets manages Markets data only
   - Business manages Business data only
   - No cross-section data management

**Exception**: Optional cross-linking via user accounts (see "Data Model" section below).

---

## 3. Core Use Cases

### Use Case 1: General Business Discovery

**User Story**: "I need to find a business that provides [service] in [location]"

**Business Provides**:
- Business directory with search and filtering
- Category-based browsing
- Location-based search
- Business profile pages with service information

**Not Provided by Markets**: Markets focuses on market vendors and products, not general business discovery.

### Use Case 2: Service-Based Offerings

**User Story**: "I want to see what services this business offers and how to contact them"

**Business Provides**:
- Service listings (not products)
- Service descriptions and pricing
- Inquiry/booking system
- Service categories and specializations

**Not Provided by Markets**: Markets focuses on physical products with inventory, not service offerings.

### Use Case 3: Professional Networking

**User Story**: "I want to connect with other businesses in my industry"

**Business Provides**:
- Business-to-business connections
- Industry groups and communities
- Referral system
- Professional networking features

**Not Provided by Markets**: Markets focuses on vendor-customer relationships, not B2B networking.

### Use Case 4: Customer Inquiries

**User Story**: "I want to inquire about a service or book a consultation"

**Business Provides**:
- Inquiry submission system
- Booking/consultation requests
- Business response workflow
- Inquiry management dashboard

**Not Provided by Markets**: Markets focuses on e-commerce orders with cart/checkout, not service inquiries.

---

## 4. Data Model (Conceptual)

### Core Tables

#### `businesses` Table

**Purpose**: Business directory listings (equivalent to Markets `vendors` table, but independent)

**Key Fields**:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to `auth.users` - shared infrastructure)
- `name` (string)
- `slug` (string, unique)
- `description` (text)
- `short_tagline` (string)
- `logo_url` (string)
- `hero_image_url` (string)
- `business_type` (enum: 'sole_proprietor', 'partnership', 'corporation', etc.)
- `industry` (string)
- `category` (string)
- `tags` (string[])
- `contact_email` (string)
- `contact_phone` (string)
- `website_url` (string, nullable)
- `social_links` (jsonb)
- `address` (text)
- `location_coords` (point, nullable)
- `business_hours` (jsonb)
- `is_verified` (boolean)
- `is_active` (boolean)
- `tier_id` (UUID, foreign key to `business_tiers` - optional premium features)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Ownership**: Business section owns this table. Markets cannot access it.

#### `services` Table (Optional)

**Purpose**: Service offerings by businesses (equivalent to Markets `products` table, but service-focused)

**Key Fields**:
- `id` (UUID, primary key)
- `business_id` (UUID, foreign key to `businesses`)
- `name` (string)
- `slug` (string)
- `description` (text)
- `service_type` (enum: 'consultation', 'booking', 'inquiry', etc.)
- `pricing_model` (enum: 'fixed', 'hourly', 'quote', 'free')
- `price` (decimal, nullable)
- `duration` (string, nullable, e.g., "1 hour", "30 minutes")
- `category` (string)
- `tags` (string[])
- `image_urls` (string[])
- `is_available` (boolean)
- `requires_consultation` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Ownership**: Business section owns this table. Markets cannot access it.

#### `inquiries` Table

**Purpose**: Customer inquiries and booking requests (equivalent to Markets `orders` table, but inquiry-focused)

**Key Fields**:
- `id` (UUID, primary key)
- `business_id` (UUID, foreign key to `businesses`)
- `service_id` (UUID, foreign key to `services`, nullable)
- `customer_id` (UUID, foreign key to `auth.users`)
- `inquiry_type` (enum: 'general', 'service', 'booking', 'consultation')
- `subject` (string)
- `message` (text)
- `preferred_contact_method` (enum: 'email', 'phone', 'whatsapp')
- `status` (enum: 'pending', 'responded', 'closed', 'cancelled')
- `business_response` (text, nullable)
- `responded_at` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Ownership**: Business section owns this table. Markets cannot access it.

#### `business_tiers` Table (Optional)

**Purpose**: Premium business features (similar to Markets `vendor_tiers`, but independent)

**Key Fields**:
- `id` (UUID, primary key)
- `name` (string)
- `monthly_price` (decimal)
- `features` (jsonb)

**Ownership**: Business section owns this table. Markets cannot access it.

### Optional Cross-Linking (Via User Account)

**Scenario**: A user who is both a market vendor and a business owner

**Implementation**:
- User account links to both `vendors` (Markets) and `businesses` (Business) via `user_id`
- No shared records or foreign keys between `vendors` and `businesses`
- Optional UI feature: "This business also sells at Markets" (read-only link)
- No data sharing or logic coupling

**Rule**: Cross-linking is presentation-only. No shared data models or business logic.

### Data Independence Rules

**Business must NOT**:
- Reference Markets tables (`vendors`, `products`, `orders`, etc.)
- Share foreign keys with Markets tables
- Depend on Markets data for Business functionality
- Create dependencies on Markets business logic

**Business may**:
- Reference shared infrastructure (`auth.users`, platform configuration)
- Link to Markets content via read-only URLs (presentation only)
- Use shared UI components (design system)

---

## 5. Routes (Proposed, Not Implemented)

> **⚠️ PROPOSED ONLY - NOT IMPLEMENTED**  
> These routes are planning proposals. No code exists for these routes.

### Public Routes

#### `/business`
**Purpose**: Business section homepage  
**Content**: Section overview, featured businesses, search entry point  
**Status**: Proposed

#### `/business/directory`
**Purpose**: Business directory listing page  
**Content**: Searchable/filterable list of businesses, category navigation  
**Status**: Proposed

#### `/business/[slug]`
**Purpose**: Individual business profile page  
**Content**: Business details, services, contact information, inquiry form  
**Status**: Proposed

#### `/business/services`
**Purpose**: Service listings page (if services are separate from businesses)  
**Content**: Browse services across businesses  
**Status**: Proposed (optional)

### Business Owner Routes

#### `/business/manage`
**Purpose**: Business owner dashboard  
**Content**: Business profile management, service management, inquiry management  
**Status**: Proposed

#### `/business/manage/profile`
**Purpose**: Business profile editing  
**Content**: Edit business information, images, contact details  
**Status**: Proposed

#### `/business/manage/services`
**Purpose**: Service management  
**Content**: Create, edit, manage service offerings  
**Status**: Proposed

#### `/business/manage/inquiries`
**Purpose**: Inquiry management  
**Content**: View and respond to customer inquiries  
**Status**: Proposed

#### `/business/apply`
**Purpose**: Business signup/onboarding  
**Content**: Business registration form  
**Status**: Proposed

### Admin Routes

#### `/business/admin`
**Purpose**: Admin dashboard for Business section  
**Content**: Business management, verification, moderation  
**Status**: Proposed

#### `/business/admin/businesses`
**Purpose**: Admin business listing management  
**Content**: List, approve, verify, moderate businesses  
**Status**: Proposed

#### `/business/admin/businesses/[id]/edit`
**Purpose**: Admin business editing  
**Content**: Edit business information, verify status  
**Status**: Proposed

#### `/business/admin/businesses/create`
**Purpose**: Admin business creation  
**Content**: Create business records  
**Status**: Proposed

### Networking Routes (Future Phase)

#### `/business/networking`
**Purpose**: Professional networking hub  
**Content**: Business connections, industry groups, referrals  
**Status**: Proposed (Phase 3)

#### `/business/networking/connections`
**Purpose**: Business connections management  
**Content**: Manage B2B connections  
**Status**: Proposed (Phase 3)

---

## 6. Features by Phase

### Phase 1: Directory MVP

**Goal**: Basic business directory with search and discovery

**Features**:
1. Business directory listing page
2. Business profile pages
3. Business search and filtering
4. Category-based navigation
5. Business signup/onboarding
6. Business profile management (owner)
7. Admin business management
8. Verification system (basic)

**Timeline Estimate**: 4-6 weeks

**Dependencies**: None (independent section)

**Markets Patterns Reused**:
- Profile page structure (UI only)
- Search/filter patterns (UI only)
- Admin management patterns (UI only)
- Verification workflow (concept only, independent implementation)

### Phase 2: Service Offerings

**Goal**: Service listings and inquiry system

**Features**:
1. Service listings (optional `services` table)
2. Service detail pages
3. Service search and filtering
4. Inquiry submission system
5. Inquiry management dashboard (business owner)
6. Inquiry response workflow
7. Booking/consultation requests (if applicable)

**Timeline Estimate**: 3-4 weeks

**Dependencies**: Phase 1 complete

**Markets Patterns Reused**:
- Listing page patterns (UI only)
- Detail page patterns (UI only)
- Management dashboard patterns (UI only)

**Business-Specific**:
- Inquiry system (not orders)
- Service descriptions (not products)
- Booking workflows (not checkout)

### Phase 3: Networking & Referrals

**Goal**: Professional networking and B2B features

**Features**:
1. Business-to-business connections
2. Industry groups and communities
3. Referral system
4. Business recommendations
5. Professional networking hub
6. Connection management dashboard

**Timeline Estimate**: 4-6 weeks

**Dependencies**: Phase 1 and 2 complete

**Markets Patterns Reused**: None (networking is Business-specific)

**Business-Specific**: All networking features are unique to Business section.

---

## 7. Guardrails

### What Must Never Be Added to Markets

**Markets must NOT**:
- Business directory functionality
- Service listings (only products)
- General business search (only market vendor search)
- Professional networking features
- Inquiry/booking system (only orders)
- Business hours management (only market days)

**Rule**: Markets stays focused on market vendors, products, market days, and orders. Any business directory features belong in Business section.

### What Business Must Never Depend On

**Business must NOT**:
- Access Markets tables (`vendors`, `products`, `orders`, etc.)
- Reuse Markets business logic functions
- Depend on Markets data for Business functionality
- Share data models with Markets
- Create foreign key relationships with Markets tables

**Rule**: Business is completely independent. It may reference Markets content via URLs (presentation only), but no data or logic coupling.

### How Future Sections Should Follow the Same Model

**Property, Community, Lifestyle, Resources** should:

1. **Maintain Independence**
   - Own their data models
   - Implement their own business logic
   - Maintain section boundaries

2. **Reuse UI/UX Patterns**
   - Profile structures (adapted)
   - Search/filter patterns (adapted)
   - Admin management patterns (adapted)
   - Design system components (shared)

3. **Avoid Cross-Section Coupling**
   - No shared data models
   - No shared business logic
   - No cross-section dependencies

4. **Optional Cross-Linking**
   - Presentation-only links between sections
   - User account-based connections (not data-based)
   - Read-only references (not shared ownership)

**Example**: Property section would have `properties` table (not `vendors` or `businesses`), but could reuse profile page UI patterns.

---

## 8. Success Criteria

### Architectural Clarity

**Success Indicators**:
- Clear separation between Markets and Business
- No ambiguity about data ownership
- No confusion about which section owns what
- Documentation clearly defines boundaries

**Validation**: Code review confirms no cross-section data access or logic sharing.

### No Cross-Section Coupling

**Success Indicators**:
- Business code does not import Markets data models
- Business code does not call Markets business logic
- Business tables have no foreign keys to Markets tables
- Markets code does not reference Business functionality

**Validation**: Static analysis and code review confirm independence.

### Markets Remains Unchanged

**Success Indicators**:
- No Markets code modified for Business
- No Markets data models changed
- No Markets routes affected
- Markets functionality unchanged

**Validation**: Markets continues to function exactly as before Business implementation.

### Business Can Scale Independently

**Success Indicators**:
- Business can be developed by separate team
- Business can have different release cycle
- Business can evolve without affecting Markets
- Business can be maintained independently

**Validation**: Business section operates without Markets dependencies.

---

## 9. Implementation Notes

### Development Approach

1. **Start with UI Patterns**
   - Extract Markets UI patterns (components, layouts)
   - Adapt for Business use case
   - Create Business-specific components

2. **Implement Independent Data Models**
   - Create `businesses` table (no Markets dependencies)
   - Create `services` table (if needed)
   - Create `inquiries` table (if needed)
   - Implement Business-specific RLS policies

3. **Build Business Logic**
   - Implement Business search logic (independent)
   - Implement inquiry processing (independent)
   - Implement verification workflow (independent)

4. **Reuse Shared Infrastructure**
   - Use shared authentication
   - Use shared design system
   - Use shared storage (organized by section)
   - Use shared utilities (non-domain-specific)

### Testing Strategy

1. **Independence Testing**
   - Verify Business does not access Markets tables
   - Verify Markets does not access Business tables
   - Verify no shared business logic

2. **Pattern Reuse Testing**
   - Verify UI patterns work for Business
   - Verify design system components function correctly
   - Verify shared infrastructure works for both sections

3. **Boundary Testing**
   - Verify cross-linking (if implemented) is presentation-only
   - Verify user account connections work without data coupling
   - Verify section boundaries are respected

---

## 10. Summary

**Business Section Blueprint**:

- **Purpose**: Independent business directory and service discovery platform
- **Relationship to Markets**: Uses Markets as UI/UX pattern library, maintains complete independence
- **Data Model**: Own `businesses`, `services`, `inquiries` tables (no Markets dependencies)
- **Routes**: `/business/*` namespace (proposed, not implemented)
- **Features**: Directory MVP → Service offerings → Networking (phased approach)
- **Guardrails**: No cross-section coupling, Markets unchanged, Business scales independently
- **Success**: Architectural clarity, independence, Markets preservation, scalable Business section

**Key Principle**: Business is a separate vertical that learns from Markets patterns but maintains complete functional and data independence.

---

**Document Status**: Planning complete. Ready for implementation planning and architecture review.

**Next Steps** (when ready to implement):
1. Review and approve this blueprint
2. Create detailed data model specifications
3. Create component extraction plan from Markets
4. Create implementation timeline
5. Begin Phase 1: Directory MVP


