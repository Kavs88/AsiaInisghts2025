# Image Setup Guide for Vendors and Products

This guide explains how to set up image storage and update vendor logos and product images.

## Step 1: Create Storage Buckets in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket** and create these three buckets:

### Bucket 1: `vendor-assets`
- **Name**: `vendor-assets`
- **Public bucket**: ✅ **YES** (check this box)
- **File size limit**: 5 MB (or as needed)
- **Allowed MIME types**: `image/*` (or leave empty for all)

### Bucket 2: `product-images`
- **Name**: `product-images`
- **Public bucket**: ✅ **YES** (check this box)
- **File size limit**: 5 MB (or as needed)
- **Allowed MIME types**: `image/*` (or leave empty for all)

### Bucket 3: `vendor-portfolio`
- **Name**: `vendor-portfolio`
- **Public bucket**: ✅ **YES** (check this box)
- **File size limit**: 5 MB (or as needed)
- **Allowed MIME types**: `image/*` (or leave empty for all)

## Step 2: Set Up Storage Policies

After creating the buckets, run this SQL script in Supabase SQL Editor:

```sql
-- Run: supabase/setup_storage_with_super_user.sql
```

This will:
- Allow public read access to all images
- Allow vendors to upload their own images
- **Allow super users and admins to upload/update/delete any images**

## Step 3: Upload Images

### Option A: Upload via Supabase Dashboard (Easiest)

1. Go to **Storage** → Select a bucket (e.g., `vendor-assets`)
2. Click **Upload file**
3. Upload your image
4. After upload, click on the file to see its URL
5. Copy the **Public URL** (looks like: `https://[project].supabase.co/storage/v1/object/public/vendor-assets/filename.jpg`)

### Option B: Upload via SQL (For Bulk Updates)

You can update image URLs directly in the database:

```sql
-- Update vendor logo
UPDATE public.vendors
SET logo_url = 'https://[project].supabase.co/storage/v1/object/public/vendor-assets/logo.jpg'
WHERE id = 'vendor-id-here';

-- Update vendor hero image
UPDATE public.vendors
SET hero_image_url = 'https://[project].supabase.co/storage/v1/object/public/vendor-assets/hero.jpg'
WHERE id = 'vendor-id-here';

-- Update product images (array of URLs)
UPDATE public.products
SET image_urls = ARRAY['https://[project].supabase.co/storage/v1/object/public/product-images/image1.jpg', 'https://[project].supabase.co/storage/v1/object/public/product-images/image2.jpg']
WHERE id = 'product-id-here';
```

## Step 4: Image URL Format

Supabase Storage public URLs follow this format:

```
https://[your-project-id].supabase.co/storage/v1/object/public/[bucket-name]/[file-path]
```

Example:
```
https://abcdefghijklmnop.supabase.co/storage/v1/object/public/vendor-assets/vendors/logo.jpg
```

## Quick Update Script

Use this script to quickly update vendor images:

```sql
-- Replace 'VENDOR_ID_HERE' with actual vendor ID
-- Replace 'IMAGE_URL_HERE' with full Supabase Storage URL

UPDATE public.vendors
SET 
    logo_url = 'IMAGE_URL_HERE',
    hero_image_url = 'IMAGE_URL_HERE',
    updated_at = NOW()
WHERE id = 'VENDOR_ID_HERE'
RETURNING id, name, logo_url, hero_image_url;
```

## Image Organization Tips

### Recommended Folder Structure in Buckets:

**vendor-assets:**
```
vendor-assets/
  ├── vendors/
  │   ├── [vendor-slug]/
  │   │   ├── logo.jpg
  │   │   └── hero.jpg
```

**product-images:**
```
product-images/
  ├── products/
  │   ├── [product-slug]/
  │   │   ├── image1.jpg
  │   │   ├── image2.jpg
  │   │   └── image3.jpg
```

**vendor-portfolio:**
```
vendor-portfolio/
  ├── [vendor-slug]/
  │   ├── portfolio1.jpg
  │   ├── portfolio2.jpg
  │   └── portfolio3.jpg
```

## Troubleshooting

### Images Not Displaying

1. **Check URL is correct**: Make sure the URL is the full Supabase Storage public URL
2. **Check bucket is public**: Go to Storage → Bucket settings → Ensure "Public bucket" is enabled
3. **Check file exists**: Verify the file exists in the bucket
4. **Check CORS**: If accessing from a different domain, you may need to configure CORS in Supabase

### Permission Errors

- Make sure you've run `setup_storage_with_super_user.sql`
- Verify you're logged in as super user or admin
- Check that the storage policies are active

### File Size Issues

- Default limit is usually 50MB per file
- For larger files, increase the bucket file size limit in Supabase Dashboard

## Next Steps

After setting up images:
1. Test image display on vendor pages
2. Test image display on product pages
3. Verify images load correctly on mobile
4. Check image optimization (consider using Next.js Image component)


