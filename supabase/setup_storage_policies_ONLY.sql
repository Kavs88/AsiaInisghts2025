-- ============================================
-- STORAGE POLICIES FOR SUPER USERS
-- ============================================
-- Run this AFTER creating buckets in Supabase Dashboard
-- Buckets must be created manually: vendor-assets, product-images, vendor-portfolio
-- ============================================

-- ============================================
-- VENDOR ASSETS POLICIES
-- ============================================

-- Public read access
DROP POLICY IF EXISTS "Public read vendor assets" ON storage.objects;
CREATE POLICY "Public read vendor assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-assets');

-- Super users and admins can upload
DROP POLICY IF EXISTS "Super users and admins can upload vendor assets" ON storage.objects;
CREATE POLICY "Super users and admins can upload vendor assets" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-assets' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Super users and admins can update
DROP POLICY IF EXISTS "Super users and admins can update vendor assets" ON storage.objects;
CREATE POLICY "Super users and admins can update vendor assets" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vendor-assets' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Super users and admins can delete
DROP POLICY IF EXISTS "Super users and admins can delete vendor assets" ON storage.objects;
CREATE POLICY "Super users and admins can delete vendor assets" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vendor-assets' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- ============================================
-- PRODUCT IMAGES POLICIES
-- ============================================

-- Public read access
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Super users and admins can upload
DROP POLICY IF EXISTS "Super users and admins can upload product images" ON storage.objects;
CREATE POLICY "Super users and admins can upload product images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Super users and admins can update
DROP POLICY IF EXISTS "Super users and admins can update product images" ON storage.objects;
CREATE POLICY "Super users and admins can update product images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Super users and admins can delete
DROP POLICY IF EXISTS "Super users and admins can delete product images" ON storage.objects;
CREATE POLICY "Super users and admins can delete product images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- ============================================
-- VENDOR PORTFOLIO POLICIES
-- ============================================

-- Public read access
DROP POLICY IF EXISTS "Public read portfolio images" ON storage.objects;
CREATE POLICY "Public read portfolio images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-portfolio');

-- Super users and admins can upload
DROP POLICY IF EXISTS "Super users and admins can upload portfolio images" ON storage.objects;
CREATE POLICY "Super users and admins can upload portfolio images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-portfolio' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Super users and admins can update
DROP POLICY IF EXISTS "Super users and admins can update portfolio images" ON storage.objects;
CREATE POLICY "Super users and admins can update portfolio images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vendor-portfolio' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );

-- Super users and admins can delete
DROP POLICY IF EXISTS "Super users and admins can delete portfolio images" ON storage.objects;
CREATE POLICY "Super users and admins can delete portfolio images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vendor-portfolio' AND
    (is_admin(auth.uid()) OR is_super_user(auth.uid()))
  );


