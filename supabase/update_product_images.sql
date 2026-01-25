-- ============================================
-- UPDATE PRODUCT IMAGES
-- ============================================
-- Use this script to update product image URLs
-- ============================================

-- STEP 1: List all products to find the one you want to update
SELECT 
    p.id,
    p.name,
    p.slug,
    p.image_urls,
    v.name as vendor_name
FROM public.products p
JOIN public.vendors v ON p.vendor_id = v.id
ORDER BY v.name, p.name;

-- ============================================
-- STEP 2: Update a specific product's images
-- ============================================
-- Replace:
-- - 'PRODUCT_ID_HERE' with the actual product UUID
-- - Image URLs with full Supabase Storage URLs
-- Note: image_urls is an array, so use ARRAY['url1', 'url2'] format

/*
UPDATE public.products
SET 
    image_urls = ARRAY[
        'https://[project].supabase.co/storage/v1/object/public/product-images/products/product-slug/image1.jpg',
        'https://[project].supabase.co/storage/v1/object/public/product-images/products/product-slug/image2.jpg'
    ],
    updated_at = NOW()
WHERE id = 'PRODUCT_ID_HERE'
RETURNING 
    id,
    name,
    image_urls,
    '✅ Images updated successfully!' as status;
*/

-- ============================================
-- STEP 3: Add a single image to a product
-- ============================================
-- This adds a new image to existing images (if any)

/*
UPDATE public.products
SET 
    image_urls = COALESCE(image_urls, ARRAY[]::TEXT[]) || ARRAY['https://[project].supabase.co/storage/v1/object/public/product-images/new-image.jpg'],
    updated_at = NOW()
WHERE id = 'PRODUCT_ID_HERE'
RETURNING id, name, image_urls;
*/

-- ============================================
-- STEP 4: Clear product images (set to empty array)
-- ============================================

/*
UPDATE public.products
SET 
    image_urls = ARRAY[]::TEXT[],
    updated_at = NOW()
WHERE id = 'PRODUCT_ID_HERE'
RETURNING id, name, image_urls;
*/

-- ============================================
-- STEP 5: Verify product images
-- ============================================
-- Check for products with missing or invalid image URLs

/*
SELECT 
    p.id,
    p.name,
    p.slug,
    p.image_urls,
    v.name as vendor_name,
    CASE 
        WHEN p.image_urls IS NULL OR array_length(p.image_urls, 1) IS NULL THEN '⚠️ No images'
        WHEN array_length(p.image_urls, 1) = 0 THEN '⚠️ Empty image array'
        ELSE '✅ Has ' || array_length(p.image_urls, 1) || ' image(s)'
    END as image_status
FROM public.products p
JOIN public.vendors v ON p.vendor_id = v.id
ORDER BY v.name, p.name;
*/


