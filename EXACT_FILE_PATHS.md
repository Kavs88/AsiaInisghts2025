# Exact File Paths - Sunday Market Project

## 📍 Project Root Location

**Absolute Path:**
```
C:\Users\admin\Sunday Market Project
```

**Relative Path (from project root):**
```
./
```

---

## 🖼️ IMAGE FOLDERS - Exact Paths

### Main Public Folder
**Absolute:**
```
C:\Users\admin\Sunday Market Project\public
```

**Relative:**
```
./public
```

### Image Subfolders

#### 1. Vendor Images
**Absolute:**
```
C:\Users\admin\Sunday Market Project\public\images\vendors
```

**Relative:**
```
./public/images/vendors
```

**URL Path (for code):**
```
/images/vendors/your-image.jpg
```

#### 2. Product Images
**Absolute:**
```
C:\Users\admin\Sunday Market Project\public\images\products
```

**Relative:**
```
./public/images/products
```

**URL Path (for code):**
```
/images/products/your-image.jpg
```

#### 3. Hero/Background Images
**Absolute:**
```
C:\Users\admin\Sunday Market Project\public\images\hero
```

**Relative:**
```
./public/images/hero
```

**URL Path (for code):**
```
/images/hero/your-image.jpg
```

---

## 📁 COMPLETE FOLDER STRUCTURE

### Root Level
```
C:\Users\admin\Sunday Market Project\
├── app\                          # Next.js pages
├── components\                   # React components
├── contexts\                     # React contexts
├── lib\                          # Utility functions
├── public\                       # Static assets (IMAGES GO HERE)
│   └── images\
│       ├── vendors\             # Vendor logos/heroes
│       ├── products\            # Product images
│       └── hero\                # Hero/background images
├── supabase\                    # Database files
├── types\                        # TypeScript types
└── [config files]
```

### App Pages (Exact Paths)

#### Authentication
```
C:\Users\admin\Sunday Market Project\app\auth\login\page.tsx
C:\Users\admin\Sunday Market Project\app\auth\signup\page.tsx
```

#### Vendors
```
C:\Users\admin\Sunday Market Project\app\vendors\page.tsx
C:\Users\admin\Sunday Market Project\app\vendors\[slug]\page.tsx
```

#### Products
```
C:\Users\admin\Sunday Market Project\app\products\page.tsx
C:\Users\admin\Sunday Market Project\app\products\[slug]\page.tsx
```

#### Market Days
```
C:\Users\admin\Sunday Market Project\app\market-days\page.tsx
```

### Components (Exact Paths)

#### UI Components
```
C:\Users\admin\Sunday Market Project\components\ui\
├── Header.tsx
├── Footer.tsx
├── ProductCard.tsx
├── VendorCard.tsx
├── VendorTabs.tsx
├── OrderIntentCard.tsx
├── OrderIntentForm.tsx
├── VendorNotificationSettings.tsx
└── [other components]
```

### Library Functions (Exact Paths)

#### Authentication
```
C:\Users\admin\Sunday Market Project\lib\auth\auth.ts
```

#### Supabase
```
C:\Users\admin\Sunday Market Project\lib\supabase\
├── client.ts
├── server-client.ts
└── queries.ts
```

#### Notifications
```
C:\Users\admin\Sunday Market Project\lib\notifications\
├── vendor-notifications.ts
└── customer-notifications.ts
```

### Database Files (Exact Paths)

#### SQL Files
```
C:\Users\admin\Sunday Market Project\supabase\
├── schema.sql
├── order_intents_schema.sql
├── vendor_signup_policies_fixed.sql  ⚠️ IMPORTANT: Run this!
├── vendor_notifications_migration.sql
└── [other SQL files]
```

---

## 🎯 HOW TO USE IMAGE PATHS

### Example: Adding a Product Image

1. **Save image file to:**
   ```
   C:\Users\admin\Sunday Market Project\public\images\products\ceramic-bowl.jpg
   ```

2. **Use in code:**
   ```tsx
   import Image from 'next/image'
   
   <Image
     src="/images/products/ceramic-bowl.jpg"
     alt="Ceramic Bowl"
     width={400}
     height={400}
   />
   ```

### Example: Adding a Vendor Logo

1. **Save image file to:**
   ```
   C:\Users\admin\Sunday Market Project\public\images\vendors\luna-ceramics-logo.png
   ```

2. **Use in code:**
   ```tsx
   <Image
     src="/images/vendors/luna-ceramics-logo.png"
     alt="Luna Ceramics Logo"
     width={200}
     height={200}
   />
   ```

### Example: Adding a Hero Image

1. **Save image file to:**
   ```
   C:\Users\admin\Sunday Market Project\public\images\hero\homepage-banner.jpg
   ```

2. **Use in code:**
   ```tsx
   <div 
     style={{ backgroundImage: 'url(/images/hero/homepage-banner.jpg)' }}
     className="bg-cover bg-center"
   />
   ```

---

## 📋 PATH REFERENCE TABLE

| Purpose | Absolute Path | URL Path (in code) |
|---------|-------------|-------------------|
| **Vendor Images** | `C:\Users\admin\Sunday Market Project\public\images\vendors\` | `/images/vendors/` |
| **Product Images** | `C:\Users\admin\Sunday Market Project\public\images\products\` | `/images/products/` |
| **Hero Images** | `C:\Users\admin\Sunday Market Project\public\images\hero\` | `/images/hero/` |
| **Favicon** | `C:\Users\admin\Sunday Market Project\public\favicon.ico` | `/favicon.ico` |

---

## 🔍 QUICK ACCESS COMMANDS

### Open Public Folder in File Explorer
```powershell
# PowerShell
explorer "C:\Users\admin\Sunday Market Project\public\images"
```

### Open Specific Folder
```powershell
# Products folder
explorer "C:\Users\admin\Sunday Market Project\public\images\products"

# Vendors folder
explorer "C:\Users\admin\Sunday Market Project\public\images\vendors"

# Hero folder
explorer "C:\Users\admin\Sunday Market Project\public\images\hero"
```

### Navigate in Terminal
```powershell
cd "C:\Users\admin\Sunday Market Project\public\images\products"
```

---

## ⚠️ IMPORTANT NOTES

1. **URL Paths Always Start with `/`**
   - ✅ Correct: `/images/products/image.jpg`
   - ❌ Wrong: `images/products/image.jpg`
   - ❌ Wrong: `./images/products/image.jpg`

2. **Case Sensitivity**
   - Windows: Not case-sensitive
   - Linux/Mac: Case-sensitive
   - Best practice: Use lowercase with hyphens

3. **File Naming**
   - ✅ Good: `product-image-1.jpg`
   - ❌ Bad: `Product Image 1.jpg` (spaces)
   - ❌ Bad: `product_image_1.jpg` (underscores less common)

4. **Supported Formats**
   - `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, `.gif`

---

## 📂 CURRENT STRUCTURE VERIFICATION

All folders exist and are ready:
- ✅ `public/images/vendors/` - EXISTS
- ✅ `public/images/products/` - EXISTS  
- ✅ `public/images/hero/` - EXISTS

---

**Summary**: Images go in `C:\Users\admin\Sunday Market Project\public\images\[folder]\` and are referenced in code as `/images/[folder]/filename.jpg`





