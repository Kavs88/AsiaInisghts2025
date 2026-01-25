# Storage Bucket to Image Mapping

## 📦 Which Bucket is Used for Which Images?

### 🏪 `vendor-assets` Bucket

**Used for vendor branding images:**

1. **`vendors.logo_url`** 
   - **What it is**: Vendor logo image
   - **Where it's displayed**:
     - Vendor cards (small logo in corner)
     - Vendor profile pages
     - Vendor listings
   - **Example URL**: `https://[project].supabase.co/storage/v1/object/public/vendor-assets/vendors/bakery-logo.jpg`

2. **`vendors.hero_image_url`**
   - **What it is**: Large banner/hero image for vendor
   - **Where it's displayed**:
     - Vendor cards (large background image)
     - Vendor profile page header
   - **Example URL**: `https://[project].supabase.co/storage/v1/object/public/vendor-assets/vendors/bakery-hero.jpg`

**Database fields:**
- `public.vendors.logo_url` → Points to `vendor-assets` bucket
- `public.vendors.hero_image_url` → Points to `vendor-assets` bucket

---

### 🛍️ `product-images` Bucket

**Used for product photos:**

1. **`products.image_urls`** (array of URLs)
   - **What it is**: Product photos (can have multiple images per product)
   - **Where it's displayed**:
     - Product cards (first image in array)
     - Product detail pages (all images in array)
     - Search results
     - Shopping cart
   - **Example URLs**: 
     ```
     ARRAY[
       'https://[project].supabase.co/storage/v1/object/public/product-images/products/bread-loaf-1.jpg',
       'https://[project].supabase.co/storage/v1/object/public/product-images/products/bread-loaf-2.jpg'
     ]
     ```

**Database field:**
- `public.products.image_urls` → Points to `product-images` bucket (array of URLs)

---

### 🎨 `vendor-portfolio` Bucket

**Used for vendor portfolio/gallery images:**

- **What it is**: Additional images showcasing vendor work/products
- **Where it's displayed**:
  - Vendor profile "Portfolio" tab
  - Vendor gallery sections
- **Note**: This may be stored in a separate `vendor_portfolio_items` table or similar
- **Example URL**: `https://[project].supabase.co/storage/v1/object/public/vendor-portfolio/vendors/bakery/portfolio-1.jpg`

---

## 📊 Quick Reference Table

| Bucket Name | Database Field(s) | What It's For | Displayed On |
|------------|------------------|---------------|--------------|
| `vendor-assets` | `vendors.logo_url`<br>`vendors.hero_image_url` | Vendor logo & banner | Vendor branding | Vendor cards, vendor pages |
| `product-images` | `products.image_urls[]` | Product photos | Product cards, product pages |
| `vendor-portfolio` | Portfolio table (if exists) | Portfolio/gallery images | Vendor portfolio tab |

---

## 🔍 How to Find Which Image Goes Where

### To Update Vendor Logo:
```sql
-- Upload logo to vendor-assets bucket, then:
UPDATE public.vendors
SET logo_url = 'https://[project].supabase.co/storage/v1/object/public/vendor-assets/logo.jpg'
WHERE id = 'vendor-id';
```

### To Update Vendor Hero Image:
```sql
-- Upload hero image to vendor-assets bucket, then:
UPDATE public.vendors
SET hero_image_url = 'https://[project].supabase.co/storage/v1/object/public/vendor-assets/hero.jpg'
WHERE id = 'vendor-id';
```

### To Update Product Images:
```sql
-- Upload product images to product-images bucket, then:
UPDATE public.products
SET image_urls = ARRAY[
  'https://[project].supabase.co/storage/v1/object/public/product-images/image1.jpg',
  'https://[project].supabase.co/storage/v1/object/public/product-images/image2.jpg'
]
WHERE id = 'product-id';
```

---

## ✅ Checklist: Where to Upload Your Images

- [ ] **Vendor logo** → Upload to `vendor-assets` → Update `vendors.logo_url`
- [ ] **Vendor banner/hero** → Upload to `vendor-assets` → Update `vendors.hero_image_url`
- [ ] **Product photos** → Upload to `product-images` → Update `products.image_urls` array
- [ ] **Portfolio images** → Upload to `vendor-portfolio` → Update portfolio table (if applicable)

---

## 🎯 Most Common Use Cases

### Setting up a new vendor:
1. Upload logo to `vendor-assets` → Set `vendors.logo_url`
2. Upload hero image to `vendor-assets` → Set `vendors.hero_image_url`

### Adding product images:
1. Upload product photos to `product-images`
2. Update `products.image_urls` with array of URLs

---

## ❓ About Section Images

**Question: Does the About section use images?**

**Answer:** Currently, the About tab on vendor profile pages only displays:
- Vendor bio text (`vendors.bio`)
- Contact information

**However**, if you want to add images to the About section in the future (like photos of the vendor, their workspace, team photos, etc.), those would go in the **`vendor-assets`** bucket, since they're vendor-related assets.

**Current About section content:**
- Text only (bio + contact info)
- No images displayed

**If you add About section images later:**
- Upload to `vendor-assets` bucket
- Store URLs in a new field (e.g., `vendors.about_images[]`) or use a separate table
- Display in the About tab alongside the bio text

