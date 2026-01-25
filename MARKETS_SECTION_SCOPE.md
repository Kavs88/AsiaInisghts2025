# Markets Section Scope and Boundaries

> **⚠️ ENFORCEMENT GUIDANCE**  
> This document defines the exact scope and boundaries of the Markets section (Sunday Market).  
> **Authority**: Per `.cursor/rules.md`, Markets maintains independence from other sections.  
> **Status**: Definitive scope document - violations must be flagged and prevented.

---

## 1. What Markets IS Responsible For

### Data Ownership

**Markets owns the following data tables and records**:

- **`vendors` table**: All vendor/seller records, profiles, and metadata
- **`products` table**: All product listings, inventory, and pricing
- **`market_days` table**: All market day schedules, dates, and venue information
- **`market_stalls` table**: Stall assignments and vendor attendance records
- **`orders` table**: Customer orders placed through Markets
- **`order_items` table**: Individual items within orders
- **`vendor_portfolio` table**: Vendor portfolio images and media
- **`change_requests` table**: Vendor change requests and approvals (if implemented)
- **Any Markets-specific analytics or tracking data**

**Rule**: No other section may create, read, update, or delete Markets-owned data without explicit Markets permission and documented cross-section API.

### Business Logic Ownership

**Markets owns the following business logic**:

- **Vendor Management**: Vendor creation, editing, approval, verification
- **Product Management**: Product creation, inventory management, pricing
- **Market Day Management**: Market day creation, stall assignment, attendance tracking
- **Order Processing**: Order creation, fulfillment, status management
- **Vendor Search and Discovery**: Vendor search, filtering, categorization
- **Product Search and Discovery**: Product search, filtering, categorization
- **Cart Management**: Shopping cart functionality (if Markets-specific)
- **Vendor Dashboard**: Vendor-facing management interfaces
- **Admin Markets Management**: Admin interfaces for Markets data

**Rule**: This logic is Markets-specific and cannot be reused by other sections. Other sections must implement their own equivalent logic for their domains.

### Content Ownership

**Markets owns the following content**:

- **Vendor Profiles**: All vendor/seller profile pages and content
- **Product Listings**: All product detail pages and descriptions
- **Market Day Pages**: Market day information, schedules, venue details
- **Vendor Documentation**: Vendor onboarding guides, seller resources
- **Market-Specific Resources**: Guides specific to market participation

**Rule**: This content is Markets-specific. Other sections may reference it (read-only) but cannot modify or manage it.

### Functional Ownership

**Markets owns the following functionality**:

- **Vendor Signup and Onboarding**: Vendor registration and profile setup
- **Product Catalog Management**: Product creation, editing, inventory
- **Market Day Scheduling**: Creating and managing market events
- **Order Fulfillment**: Processing and tracking customer orders
- **Vendor Verification**: Verification badges and processes
- **Market-Specific Search**: Search within Markets content only

**Rule**: This functionality is Markets-specific. Other sections must implement their own equivalent functionality for their domains.

---

## 2. What Markets is NOT Responsible For

### Explicit Prohibitions

**Markets must NOT own or manage**:

- **Property Listings**: Property section owns property data
- **Community Events**: Community section owns events and groups
- **Business Directory**: Business section owns business listings
- **Lifestyle Content**: Lifestyle section owns lifestyle articles
- **Resource Guides**: Resources section owns guides and tools
- **Concierge Services**: Concierge section owns service offerings
- **Platform Navigation**: Homepage hub owns global navigation
- **User Authentication**: Platform-level shared infrastructure
- **Media Storage Infrastructure**: Platform-level shared infrastructure (though Markets uses it)

### Cross-Section Boundaries

**Markets must NOT**:

- **Share Data Models**: Cannot allow other sections to use Markets tables directly
- **Share Business Logic**: Cannot allow other sections to reuse Markets search, filtering, or management logic
- **Share Workflows**: Cannot allow other sections to manage Markets orders, vendors, or products
- **Create Dependencies**: Cannot create dependencies on other sections' data or functionality
- **Violate Section Independence**: Must maintain complete functional independence

**Rule**: Markets is a self-contained section. It does not depend on other sections, and other sections do not depend on Markets' core functionality.

---

## 3. Data Ownership Rules

### Tables and Records

**Markets-Owned Tables** (complete list):

