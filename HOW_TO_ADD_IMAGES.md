# How to Add Images to Sunday Market Platform

## 📁 Folder Structure

In Next.js 14, static assets (images, fonts, etc.) go in the **`public`** folder at the root of your project.

### Current Structure:
```
C:\Users\admin\Sunday Market Project\
├── public\                    ← Static assets folder
│   ├── images\
│   │   ├── vendors\          ← Vendor logos/hero images
│   │   ├── products\         ← Product images
│   │   └── hero\             ← Hero/background images
│   └── favicon.ico           ← Site favicon
```

## 🖼️ Where to Put Images

### 1. **Vendor Images**
```
public/images/vendors/
├── vendor-logo-1.png
├── vendor-logo-2.jpg
├── vendor-hero-1.jpg
└── vendor-hero-2.jpg
```

### 2. **Product Images**
```
public/images/products/
├── product-1.jpg
├── product-2.png
├── product-3.jpg
└── ...
```

### 3. **Hero/Background Images**
```
public/images/hero/
├── homepage-hero.jpg
├── market-day-banner.jpg
└── ...
```

## 📝 How to Use Images in Code

### In Next.js Components:

#### Option 1: Using Next.js Image Component (Recommended)
```tsx
import Image from 'next/image'

// Image in public/images/products/product-1.jpg
<Image
  src="/images/products/product-1.jpg"
  alt="Product name"
  width={400}
  height={400}
/>
```

#### Option 2: Using Regular img Tag
```tsx
// Image in public/images/vendors/logo.png
<img 
  src="/images/vendors/logo.png" 
  alt="Vendor logo"
/>
```

#### Option 3: Using CSS Background
```tsx
<div 
  style={{ backgroundImage: 'url(/images/hero/homepage-hero.jpg)' }}
  className="bg-cover bg-center"
/>
```

## 🔍 Current Image Usage in Project

Currently, the project uses **external URLs** from:
- Supabase Storage (for vendor/product images from database)
- Unsplash (for placeholder images)

### Example from ProductCard:
```tsx
// Current: External URL from database
imageUrl: p.image_urls?.[0] || null

// To use local image instead:
imageUrl: "/images/products/product-1.jpg"
```

### Example from VendorCard:
```tsx
// Current: External URL from database
logoUrl: vendor.logo_url

// To use local image instead:
logoUrl: "/images/vendors/vendor-logo.png"
```

## 📋 Quick Reference

### Path Rules:
- ✅ **Correct**: `/images/products/product.jpg` (starts with `/`)
- ❌ **Wrong**: `images/products/product.jpg` (missing leading `/`)
- ❌ **Wrong**: `./images/products/product.jpg` (don't use relative paths)

### File Naming:
- Use lowercase with hyphens: `product-image-1.jpg`
- Avoid spaces: `product image.jpg` ❌ → `product-image.jpg` ✅
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, `.gif`

## 🎯 Example: Adding a Hardcoded Product Image

1. **Place image in folder:**
   ```
   public/images/products/ceramic-bowl.jpg
   ```

2. **Use in component:**
   ```tsx
   import Image from 'next/image'
   
   <Image
     src="/images/products/ceramic-bowl.jpg"
     alt="Ceramic Bowl"
     width={400}
     height={400}
     className="rounded-lg"
   />
   ```

3. **Or in ProductCard component:**
   ```tsx
   // In app/products/page.tsx or similar
   const mappedProducts = products.map((p) => ({
     ...p,
     imageUrl: "/images/products/ceramic-bowl.jpg" // Hardcoded
   }))
   ```

## 🔧 For Hardcoded Data (Seed/Mock Data)

If you want to hardcode images for testing:

### Option 1: Update Seed Data SQL
```sql
-- In supabase/seed_data.sql
UPDATE products 
SET image_urls = ARRAY['/images/products/product-1.jpg']
WHERE id = 'product-id';
```

### Option 2: Hardcode in Component
```tsx
// In app/products/page.tsx
const hardcodedProducts = [
  {
    id: '1',
    name: 'Ceramic Bowl',
    imageUrl: '/images/products/ceramic-bowl.jpg', // Local image
    price: 25.00,
  },
  // ...
]
```

## 📂 Recommended Folder Organization

```
public/
├── images/
│   ├── vendors/
│   │   ├── logos/           ← Vendor logos
│   │   └── heroes/          ← Vendor hero images
│   ├── products/
│   │   ├── ceramics/        ← Product category folders
│   │   ├── jewelry/
│   │   └── food/
│   ├── hero/                ← Homepage hero images
│   ├── market-days/         ← Market day banners
│   └── icons/               ← Custom icons
├── fonts/                   ← Custom fonts (if any)
└── favicon.ico
```

## ⚠️ Important Notes

1. **Images in `public` are publicly accessible**
   - Anyone can access `/images/products/product.jpg`
   - Don't put sensitive images here

2. **File Size**
   - Optimize images before adding (use tools like TinyPNG)
   - Large images slow down the site

3. **Next.js Image Optimization**
   - Currently disabled (`unoptimized: true` in next.config.js)
   - Can be enabled later for better performance

4. **Git**
   - Large image files shouldn't be committed to Git
   - Consider using `.gitignore` for large assets
   - Or use Supabase Storage for production

## 🚀 Next Steps

1. **Create the folders** (already done):
   ```powershell
   public/images/vendors/
   public/images/products/
   public/images/hero/
   ```

2. **Add your images** to the appropriate folders

3. **Update components** to use local paths instead of external URLs

4. **Test** that images load correctly

---

**Location**: `C:\Users\admin\Sunday Market Project\public\images\`





