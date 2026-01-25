-- ============================================
-- UPDATE VENDOR IMAGES
-- ============================================
-- Use this script to update vendor logo and hero images
-- ============================================

-- STEP 1: List all vendors to find the one you want to update
SELECT 
    id,
    name,
    slug,
    logo_url,
    hero_image_url
FROM public.vendors
ORDER BY name;

-- ============================================
-- STEP 2: Update a specific vendor's images
-- ============================================
-- Replace the values below:
-- - 'VENDOR_ID_HERE' with the actual vendor UUID
-- - 'LOGO_URL_HERE' with the full Supabase Storage URL for the logo
-- - 'HERO_URL_HERE' with the full Supabase Storage URL for the hero image

/*
UPDATE public.vendors
SET 
    logo_url = 'LOGO_URL_HERE',
    hero_image_url = 'HERO_URL_HERE',
    updated_at = NOW()
WHERE id = 'VENDOR_ID_HERE'
RETURNING 
    id,
    name,
    logo_url,
    hero_image_url,
    '✅ Images updated successfully!' as status;
*/

-- ============================================
-- STEP 3: Update multiple vendors at once
-- ============================================
-- Example: Update logo for multiple vendors

/*
UPDATE public.vendors
SET 
    logo_url = CASE 
        WHEN slug = 'vendor-slug-1' THEN 'https://[project].supabase.co/storage/v1/object/public/vendor-assets/vendors/vendor-1/logo.jpg'
        WHEN slug = 'vendor-slug-2' THEN 'https://[project].supabase.co/storage/v1/object/public/vendor-assets/vendors/vendor-2/logo.jpg'
        ELSE logo_url
    END,
    updated_at = NOW()
WHERE slug IN ('vendor-slug-1', 'vendor-slug-2')
RETURNING id, name, slug, logo_url;
*/

-- ============================================
-- STEP 4: Clear/Remove images (set to NULL)
-- ============================================

/*
UPDATE public.vendors
SET 
    logo_url = NULL,
    hero_image_url = NULL,
    updated_at = NOW()
WHERE id = 'VENDOR_ID_HERE'
RETURNING id, name, logo_url, hero_image_url;
*/

-- ============================================
-- STEP 5: Verify image URLs are valid
-- ============================================
-- Check for vendors with missing or invalid image URLs

/*
SELECT 
    id,
    name,
    slug,
    logo_url,
    hero_image_url,
    CASE 
        WHEN logo_url IS NULL THEN '⚠️ No logo'
        WHEN logo_url NOT LIKE 'https://%' THEN '❌ Invalid logo URL'
        ELSE '✅ Logo OK'
    END as logo_status,
    CASE 
        WHEN hero_image_url IS NULL THEN '⚠️ No hero image'
        WHEN hero_image_url NOT LIKE 'https://%' THEN '❌ Invalid hero URL'
        ELSE '✅ Hero OK'
    END as hero_status
FROM public.vendors
ORDER BY name;
*/


