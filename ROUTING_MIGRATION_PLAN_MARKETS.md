# Routing Migration Plan: Markets Section

> **⚠️ PLANNING DOCUMENT - NOT FOR IMPLEMENTATION**  
> This document plans the migration of existing Sunday Market routes into `/markets` structure.  
> **Authority**: Must align with `.cursor/rules.md` and `ASIA_INSIGHTS_SITE_STRUCTURE_PROPOSAL.md`.  
> **Status**: Plan only - no code changes, no file moves, no route implementations.  
> **Confirmation**: No code was modified in creating this document.

---

## 1. Current Known Routes (Examples)

### Public Routes

**Vendor/Seller Routes**:
- `/sellers` - Sellers listing page
- `/sellers/[slug]` - Individual seller profile page
- `/vendors` - Legacy route (may redirect to `/sellers`)
- `/vendors/[slug]` - Legacy route (may redirect to `/sellers/[slug]`)

**Product Routes**:
- `/products/[id]` - Product detail page (if implemented)
- Product pages may be nested under vendor profiles

**Market Day Routes**:
- `/market-days` - Market days listing (if implemented)
- `/market-days/[id]` - Individual market day page (if implemented)

**Other Public Routes**:
- `/contact` - Contact page
- `/about` - About page (if exists)

### Vendor Dashboard Routes

**Vendor-Facing Routes**:
- `/vendor/dashboard` - Vendor dashboard home
- `/vendor/profile/edit` - Vendor profile editing
- `/vendor/products` - Product management
- `/vendor/orders` - Order management
- `/vendor/apply` - Vendor application/signup

### Admin Routes

**Admin-Facing Routes**:
- `/admin` - Admin dashboard
- `/admin/vendors` - Vendor management
- `/admin/vendors/create` - Create new vendor
- `/admin/vendors/[id]/edit` - Edit vendor
- `/admin/products` - Product management
- `/admin/market-days` - Market days management
- `/admin/market-days/create` - Create market day
- `/admin/market-days/[id]/edit` - Edit market day
- `/admin/orders` - Order management

### Authentication Routes

