# Storage Setup - Step by Step

## ⚠️ IMPORTANT: Buckets Cannot Be Created via SQL

Storage buckets must be created manually in the Supabase Dashboard. SQL can only set up the policies (permissions) for the buckets.

## Step 1: Create Buckets in Supabase Dashboard (2 minutes)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Click "Storage"** in the left sidebar
4. **Click "New bucket"** button

### Create Bucket 1: `vendor-assets`
- **Bucket name**: `vendor-assets`
- **Public bucket**: ✅ **Check this box** (IMPORTANT!)
- Click **Create bucket**

### Create Bucket 2: `product-images`
- **Bucket name**: `product-images`
- **Public bucket**: ✅ **Check this box** (IMPORTANT!)
- Click **Create bucket**

### Create Bucket 3: `vendor-portfolio`
- **Bucket name**: `vendor-portfolio`
- **Public bucket**: ✅ **Check this box** (IMPORTANT!)
- Click **Create bucket**

## Step 2: Run Storage Policies SQL (1 minute)

After creating the buckets, run this SQL in **Supabase SQL Editor**:

**File to run**: `supabase/setup_storage_with_super_user.sql`

OR copy and paste this SQL:

```sql
-- ============================================
-- STORAGE POLICIES FOR VENDOR ASSETS
-- ============================================

-- Allow public read access
DROP POLICY IF EXISTS "Public read vendor assets" ON storage.objects;
CREATE POLICY "Public read vendor assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-assets');

-- Allow super users and admins to upload
DROP POLICY IF EXISTS "Super users and admins can upload vendor assets" ON storage.objects;
CREATE POLICY "Super users and admins can upload vendor assets" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-assets' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Allow super users and admins to update
DROP POLICY IF EXISTS "Super users and admins can update vendor assets" ON storage.objects;
CREATE POLICY "Super users and admins can update vendor assets" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vendor-assets' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Allow super users and admins to delete
DROP POLICY IF EXISTS "Super users and admins can delete vendor assets" ON storage.objects;
CREATE POLICY "Super users and admins can delete vendor assets" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vendor-assets' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- ============================================
-- STORAGE POLICIES FOR PRODUCT IMAGES
-- ============================================

-- Allow public read access
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow super users and admins to upload
DROP POLICY IF EXISTS "Super users and admins can upload product images" ON storage.objects;
CREATE POLICY "Super users and admins can upload product images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Allow super users and admins to update
DROP POLICY IF EXISTS "Super users and admins can update product images" ON storage.objects;
CREATE POLICY "Super users and admins can update product images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Allow super users and admins to delete
DROP POLICY IF EXISTS "Super users and admins can delete product images" ON storage.objects;
CREATE POLICY "Super users and admins can delete product images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- ============================================
-- STORAGE POLICIES FOR VENDOR PORTFOLIO
-- ============================================

-- Allow public read access
DROP POLICY IF EXISTS "Public read portfolio images" ON storage.objects;
CREATE POLICY "Public read portfolio images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-portfolio');

-- Allow super users and admins to upload
DROP POLICY IF EXISTS "Super users and admins can upload portfolio images" ON storage.objects;
CREATE POLICY "Super users and admins can upload portfolio images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-portfolio' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Allow super users and admins to update
DROP POLICY IF EXISTS "Super users and admins can update portfolio images" ON storage.objects;
CREATE POLICY "Super users and admins can update portfolio images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vendor-portfolio' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Allow super users and admins to delete
DROP POLICY IF EXISTS "Super users and admins can delete portfolio images" ON storage.objects;
CREATE POLICY "Super users and admins can delete portfolio images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vendor-portfolio' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );
```

## Step 3: Verify It Worked

Run this query to check policies were created:

```sql
SELECT 
    policyname,
    cmd as operation,
    bucket_id
FROM pg_policies
WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%Super user%'
ORDER BY bucket_id, cmd;
```

You should see policies for all three buckets (vendor-assets, product-images, vendor-portfolio).

## Step 4: Upload Your First Image (Test)

1. Go to **Storage** → `vendor-assets`
2. Click **Upload file**
3. Upload a test image (logo.jpg)
4. After upload, click on the file
5. Copy the **Public URL** (looks like: `https://[project-id].supabase.co/storage/v1/object/public/vendor-assets/logo.jpg`)

## Step 5: Update a Vendor with the Image URL

```sql
-- Replace 'VENDOR_ID_HERE' with actual vendor ID
-- Replace 'IMAGE_URL_HERE' with the URL you copied

UPDATE public.vendors
SET 
    logo_url = 'IMAGE_URL_HERE',
    updated_at = NOW()
WHERE id = 'VENDOR_ID_HERE'
RETURNING id, name, logo_url;
```

## ✅ Checklist

- [ ] Created 3 buckets in Supabase Dashboard (vendor-assets, product-images, vendor-portfolio)
- [ ] All buckets are set to **Public**
- [ ] Ran the storage policies SQL script
- [ ] Verified policies exist (using the verification query)
- [ ] Uploaded a test image
- [ ] Updated a vendor with the image URL
- [ ] Tested image displays on frontend

## 🎯 That's It!

Once you've done these steps, you can:
- Upload images via Supabase Dashboard
- Update image URLs in the database
- Images will display on your website


