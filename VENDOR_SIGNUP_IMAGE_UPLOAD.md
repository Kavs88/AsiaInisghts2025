# Vendor Sign-Up with Image Upload - Implementation Guide

## Overview

This implementation adds comprehensive vendor sign-up functionality with image uploads (logo, hero image, portfolio) and profile editing capabilities. All images are stored in Supabase Storage with proper validation and security.

## Files Created/Modified

### New Files

1. **`supabase/setup_storage.sql`**
   - Storage bucket policies for vendor assets, product images, and portfolio
   - RLS policies for secure image uploads and access

2. **`lib/supabase/storage.ts`**
   - Image upload utilities
   - File validation (type, size)
   - Path generation for organized storage
   - Functions: `uploadVendorLogo`, `uploadVendorHero`, `uploadPortfolioImage`, `deleteImage`, `getImageUrl`

3. **`app/vendor/apply/page-client.tsx`**
   - Complete vendor sign-up form with image uploads
   - Real-time image preview
   - Form validation
   - Auto-slug generation

4. **`app/vendor/profile/edit/page.tsx`** (Server Component)
   - Fetches vendor data for editing
   - Authentication check

5. **`app/vendor/profile/edit/page-client.tsx`**
   - Profile editing form with image uploads
   - Update existing images or upload new ones
   - Delete old images when replaced

### Modified Files

1. **`app/vendor/apply/page.tsx`**
   - Updated to use the new client component with full functionality

2. **`app/vendor/dashboard/page.tsx`**
   - Added "Edit Profile & Images" link in Quick Actions

## Setup Instructions

### 1. Create Supabase Storage Buckets

In your Supabase Dashboard:

1. Go to **Storage** → **Create bucket**
2. Create three buckets:
   - **`vendor-assets`** (public) - for logos and hero images
   - **`product-images`** (public) - for product images
   - **`vendor-portfolio`** (public) - for portfolio images

### 2. Run Storage Setup SQL

In Supabase SQL Editor, run:
```sql
-- Run the contents of supabase/setup_storage.sql
```

This creates all necessary RLS policies for secure image uploads.

### 3. Verify Next.js Image Configuration

Ensure `next.config.js` includes Supabase in `remotePatterns`:
```js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
}
```

## Features

### Vendor Sign-Up (`/vendor/apply`)

- **Business Information**
  - Business name (auto-generates slug)
  - Tagline
  - Category selection
  - Bio/description

- **Image Uploads**
  - Logo upload with preview (square recommended)
  - Hero/banner image upload with preview (16:9 recommended)
  - Real-time validation (file type, size max 5MB)
  - Image preview before submission

- **Contact Information**
  - Contact email
  - Contact phone
  - Website URL
  - Instagram handle

- **Delivery Options**
  - Pickup available
  - Delivery available

- **Security**
  - Requires authentication
  - Prevents duplicate vendor accounts
  - Sets vendor as inactive (requires admin approval)

### Profile Editing (`/vendor/profile/edit`)

- Edit all vendor information
- Update or replace logo and hero images
- Delete old images when replaced
- Real-time preview of new images
- Maintains existing images if not changed

## Image Storage Structure

```
vendor-assets/
  └── vendors/
      └── {vendor-id}/
          ├── logo-{timestamp}.{ext}
          └── hero-{timestamp}.{ext}

vendor-portfolio/
  └── vendors/
      └── {vendor-id}/
          └── portfolio/
              └── {timestamp}-{filename}

product-images/
  └── products/
      └── {vendor-id}/
          └── {product-id}/
              └── {timestamp}-{index}.{ext}
```

## Image Validation

- **Allowed Types**: JPEG, JPG, PNG, WebP
- **Max Size**: 5MB per image
- **Validation**: Client-side before upload
- **Error Handling**: User-friendly error messages

## Security Features

1. **RLS Policies**
   - Vendors can only upload to their own folders
   - Public read access for display
   - Vendors can update/delete their own images

2. **Authentication**
   - Sign-up requires logged-in user
   - Profile editing requires vendor account
   - Server-side authentication checks

3. **File Validation**
   - Type checking
   - Size limits
   - Path sanitization

## Usage Examples

### Upload Logo
```typescript
import { uploadVendorLogo } from '@/lib/supabase/storage'

const result = await uploadVendorLogo(vendorId, file)
if (result.error) {
  console.error(result.error)
} else {
  console.log('Logo URL:', result.url)
}
```

### Delete Image
```typescript
import { deleteImage } from '@/lib/supabase/storage'

const result = await deleteImage('vendor-assets', 'vendors/123/logo-123456.jpg')
```

## Database Schema

The implementation uses existing vendor table fields:
- `logo_url` - Logo image URL
- `hero_image_url` - Hero/banner image URL
- All other vendor fields for profile information

## Next Steps

1. **Portfolio Management**
   - Add portfolio image upload/management UI
   - Connect to `vendor_portfolio_items` table

2. **Product Images**
   - Extend product creation form with image uploads
   - Use `uploadProductImage` function (to be created)

3. **Image Optimization**
   - Add image compression before upload
   - Generate thumbnails
   - Support multiple image sizes

4. **Admin Approval**
   - Admin interface to approve/reject vendor applications
   - Email notifications for approval status

## Troubleshooting

### Images Not Uploading
- Check storage bucket exists and is public
- Verify RLS policies are applied
- Check user has vendor role
- Verify file size/type validation

### Images Not Displaying
- Check Next.js image configuration
- Verify Supabase URL in remotePatterns
- Check image URLs are public
- Verify bucket public access settings

### Permission Errors
- Ensure storage policies are correctly applied
- Check user is authenticated
- Verify vendor record exists for user

## Notes

- Images are stored with timestamps to prevent overwrites
- Old images are not automatically deleted (consider cleanup job)
- All images are publicly accessible (consider signed URLs for sensitive content)
- File paths are sanitized to prevent directory traversal


