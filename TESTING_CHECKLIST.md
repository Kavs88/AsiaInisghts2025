# Super User Access Testing Checklist

## Pre-Testing Setup

- [ ] Verify super user is added to `super_users` table in Supabase
- [ ] Verify RLS policies are in place (run `setup_super_user_access_CLEAN.sql`)
- [ ] Log in as super user on frontend
- [ ] Check browser console for any authentication errors

## 1. Admin Panel Access

### Login & Authentication
- [ ] Can log in with super user credentials
- [ ] Admin dashboard (`/admin`) is accessible
- [ ] No "Access Denied" errors appear
- [ ] User info displays correctly in admin panel

### Navigation
- [ ] All admin navigation links are visible
- [ ] Can navigate to all admin sections:
  - [ ] Market Days
  - [ ] Vendors
  - [ ] Products
  - [ ] Orders
  - [ ] Vendor Change Requests (if applicable)

## 2. Market Days Management

### Viewing
- [ ] Can view all market days (including unpublished)
- [ ] Market days list page loads without errors
- [ ] Unpublished market days are visible (marked appropriately)
- [ ] Can filter/search market days

### Creating
- [ ] Can access "Create Market Day" page (`/admin/market-days/create`)
- [ ] Form fields are all accessible
- [ ] Can create a new market day
- [ ] Success message appears after creation
- [ ] New market day appears in list

### Editing
- [ ] Can access edit page for any market day (`/admin/market-days/[id]/edit`)
- [ ] Can edit unpublished market days
- [ ] Can edit published market days
- [ ] Changes save successfully
- [ ] Can toggle `is_published` status

### Deleting
- [ ] Can delete market days (if delete functionality exists)
- [ ] Confirmation dialog appears (if implemented)
- [ ] Market day is removed from list after deletion

## 3. Vendor Management

### Viewing
- [ ] Can view all vendors (including inactive)
- [ ] Vendors list page loads without errors
- [ ] Inactive vendors are visible (marked appropriately)
- [ ] Can filter/search vendors
- [ ] Can view vendor details page

### Creating
- [ ] Can access "Create Vendor" page (`/admin/vendors/create`)
- [ ] Form fields are all accessible
- [ ] Can create a new vendor
- [ ] Success message appears after creation
- [ ] New vendor appears in list

### Editing
- [ ] Can access edit page for any vendor (`/admin/vendors/[id]/edit`)
- [ ] Can edit inactive vendors
- [ ] Can edit active vendors
- [ ] Can edit all vendor fields:
  - [ ] Name, slug, tagline, bio
  - [ ] Contact information
  - [ ] Social links
  - [ ] Active/verified status
  - [ ] Delivery/pickup options
- [ ] Changes save successfully

### Deleting
- [ ] Can delete vendors (if delete functionality exists)
- [ ] Confirmation dialog appears (if implemented)
- [ ] Vendor is removed from list after deletion

## 4. Admin-Only Features

### Vendor Change Requests
- [ ] Can view vendor change requests page
- [ ] Can approve/reject change requests
- [ ] Can view request details
- [ ] Changes are applied correctly after approval

### Other Admin Features
- [ ] Can access any admin-only features
- [ ] No permission errors when accessing admin features
- [ ] All admin actions complete successfully

## 5. Regular Vendor Workflows (Verify Unaffected)

### Vendor Dashboard
- [ ] Regular vendors can still access their dashboard
- [ ] Vendors can view their own products
- [ ] Vendors can view their own orders
- [ ] No errors for regular vendor users

### Vendor Profile Editing
- [ ] Regular vendors can still request changes (if using change request system)
- [ ] Vendor self-service features still work
- [ ] No broken functionality for regular vendors

### Vendor Submissions
- [ ] New vendor applications still work (if applicable)
- [ ] Vendor approval workflow still functions
- [ ] No critical functionality broken

## 6. UI/UX Testing

### Desktop Layout
- [ ] All buttons are visible and clickable
- [ ] Dropdowns work correctly
- [ ] Sticky navigation bars function properly
- [ ] Edit Profile buttons are visible (where applicable)
- [ ] Stats display correctly
- [ ] Social links work
- [ ] Tabs switch correctly
- [ ] Forms are properly laid out
- [ ] Error messages display correctly
- [ ] Success messages display correctly

### Mobile Layout
- [ ] Responsive design works on mobile
- [ ] Navigation menu is accessible
- [ ] Forms are usable on mobile
- [ ] Buttons are appropriately sized for touch
- [ ] Dropdowns work on mobile
- [ ] No horizontal scrolling issues
- [ ] Text is readable
- [ ] All interactive elements are accessible

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Screen reader compatibility (if applicable)
- [ ] Color contrast is adequate
- [ ] Form labels are properly associated

## 7. Database Access Verification

### Direct Database Queries (via Supabase SQL Editor)
- [ ] Can query unpublished market days:
  ```sql
  SELECT * FROM market_days WHERE is_published = FALSE;
  ```
- [ ] Can query inactive vendors:
  ```sql
  SELECT * FROM vendors WHERE is_active = FALSE;
  ```
- [ ] Can insert new market day (test, then delete)
- [ ] Can update any vendor record
- [ ] No RLS policy violations in console

## 8. Error Handling

### Error Scenarios
- [ ] Invalid form submissions show appropriate errors
- [ ] Network errors are handled gracefully
- [ ] Permission errors don't occur (super user should have access)
- [ ] 404 errors for non-existent resources are handled
- [ ] Error messages are user-friendly

## 9. Performance

- [ ] Pages load in reasonable time
- [ ] No excessive API calls
- [ ] Database queries are efficient
- [ ] No console warnings/errors (except expected ones)

## 10. Edge Cases

### Special Scenarios
- [ ] Can edit market days with no vendors assigned
- [ ] Can edit vendors with no products
- [ ] Can handle vendors with special characters in names
- [ ] Can handle very long text in fields
- [ ] Can handle empty/null values appropriately

## 11. Documentation & Logging

- [ ] Console logs show super user status correctly
- [ ] No unexpected authentication errors in logs
- [ ] Database queries succeed without RLS violations

## Issues Found

Document any issues encountered during testing:

### Critical Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### Minor Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### UI/UX Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

## Test Results Summary

- **Date Tested**: [Date]
- **Tester**: [Name]
- **Super User Email**: sam@kavsulting.com
- **Overall Status**: ✅ Pass / ❌ Fail / ⚠️ Partial

### Key Findings
- [Summary of findings]

### Recommendations
- [Any recommendations for improvements]

---

## Quick Test Commands

### Verify Super User Status (SQL)
```sql
SELECT 
    su.email,
    is_super_user(su.uid) as is_super_user_check
FROM public.super_users su
WHERE su.email = 'sam@kavsulting.com';
```

### Test Market Days Access (SQL)
```sql
-- Should return unpublished market days
SELECT id, market_date, location_name, is_published
FROM public.market_days
WHERE is_published = FALSE
LIMIT 5;
```

### Test Vendors Access (SQL)
```sql
-- Should return inactive vendors
SELECT id, name, slug, is_active
FROM public.vendors
WHERE is_active = FALSE
LIMIT 5;
```