**Auth Routes** (if implemented):
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/auth/reset-password` - Password reset

**Note**: These routes are examples based on common patterns. Actual routes may vary. A complete route audit should be performed before migration.

---

## 2. Target Route Structure Under `/markets`

### Proposed Structure

**Public Routes**:
```
/markets                          → Markets section homepage
/markets/sellers                  → Sellers listing (migrated from /sellers)
/markets/sellers/[slug]           → Seller profile (migrated from /sellers/[slug])
/markets/products/[id]            → Product detail (if exists)
/markets/market-days              → Market days listing
/markets/market-days/[id]         → Individual market day
/markets/contact                  → Markets contact page (if Markets-specific)
```

**Vendor Dashboard Routes**:
```
/markets/vendor/dashboard         → Vendor dashboard (migrated from /vendor/dashboard)
/markets/vendor/profile/edit      → Edit profile (migrated from /vendor/profile/edit)
/markets/vendor/products          → Product management (migrated from /vendor/products)
/markets/vendor/orders            → Order management (migrated from /vendor/orders)
/markets/vendor/apply             → Vendor application (migrated from /vendor/apply)
```

**Admin Routes**:
```
/markets/admin                    → Markets admin dashboard (migrated from /admin)
/markets/admin/vendors            → Vendor management (migrated from /admin/vendors)
/markets/admin/vendors/create     → Create vendor (migrated from /admin/vendors/create)
/markets/admin/vendors/[id]/edit → Edit vendor (migrated from /admin/vendors/[id]/edit)
/markets/admin/products           → Product management (migrated from /admin/products)
/markets/admin/market-days        → Market days management (migrated from /admin/market-days)
/markets/admin/market-days/create → Create market day (migrated from /admin/market-days/create)
/markets/admin/market-days/[id]/edit → Edit market day (migrated from /admin/market-days/[id]/edit)
/markets/admin/orders             → Order management (migrated from /admin/orders)
```

**Authentication Routes** (if Markets-specific):
```
/markets/auth/login               → Markets login (if Markets-specific auth)
/markets/auth/signup              → Markets signup (if Markets-specific auth)
```

**Note**: If authentication is platform-level (shared), auth routes may remain at `/auth/*` and not migrate to `/markets/auth/*`.

---

## 3. Redirect Strategy

### Redirect Types

**Permanent Redirects (301)**:
- Used for routes that have permanently moved
- Preserves SEO value and link equity
- Signals to search engines that the move is permanent
- Recommended for: `/sellers/*` → `/markets/sellers/*`

**Temporary Redirects (302)**:
- Used during migration period if testing is needed
- Can be converted to 301 after verification
- Recommended for: Initial migration period only

### Redirect Mapping Table

| Current Route | Target Route | Redirect Type | Notes |
|---------------|--------------|---------------|-------|
| `/sellers` | `/markets/sellers` | 301 (Permanent) | Main sellers listing |
| `/sellers/[slug]` | `/markets/sellers/[slug]` | 301 (Permanent) | Individual seller profiles |
| `/vendors` | `/markets/sellers` | 301 (Permanent) | Legacy route consolidation |
| `/vendors/[slug]` | `/markets/sellers/[slug]` | 301 (Permanent) | Legacy route consolidation |
| `/vendor/dashboard` | `/markets/vendor/dashboard` | 301 (Permanent) | Vendor dashboard |
| `/vendor/profile/edit` | `/markets/vendor/profile/edit` | 301 (Permanent) | Profile editing |
| `/vendor/products` | `/markets/vendor/products` | 301 (Permanent) | Product management |
| `/vendor/orders` | `/markets/vendor/orders` | 301 (Permanent) | Order management |
| `/vendor/apply` | `/markets/vendor/apply` | 301 (Permanent) | Vendor application |
| `/admin` | `/markets/admin` | 301 (Permanent) | Admin dashboard (if Markets-specific) |
| `/admin/vendors` | `/markets/admin/vendors` | 301 (Permanent) | Vendor management |
| `/admin/vendors/create` | `/markets/admin/vendors/create` | 301 (Permanent) | Create vendor |
| `/admin/vendors/[id]/edit` | `/markets/admin/vendors/[id]/edit` | 301 (Permanent) | Edit vendor |
| `/admin/products` | `/markets/admin/products` | 301 (Permanent) | Product management |
| `/admin/market-days` | `/markets/admin/market-days` | 301 (Permanent) | Market days management |
| `/admin/market-days/create` | `/markets/admin/market-days/create` | 301 (Permanent) | Create market day |
| `/admin/market-days/[id]/edit` | `/markets/admin/market-days/[id]/edit` | 301 (Permanent) | Edit market day |
| `/admin/orders` | `/markets/admin/orders` | 301 (Permanent) | Order management |

### Redirect Implementation Notes

**Implementation Approach** (not implemented in this plan):
- Next.js `redirect()` function in route handlers
- `next.config.js` redirects configuration
- Middleware-based redirects for dynamic routes
- Server-side redirects for SEO preservation

**Query Parameter Preservation**:
- Preserve query parameters during redirects (e.g., `?page=2`, `?filter=active`)
- Maintain URL fragments if applicable
- Preserve search parameters and filters

**Redirect Chain Prevention**:
- Avoid double redirects (e.g., `/vendors` → `/sellers` → `/markets/sellers`)
- Consolidate legacy routes directly to final destination
- Test redirect chains to ensure no loops

---

## 4. Backward Compatibility Considerations

### Legacy Route Support

**Legacy Routes to Maintain** (temporarily):
- `/vendors` → Redirect to `/markets/sellers`
- `/vendors/[slug]` → Redirect to `/markets/sellers/[slug]`

**Rationale**: External links, bookmarks, and SEO value may reference legacy routes. Redirects preserve access while migrating to new structure.

### API Endpoint Compatibility

**If API routes exist**:
- Maintain backward compatibility for API endpoints during migration
- Version API endpoints if breaking changes are required
- Document API migration separately from route migration

### Bookmark and Link Preservation

**User Bookmarks**:
- Redirects ensure user bookmarks continue to work
- No user action required for bookmark updates
- Gradual migration as users discover new URLs

**External Links**:
- Redirects preserve external link value
- SEO authority maintained through redirects
- No need to contact external sites for link updates

### Internal Link Updates

**Internal Navigation**:
- Update internal links to use new `/markets/*` routes
- Update navigation menus and components
- Update sitemap and internal linking structure

**Code References**:
- Update `Link` components to use new routes
- Update programmatic navigation (router.push)
- Update route references in code comments and documentation

---

## 5. SEO Considerations

### URL Structure Preservation

**SEO-Friendly URLs**:
- Maintain descriptive, keyword-rich URLs
- Preserve URL hierarchy and structure
- Use consistent URL patterns within Markets section

**Example**:
- Current: `/sellers/greenway-bakery`
- Target: `/markets/sellers/greenway-bakery`
- SEO Impact: Minimal (keywords preserved, structure maintained)

### Redirect Implementation for SEO

**301 Redirects**:
- Signal permanent move to search engines
- Preserve link equity and ranking signals
- Transfer SEO value from old to new URLs

**Redirect Timing**:
- Implement redirects immediately upon route migration
- Do not leave old routes active without redirects
- Monitor for crawl errors and fix promptly

### Sitemap Updates

**Sitemap.xml Updates**:
- Add new `/markets/*` URLs to sitemap
- Remove old URLs from sitemap (after redirect period)
- Submit updated sitemap to search engines
- Maintain separate sitemap sections if needed

### Meta Tags and Structured Data

**Meta Tag Updates**:
- Update canonical tags to point to new URLs
- Update Open Graph and Twitter Card URLs
- Preserve existing meta descriptions and titles

**Structured Data**:
- Update structured data (JSON-LD) URLs
- Maintain schema.org markup accuracy
- Preserve rich snippet eligibility

### Link Equity Preservation

**Internal Linking**:
- Update internal links to use new routes
- Maintain internal linking structure and hierarchy
- Preserve anchor text and context

**External Backlinks**:
- Redirects preserve external backlink value
- No need to update external sites immediately
- Monitor backlink profile for any issues

### Monitoring and Verification

**SEO Monitoring**:
- Monitor search rankings for migrated pages
- Track organic traffic to new routes
- Verify redirects are working correctly
- Check for crawl errors in Search Console

**Verification Checklist**:
- [ ] All old routes redirect correctly
- [ ] No 404 errors on migrated pages
- [ ] Sitemap updated and submitted
- [ ] Canonical tags updated
- [ ] Structured data updated
- [ ] Search rankings maintained or improved

---

## 6. Admin Route Handling

### Admin Route Migration

**Current Admin Routes**:
- `/admin` - Admin dashboard
- `/admin/vendors/*` - Vendor management
- `/admin/products` - Product management
- `/admin/market-days/*` - Market days management
- `/admin/orders` - Order management

**Target Admin Routes**:
- `/markets/admin` - Markets admin dashboard
- `/markets/admin/vendors/*` - Vendor management
- `/markets/admin/products` - Product management
- `/markets/admin/market-days/*` - Market days management
- `/markets/admin/orders` - Order management

### Admin Access Considerations

**Access Control**:
- Admin routes require admin/super user authentication
- Access control logic should remain unchanged
- Route migration does not affect permission checks

**Admin User Experience**:
- Update admin navigation to use new routes
- Update admin bookmarks and shortcuts
- Communicate route changes to admin users
- Provide redirects for admin convenience

### Platform-Level Admin Routes

**If platform-level admin exists**:
- Platform admin routes may remain at `/admin/*` (not Markets-specific)
- Markets admin routes move to `/markets/admin/*`
- Clear separation between platform admin and Markets admin

**Example Structure**:
- `/admin` - Platform-level admin (if exists)
- `/markets/admin` - Markets-specific admin
- `/property/admin` - Property-specific admin (future)
- `/community/admin` - Community-specific admin (future)

### Admin Route Redirects

**Redirect Strategy for Admin**:
- Implement 301 redirects for admin routes
- Preserve admin user bookmarks and shortcuts
- Update admin documentation with new routes
- Test admin workflows after migration

---

## 7. Risks and Mitigation

### Risk: Broken Links and 404 Errors

**Risk Description**: Internal or external links pointing to old routes may break if redirects are not implemented correctly.

**Mitigation**:
- Implement comprehensive redirect mapping
- Test all known routes before migration
- Monitor 404 errors after migration
- Maintain redirects for extended period (6+ months)

**Verification**:
- Audit all internal links before migration
- Test redirects in staging environment
- Monitor error logs after migration
- Fix broken links promptly

### Risk: SEO Ranking Drops

**Risk Description**: Search engine rankings may drop if redirects are not implemented correctly or if URL structure changes significantly.

**Mitigation**:
- Use 301 permanent redirects
- Preserve URL structure and keywords
- Update sitemap and submit to search engines
- Monitor rankings closely after migration

**Verification**:
- Track rankings for key pages before and after migration
- Monitor organic traffic trends
- Verify redirects are being followed by search engines
- Address ranking drops promptly

### Risk: User Confusion

**Risk Description**: Users may be confused by route changes, especially if bookmarks or external links point to old routes.

**Mitigation**:
- Implement redirects to preserve access
- Communicate route changes to users (if significant)
- Update user-facing documentation
- Provide clear navigation to new routes

**Verification**:
- Test user workflows after migration
- Monitor user feedback and support requests
- Verify redirects work for all user types
- Update user documentation

### Risk: Admin Access Issues

**Risk Description**: Admin users may lose access or experience issues if admin routes are not migrated correctly.

**Mitigation**:
- Test admin routes thoroughly before migration
- Implement redirects for admin routes
- Communicate changes to admin users
- Provide admin documentation updates

**Verification**:
- Test all admin workflows after migration
- Verify admin authentication and authorization
- Test admin route redirects
- Monitor admin user feedback

### Risk: Vendor Dashboard Issues

**Risk Description**: Vendor users may experience issues accessing dashboard or managing their accounts.

**Mitigation**:
- Test vendor dashboard routes before migration
- Implement redirects for vendor routes
- Communicate changes to vendors (if significant)
- Provide vendor documentation updates

**Verification**:
- Test all vendor workflows after migration
- Verify vendor authentication and authorization
- Test vendor route redirects
- Monitor vendor feedback

### Risk: API Endpoint Breaking Changes

**Risk Description**: If API routes exist, migration may break API integrations.

**Mitigation**:
- Audit all API routes before migration
- Maintain backward compatibility during migration
- Version API endpoints if breaking changes required
- Document API migration separately

**Verification**:
- Test all API endpoints after migration
- Verify API documentation is updated
- Monitor API error rates
- Address API issues promptly

### Risk: Performance Impact

**Risk Description**: Additional redirects may impact page load times or server performance.

**Mitigation**:
- Implement redirects efficiently (server-level where possible)
- Monitor performance metrics after migration
- Optimize redirect implementation if needed
- Use caching for redirect rules where applicable

**Verification**:
- Monitor page load times before and after migration
- Track server performance metrics
- Test redirect performance under load
- Optimize if performance issues occur

---

## 8. Explicit "Not in Scope" Items

### Out of Scope for This Migration

**Not Included**:
- **File Moves**: Actual file system moves of route files (separate task)
- **Code Refactoring**: Code changes beyond route updates (separate task)
- **Component Updates**: Updates to components for new route structure (separate task)
- **Database Changes**: Database schema or data migrations (separate task)
- **Authentication Changes**: Changes to authentication or authorization logic (separate task)
- **Permission Changes**: Changes to role-based access control (separate task)
- **Feature Development**: New features or functionality (separate task)
- **Design Changes**: UI/UX changes beyond route updates (separate task)

### Implementation Tasks (Separate)

**These tasks will be handled separately**:
- Actual route file moves and restructuring
- Redirect implementation in code
- Component and link updates
- Testing and verification
- Documentation updates
- User communication

### Future Considerations (Not Part of This Plan)

**Future Tasks**:
- Integration with other sections' routes
- Cross-section navigation features
- Advanced routing features
- Route optimization and performance tuning

---

## 9. Migration Readiness Checklist

### Pre-Migration Requirements

**Before migration can begin**:
- [ ] Complete route audit (identify all current routes)
- [ ] Approve target route structure
- [ ] Approve redirect strategy
- [ ] Verify section boundaries are respected (per `.cursor/rules.md`)
- [ ] Confirm no structural violations
- [ ] Backup current route structure
- [ ] Document rollback procedures

### Migration Execution (Future Task)

**During migration** (not in this plan):
- [ ] Implement redirects
- [ ] Move route files to new structure
- [ ] Update internal links and navigation
- [ ] Update sitemap and SEO elements
- [ ] Test all routes and redirects
- [ ] Verify admin and vendor access
- [ ] Monitor for errors and issues

### Post-Migration Verification

**After migration** (not in this plan):
- [ ] Verify all redirects work correctly
- [ ] Check for 404 errors
- [ ] Monitor SEO rankings
- [ ] Test user workflows
- [ ] Verify admin access
- [ ] Update documentation
- [ ] Communicate changes to users (if needed)

---

## Summary

This migration plan proposes moving existing Sunday Market routes into the `/markets/*` structure while preserving functionality, SEO value, and user access through comprehensive redirects.

**Key Principles**:
- **Non-Breaking**: Redirects ensure no broken links or lost access
- **SEO-Preserving**: 301 redirects maintain search engine rankings
- **User-Friendly**: Redirects preserve bookmarks and external links
- **Section-Boundary Compliant**: Routes respect Markets section boundaries per `.cursor/rules.md`

**Status**: This is a **planning document only**. No code changes, file moves, or route implementations are included. Implementation will follow in a separate, approved task.

**Confirmation**: No code was modified in creating this document.


