-- ============================================
-- STORAGE SETUP FOR VENDOR IMAGES GALLERY
-- ============================================
-- Note: Bucket must be created manually in Supabase Dashboard:
-- 1. Go to Storage → Create bucket
-- 2. Create bucket: "vendor-images" (public)
-- 3. Then run this script to set up policies

-- ============================================
-- STORAGE POLICIES FOR VENDOR IMAGES
-- ============================================

-- Allow public read access to vendor gallery images
DROP POLICY IF EXISTS "Public read vendor images" ON storage.objects;
CREATE POLICY "Public read vendor images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-images');

-- Allow admins to upload vendor gallery images
DROP POLICY IF EXISTS "Admins can upload vendor images" ON storage.objects;
CREATE POLICY "Admins can upload vendor images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-images' AND
    is_admin(auth.uid())
  );

-- Allow admins to update vendor gallery images
DROP POLICY IF EXISTS "Admins can update vendor images" ON storage.objects;
CREATE POLICY "Admins can update vendor images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vendor-images' AND
    is_admin(auth.uid())
  );

-- Allow admins to delete vendor gallery images
DROP POLICY IF EXISTS "Admins can delete vendor images" ON storage.objects;
CREATE POLICY "Admins can delete vendor images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vendor-images' AND
    is_admin(auth.uid())
  );

-- Service role can manage all vendor images
DROP POLICY IF EXISTS "Service role can manage vendor images" ON storage.objects;
CREATE POLICY "Service role can manage vendor images" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'vendor-images')
  WITH CHECK (bucket_id = 'vendor-images');


