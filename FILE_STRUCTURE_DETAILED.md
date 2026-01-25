# Detailed File Structure - Hostinger Deployment Package

## 📁 Complete Directory Structure

```
hostinger-deploy/
│
├── 📂 app/                          # Next.js App Router (pages & routes)
│   ├── 📂 actions/                  # Server actions
│   │   └── vendor-change-requests.ts
│   ├── 📂 api/                      # API routes
│   │   ├── deals/
│   │   ├── discovery/
│   │   ├── events/
│   │   ├── my-events/
│   │   ├── reviews/
│   │   └── vendor/
│   ├── 📂 auth/                     # Authentication pages
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── login-simple/
│   │   ├── reset-password/
│   │   └── signup/
│   ├── 📂 businesses/               # Business directory pages
│   │   ├── [slug]/
│   │   └── page.tsx
│   ├── 📂 community/
│   │   └── events/
│   ├── 📂 concierge/                # Concierge section
│   ├── 📂 contact/
│   ├── 📂 markets/                  # Markets section (main)
│   │   ├── admin/                   # Admin dashboard
│   │   ├── discovery/
│   │   ├── events/
│   │   ├── market-days/
│   │   ├── my-events/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── sellers/
│   │   └── vendor/
│   ├── 📂 meet-the-team/
│   ├── 📂 properties/               # Properties/Stays section
│   │   ├── [id]/
│   │   └── page.tsx
│   ├── 📂 vendors/
│   ├── 📂 venues/
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Homepage
│   ├── globals.css                  # Global styles
│   ├── error.tsx                    # Error page
│   ├── not-found.tsx                # 404 page
│   └── loading.tsx                  # Loading component
│
├── 📂 components/                    # React components
│   ├── 📂 auth/                     # Auth components
│   │   └── RecoveryTokenHandler.tsx
│   ├── 📂 contexts/                 # React contexts (moved from root)
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── 📂 providers/                # Context providers
│   │   └── AppProviders.tsx
│   ├── 📂 ui/                       # UI components (46 files)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── BusinessCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── VendorCard.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── Modal.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ContactForm.tsx
│   │   └── ... (36 more UI components)
│   ├── 📂 cards/                    # Card components (empty, for future)
│   ├── 📂 layout/                   # Layout components (empty, for future)
│   └── 📂 modals/                   # Modal components (empty, for future)
│
├── 📂 lib/                          # Utility libraries
│   ├── 📂 actions/                  # Server actions (moved from root)
│   │   ├── businesses.ts
│   │   └── properties.ts
│   ├── 📂 auth/                     # Authentication utilities
│   │   ├── admin.ts
│   │   ├── authority.ts
│   │   ├── authority-client.ts
│   │   └── ... (6 more auth files)
│   ├── 📂 notifications/           # Notification system
│   │   ├── customer-notifications.ts
│   │   └── vendor-notifications.ts
│   ├── 📂 supabase/                 # Supabase clients
│   │   ├── client.ts                # Client-side Supabase
│   │   ├── server.ts                # Server-side Supabase
│   │   ├── queries.ts               # Database queries
│   │   └── storage.ts               # Storage utilities
│   └── utils.ts                     # General utilities
│
├── 📂 public/                       # Static assets
│   ├── 📂 images/                   # Image assets
│   │   ├── asia-insights-logo.svg   # ✅ Asia Insights logo
│   │   ├── ai-markets.png
│   │   ├── Stalls*.jpg              # Market stall images
│   │   └── ... (30 image files)
│   ├── icon-192.png
│   ├── icon-512.png
│   └── manifest.json
│
├── 📂 supabase/                     # Database migrations & SQL
│   ├── 📂 migrations/               # Database migrations (23 files)
│   ├── 📂 functions/               # Edge functions (8 files)
│   ├── functions.sql
│   └── ... (many SQL setup files)
│
├── 📂 types/                        # TypeScript type definitions
│   ├── business.ts
│   └── database.ts
│
├── 📄 Configuration Files (Root)
│   ├── package.json                 # Dependencies & scripts
│   ├── package-lock.json            # Locked dependencies
│   ├── next.config.js               # Next.js configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── middleware.ts                # Next.js middleware
│   ├── .htaccess                    # Apache configuration
│   └── env.template                 # Environment variables template
│
└── 📄 Documentation Files
    ├── README.md
    ├── HOSTINGER_DEPLOYMENT.md      # Full deployment guide
    ├── QUICK_DEPLOY_HOSTINGER.md    # Quick start guide
    ├── SUPABASE_REDIRECT_URLS.md    # Supabase config guide
    └── HOSTINGER_403_FIX.md         # 403 error fix guide
```

## 📊 Key Statistics

- **Total Folders**: ~50+ directories
- **Total Files**: ~200+ files
- **Main Sections**:
  - `app/` - 57+ page files
  - `components/ui/` - 46 UI components
  - `lib/` - 15+ utility files
  - `public/images/` - 30+ image files
  - `supabase/migrations/` - 23 migration files

## 🎯 Important Paths

### Entry Points
- **Homepage**: `app/page.tsx`
- **Root Layout**: `app/layout.tsx`
- **Middleware**: `middleware.ts`

### Main Sections
- **Markets**: `app/markets/`
- **Businesses**: `app/businesses/`
- **Properties**: `app/properties/`
- **Auth**: `app/auth/`

### Key Components
- **Header**: `components/ui/Header.tsx` (with Asia Insights logo)
- **Footer**: `components/ui/Footer.tsx`
- **Contexts**: `components/contexts/` (AuthContext, CartContext)

### Server Actions
- **Businesses**: `lib/actions/businesses.ts`
- **Properties**: `lib/actions/properties.ts`

### Configuration
- **Next.js**: `next.config.js`
- **TypeScript**: `tsconfig.json`
- **Tailwind**: `tailwind.config.js`
- **Apache**: `.htaccess`

## 📦 When Extracted to public_html/

After extraction, `public_html/` should contain:

```
public_html/
├── app/
├── components/
├── lib/
├── public/
├── supabase/
├── types/
├── package.json
├── next.config.js
├── .htaccess
└── ... (all files and folders)
```

All folders and files should be **directly in public_html/**, not in a subfolder.



