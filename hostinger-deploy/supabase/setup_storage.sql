-- Supabase Storage Setup for Vendor Images
-- Run this in Supabase SQL Editor after creating buckets manually

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Note: Buckets must be created manually in Supabase Dashboard:
-- 1. Go to Storage → Create bucket
-- 2. Create bucket: "vendor-assets" (public)
-- 3. Create bucket: "product-images" (public)
-- 4. Create bucket: "vendor-portfolio" (public)

-- ============================================
-- STORAGE POLICIES FOR VENDOR ASSETS
-- ============================================

-- Allow public read access to vendor assets (logo, hero images)
DROP POLICY IF EXISTS "Public read vendor assets" ON storage.objects;
CREATE POLICY "Public read vendor assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-assets');

-- Allow vendors to upload their own assets
DROP POLICY IF EXISTS "Vendors can upload assets" ON storage.objects;
CREATE POLICY "Vendors can upload assets" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-assets' AND
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE user_id IS NOT NULL)
  );

-- Allow vendors to update their own assets
DROP POLICY IF EXISTS "Vendors can update assets" ON storage.objects;
CREATE POLICY "Vendors can update assets" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vendor-assets' AND
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE user_id IS NOT NULL)
  );

-- Allow vendors to delete their own assets
DROP POLICY IF EXISTS "Vendors can delete assets" ON storage.objects;
CREATE POLICY "Vendors can delete assets" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vendor-assets' AND
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE user_id IS NOT NULL)
  );

-- ============================================
-- STORAGE POLICIES FOR PRODUCT IMAGES
-- ============================================

-- Allow public read access to product images
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow vendors to upload product images
DROP POLICY IF EXISTS "Vendors can upload product images" ON storage.objects;
CREATE POLICY "Vendors can upload product images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE user_id IS NOT NULL)
  );

-- Allow vendors to update product images
DROP POLICY IF EXISTS "Vendors can update product images" ON storage.objects;
CREATE POLICY "Vendors can update product images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE user_id IS NOT NULL)
  );

-- Allow vendors to delete product images
DROP POLICY IF EXISTS "Vendors can delete product images" ON storage.objects;
CREATE POLICY "Vendors can delete product images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE user_id IS NOT NULL)
  );

-- ============================================
-- STORAGE POLICIES FOR VENDOR PORTFOLIO
-- ============================================

-- Allow public read access to portfolio images
DROP POLICY IF EXISTS "Public read portfolio images" ON storage.objects;
CREATE POLICY "Public read portfolio images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-portfolio');

-- Allow vendors to upload portfolio images
DROP POLICY IF EXISTS "Vendors can upload portfolio images" ON storage.objects;
CREATE POLICY "Vendors can upload portfolio images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-portfolio' AND
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE user_id IS NOT NULL)
  );

-- Allow vendors to update portfolio images
DROP POLICY IF EXISTS "Vendors can update portfolio images" ON storage.objects;
CREATE POLICY "Vendors can update portfolio images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vendor-portfolio' AND
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE user_id IS NOT NULL)
  );

-- Allow vendors to delete portfolio images
DROP POLICY IF EXISTS "Vendors can delete portfolio images" ON storage.objects;
CREATE POLICY "Vendors can delete portfolio images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vendor-portfolio' AND
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE user_id IS NOT NULL)
  );