- `vendors` - Vendor/seller records
- `products` - Product listings
- `market_days` - Market day schedules
- `market_stalls` - Stall assignments
- `orders` - Customer orders
- `order_items` - Order line items
- `vendor_portfolio` - Vendor portfolio images
- `change_requests` - Vendor change requests (if implemented)
- Any Markets-specific analytics tables

**Ownership Rules**:

- **Create**: Only Markets code can create records in these tables
- **Read**: Other sections may read Markets data via documented APIs only (read-only)
- **Update**: Only Markets code can update records in these tables
- **Delete**: Only Markets code can delete records in these tables

### Data Access Patterns

**Allowed**:
- Markets code directly accessing Markets tables
- Other sections reading Markets data via API (read-only, documented)
- Platform-level admin tools accessing Markets data (with Markets permission)

**Prohibited**:
- Other sections directly querying Markets tables
- Other sections modifying Markets data
- Other sections creating dependencies on Markets table structure
- Shared business logic that accesses Markets tables

### Foreign Key Relationships

**Markets may reference** (read-only):
- Shared user tables (for vendor user accounts)
- Platform-level configuration tables

**Markets must NOT reference**:
- Other sections' domain tables (properties, events, businesses, etc.)
- Other sections' business logic or functions

---

## 4. Business Logic Ownership

### Markets-Specific Logic

**Markets owns all logic related to**:

- **Vendor Operations**: Creating, editing, verifying vendors
- **Product Operations**: Creating, editing, managing product inventory
- **Market Day Operations**: Scheduling markets, assigning stalls, tracking attendance
- **Order Operations**: Processing orders, managing fulfillment, tracking status
- **Search and Discovery**: Searching vendors, products, market days within Markets
- **Vendor Dashboard**: Vendor-facing management interfaces and workflows
- **Admin Markets Management**: Admin interfaces for Markets administration

**Rule**: This logic is Markets-specific. Other sections must implement their own equivalent logic for their domains.

### Prohibited Logic Sharing

**Markets must NOT**:

- **Export Logic**: Cannot provide reusable business logic functions for other sections
- **Share Search Logic**: Cannot allow other sections to reuse Markets search implementation
- **Share Management Logic**: Cannot allow other sections to reuse Markets CRUD operations
- **Create Shared Services**: Cannot create cross-section services that other sections depend on

**Exception**: Shared UI components and utilities are allowed (see "Allowed Shared Resources" below).

---

## 5. Allowed Shared Resources

### Authentication and User Management

**Markets uses (but does not own)**:
- Platform-level authentication system
- Shared user accounts and profiles
- Platform-level session management

**Rule**: Markets uses shared auth but does not manage it. Markets-specific user data (vendor profiles) is Markets-owned.

### UI Components and Design System

**Markets uses (but does not own)**:
- Shared design system components (buttons, cards, forms, modals)
- Shared UI utilities and helpers
- Platform-level styling and theming

**Rule**: Markets uses shared UI components but does not own them. Markets-specific components (VendorCard, ProductCard) are Markets-owned.

### Media Storage Infrastructure

**Markets uses (but does not own)**:
- Platform-level media storage (Supabase Storage)
- Shared storage buckets (organized by section)
- Platform-level image processing and optimization

**Rule**: Markets uses shared storage infrastructure but organizes content by section. Markets-specific media (vendor logos, product images) is stored in Markets-organized buckets.

### Infrastructure and Utilities

**Markets uses (but does not own)**:
- Database connection and query utilities
- Platform-level API utilities
- Shared error handling and logging
- Platform-level configuration management

**Rule**: Markets uses shared infrastructure but does not own it. Markets-specific configuration and settings are Markets-owned.

---

## 6. Explicit Prohibitions (What Must Never Be Shared)

### Data Sharing Prohibitions

**Markets must NEVER**:

- **Share Vendor Data**: Cannot allow other sections to directly access or modify vendor records
- **Share Product Data**: Cannot allow other sections to directly access or modify product records
- **Share Order Data**: Cannot allow other sections to directly access or modify order records
- **Share Market Day Data**: Cannot allow other sections to directly access or modify market day records

**Rule**: Markets data is Markets-owned. Other sections may reference it (read-only via API) but cannot own or manage it.

### Logic Sharing Prohibitions

**Markets must NEVER**:

