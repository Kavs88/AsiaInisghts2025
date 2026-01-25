# Vendor Change Requests System - Implementation Guide

## Overview

This system implements a request-based workflow where vendors can request profile changes, but only admins can approve and apply them to the vendors table. This ensures data integrity and prevents vendors from directly modifying critical fields like `slug`, `is_verified`, and `is_active`.

## Database Schema

### 1. New Table: `vendor_change_requests`

**Location:** `supabase/vendor_change_requests_schema.sql`

This table stores all vendor change requests with:
- Request metadata (vendor_id, requested_by_user_id, status)
- Requested changes stored as JSONB for flexibility
- Admin review information (reviewed_by, reviewed_at, admin_notes)
- Status tracking (pending, approved, rejected, modified)

**Key Features:**
- Vendors can only have one pending request at a time (enforced in application logic)
- RLS policies ensure vendors can only view/create their own requests
- Admins have full access to all requests

### 2. Updated RLS Policies

**Location:** `supabase/update_vendors_rls_for_requests.sql`

- Removed the policy that allowed vendors to directly update their vendor profile
- Vendors can still view their own profile (including inactive)
- Only admins can update vendors directly

## Application Code

### Server Actions

**Location:** `app/actions/vendor-change-requests.ts`

Functions:
- `submitVendorChangeRequest()` - Vendors submit change requests
- `cancelVendorChangeRequest()` - Vendors cancel pending requests
- `approveVendorChangeRequest()` - Admins approve and apply changes
- `rejectVendorChangeRequest()` - Admins reject requests with notes
- `getPendingVendorChangeRequests()` - Admins fetch all pending requests
- `getVendorChangeRequests()` - Vendors fetch their own requests

### Vendor Interface

**Location:** `app/vendor/profile/edit/page-client.tsx`

**Changes:**
- Form now submits change requests instead of direct updates
- Slug field is disabled (admin-only)
- Success message indicates request was submitted (not applied)
- Only changed fields are included in the request

### Admin Interface

**Location:** `app/admin/vendor-change-requests/page-client.tsx`

**Features:**
- Lists all pending change requests
- Shows requested changes in a readable format
- Approve button applies changes immediately
- Reject button with required reason field
- Links to vendor edit page for context

## Database Function

**Location:** `supabase/vendor_change_requests_schema.sql`

`apply_vendor_change_request(request_id UUID)` - A secure function that:
- Validates the request is approved
- Extracts changes from JSONB
- Applies only allowed fields (excludes slug, is_verified, is_active)
- Updates the vendors table
- Called via service role client to bypass RLS

## Security Considerations

### RLS Policies

1. **Vendors:**
   - Can view their own requests
   - Can create requests for their own vendor profile
   - Can update/delete only their own pending requests
   - Cannot view other vendors' requests

2. **Admins:**
   - Can view all requests
   - Can update all requests (approve/reject)
   - Can delete any request

3. **Vendors Table:**
   - Vendors can view their own profile (including inactive)
   - Vendors CANNOT update their profile directly
   - Only admins can update vendors

### Field Restrictions

Vendors CANNOT request changes to:
- `slug` - URL identifier (admin-only)
- `is_verified` - Verification status (admin-only)
- `is_active` - Active status (admin-only)
- `user_id` - User association (admin-only)
- `id` - Primary key (immutable)

Vendors CAN request changes to:
- `name`, `tagline`, `bio`
- `logo_url`, `hero_image_url`
- `category`
- `contact_email`, `contact_phone`
- `website_url`, `instagram_handle`, `facebook_url`
- `delivery_available`, `pickup_available`

## Setup Instructions

### 1. Run Database Migrations

Execute these SQL files in order in Supabase SQL Editor:

1. `supabase/vendor_change_requests_schema.sql` - Creates the new table and function
2. `supabase/update_vendors_rls_for_requests.sql` - Updates vendors RLS policies

### 2. Verify Environment Variables

Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local` (required for admin approval function).

### 3. Test the Flow

1. **As a Vendor:**
   - Navigate to `/vendor/profile/edit`
   - Make changes to profile
   - Submit change request
   - Verify request appears in admin panel

2. **As an Admin:**
   - Navigate to `/admin/vendor-change-requests`
   - Review pending requests
   - Approve or reject requests
   - Verify changes are applied to vendor profile

## Workflow

```
Vendor → Submit Request → Pending Status
                           ↓
                    Admin Reviews
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
         Approved                  Rejected
              ↓                         ↓
    Changes Applied            Request Closed
    to Vendors Table           (with notes)
```

## Type Safety

**Location:** `types/database.ts`

The `vendor_change_requests` table has been added to the Database type definition for full TypeScript support.

## Admin Dashboard Integration

A link to the change requests page has been added to the admin dashboard at `/admin` for easy access.

## Future Enhancements

Potential improvements:
- Email notifications when requests are approved/rejected
- Request history page for vendors
- Bulk approval for admins
- Request modification (admin can edit before approving)
- Automatic approval for certain low-risk fields
- Request templates for common changes


