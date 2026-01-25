# Quick Start: Upload Images for Vendors and Products

## 🚀 Fast Setup (5 minutes)

### 1. Create Storage Buckets

Go to **Supabase Dashboard** → **Storage** → **New bucket**:

1. Create `vendor-assets` (Public: ✅ Yes)
2. Create `product-images` (Public: ✅ Yes)  
3. Create `vendor-portfolio` (Public: ✅ Yes)

### 2. Run Storage Policies

Run `supabase/setup_storage_with_super_user.sql` in SQL Editor.

### 3. Upload Images via Dashboard

1. Go to **Storage** → `vendor-assets`
2. Click **Upload file**
3. Upload your logo/hero image
4. Click the uploaded file to get the **Public URL**
5. Copy the URL (looks like: `https://[project].supabase.co/storage/v1/object/public/vendor-assets/filename.jpg`)

### 4. Update Database with Image URLs

Run this SQL (replace with your values):

```sql
-- Update vendor logo and hero image
UPDATE public.vendors
SET 
    logo_url = 'https://[project].supabase.co/storage/v1/object/public/vendor-assets/logo.jpg',
    hero_image_url = 'https://[project].supabase.co/storage/v1/object/public/vendor-assets/hero.jpg',
    updated_at = NOW()
WHERE id = 'VENDOR_ID_HERE'
RETURNING name, logo_url, hero_image_url;
```

## 📝 Image URL Format

Supabase Storage URLs:
```
https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[file-path]
```

## ✅ Checklist

- [ ] Created 3 storage buckets (vendor-assets, product-images, vendor-portfolio)
- [ ] Ran `setup_storage_with_super_user.sql`
- [ ] Uploaded images to buckets
- [ ] Updated vendor `logo_url` and `hero_image_url` in database
- [ ] Updated product `image_urls` arrays in database
- [ ] Tested images display on frontend

## 🔧 Need Help?

- See `supabase/IMAGE_SETUP_GUIDE.md` for detailed instructions
- Use `supabase/update_vendor_images.sql` for vendor image updates
- Use `supabase/update_product_images.sql` for product image updates