- **Export Vendor Management Logic**: Cannot provide reusable vendor CRUD functions
- **Export Product Management Logic**: Cannot provide reusable product CRUD functions
- **Export Search Logic**: Cannot provide reusable search functions for other sections
- **Export Order Processing Logic**: Cannot provide reusable order processing functions

**Rule**: Markets logic is Markets-specific. Other sections must implement their own equivalent logic.

### Workflow Sharing Prohibitions

**Markets must NEVER**:

- **Share Vendor Onboarding**: Cannot allow other sections to use Markets vendor signup
- **Share Product Catalog**: Cannot allow other sections to use Markets product management
- **Share Order Fulfillment**: Cannot allow other sections to use Markets order processing
- **Share Market Day Management**: Cannot allow other sections to use Markets market day scheduling

**Rule**: Markets workflows are Markets-specific. Other sections must implement their own equivalent workflows.

### Dependency Prohibitions

**Markets must NEVER**:

- **Depend on Other Sections' Data**: Cannot create dependencies on Property, Community, Business, etc. data
- **Depend on Other Sections' Logic**: Cannot create dependencies on other sections' business logic
- **Create Cross-Section Services**: Cannot create services that other sections depend on

**Rule**: Markets maintains complete independence. It does not depend on other sections, and other sections do not depend on Markets.

---

## 7. Relationship to Other Sections

### Read-Only Access (Allowed)

**Markets may** (read-only, via documented API):

- **Reference Property Listings**: Link to property listings for vendor location context
- **Reference Community Events**: Link to community events related to markets
- **Reference Business Directory**: Link to business listings for vendor business context
- **Reference Lifestyle Content**: Link to lifestyle articles relevant to market vendors
- **Reference Resources**: Link to Resources guides useful for vendors

**Rule**: Markets can reference and link to other sections' content, but cannot own or manage it.

### No Access (Prohibited)

**Markets must NOT**:

- **Modify Other Sections' Data**: Cannot update property listings, community events, etc.
- **Create Dependencies**: Cannot create code that depends on other sections' data or logic
- **Share Ownership**: Cannot claim ownership of other sections' content or functionality

**Rule**: Markets is independent. It does not manage other sections, and other sections do not manage Markets.

### Interaction Patterns

**Allowed Patterns**:
- **Links**: Markets pages can link to other sections' pages
- **Recommendations**: Markets can recommend other sections' content to users
- **Read-Only APIs**: Markets can read other sections' public data via API (if documented)
- **Cross-Section Navigation**: Markets can direct users to other sections

**Prohibited Patterns**:
- **Shared Data Models**: Markets cannot use other sections' tables
- **Shared Business Logic**: Markets cannot reuse other sections' logic
- **Shared Workflows**: Markets cannot manage other sections' functionality
- **Cross-Section Dependencies**: Markets cannot depend on other sections' implementation

---

## 8. Enforcement and Violation Prevention

### Code Review Checklist

**Before approving any code change, verify**:

- [ ] Does not access other sections' tables directly
- [ ] Does not export Markets logic for other sections to use
- [ ] Does not create dependencies on other sections' data or logic
- [ ] Does not share Markets data models with other sections
- [ ] Maintains Markets section independence
- [ ] Uses shared infrastructure appropriately (auth, UI, storage)
- [ ] Does not violate section boundaries

### Violation Indicators

**Flag immediately if code**:

- Imports or uses other sections' domain models
- Exports Markets logic functions for cross-section use
- Creates shared services that other sections depend on
- Accesses other sections' tables directly
- Modifies other sections' data
- Creates cross-section dependencies

### Remediation

**If violations are detected**:

1. **Stop**: Do not proceed with violating code
2. **Flag**: Document the violation and why it's problematic
3. **Refactor**: Restructure to maintain section independence
4. **Verify**: Confirm boundaries are respected before proceeding

---

## Summary

**Markets Section Scope**:

- **Owns**: Vendors, products, market days, orders, and all Markets-specific data and logic
- **Uses**: Shared infrastructure (auth, UI, storage) but does not own it
- **Prohibited**: Sharing data, logic, or workflows with other sections
- **Independent**: Maintains complete functional independence from other sections

**Key Principle**: Markets is a self-contained section that uses shared infrastructure but owns its domain completely. It does not share ownership with other sections, and other sections do not share ownership with Markets.


