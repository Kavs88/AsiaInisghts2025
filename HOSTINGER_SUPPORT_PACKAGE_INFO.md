# Package Information for Hostinger Support

## Complete package.json

```json
{
  "name": "sunday-market",
  "version": "1.0.0",
  "description": "Sunday Market - Multi-Vendor Platform built with Next.js",
  "private": true,
  "engines": {
    "node": ">=18.17.0"
  },
  "scripts": {
    "start": "next start",
    "build": "next build",
    "dev": "next dev -p 3001",
    "next-start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  },
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/auth-helpers-react": "^0.4.2",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.38.0",
    "@types/leaflet": "^1.9.21",
    "clsx": "^2.0.0",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.562.0",
    "next": "^14.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "postcss": "^8.4.31",
    "sharp": "^0.33.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  }
}
```

## Key Scripts

- **`build`**: `next build` - Builds the Next.js application for production
- **`start`**: `next start` - Starts the production server
- **`dev`**: `next dev -p 3001` - Development server (not used in production)
- **`lint`**: `next lint` - Runs ESLint (optional, not required for build)

## Directory Structure

```
hostinger-deploy/
├── package.json              ✅ Main package file
├── package-lock.json         ✅ Dependency lock file
├── next.config.js            ✅ Next.js configuration
├── tsconfig.json             ✅ TypeScript configuration
├── tailwind.config.js        ✅ Tailwind CSS configuration
├── postcss.config.js         ✅ PostCSS configuration
├── middleware.ts             ✅ Next.js middleware
├── next-env.d.ts             ✅ Next.js TypeScript definitions
│
├── app/                      ✅ Next.js App Router (189 TSX files)
│   ├── api/                  ✅ API routes
│   ├── auth/                 ✅ Authentication pages
│   ├── markets/              ✅ Main application pages
│   ├── layout.tsx            ✅ Root layout
│   ├── page.tsx              ✅ Homepage
│   └── [other pages]/        ✅ Additional pages
│
├── components/               ✅ React components (~50 components)
│   ├── ui/                   ✅ UI components
│   ├── layout/               ✅ Layout components
│   └── [other]/               ✅ Other components
│
├── lib/                      ✅ Utility functions
│   ├── supabase/             ✅ Supabase clients
│   ├── auth/                 ✅ Authentication utilities
│   └── [other]/               ✅ Other utilities
│
├── public/                   ✅ Static assets
│   └── images/               ✅ Image files
│
├── types/                    ✅ TypeScript type definitions
│   └── database.ts           ✅ Database types
│
└── supabase/                 ✅ Database schemas (optional)
    └── [SQL files]           ✅ Migration files
```

## File Statistics

- **TypeScript/TSX files**: 189
- **JavaScript files**: 3 (config files)
- **JSON files**: 4
- **Total source files**: ~324 files

## Framework Details

- **Framework**: Next.js 14.0.0
- **App Router**: Yes (using `/app` directory)
- **TypeScript**: Yes (strict mode enabled)
- **Node.js Version**: 18.17.0+ (supports 18.x, 20.x, 22.x, 24.x)
- **Package Manager**: npm
- **Build Output**: `.next` directory
- **Entry Point**: Standard Next.js (no custom server.js)

## Build Configuration

### Expected Auto-Detected Settings:
- **Framework Preset**: Next.js
- **Node Version**: 20.x (or 18.x, 22.x, 24.x)
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Package Manager**: `npm`
- **Start Command**: `npm start` (which runs `next start`)

## Root Directory Files

**Configuration Files:**
- `package.json`
- `package-lock.json`
- `next.config.js`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`
- `middleware.ts`
- `next-env.d.ts`

**Other Files:**
- `.htaccess` (Apache config)
- `env.template` (environment variable template)
- Various documentation files (`.md`)

## Main Directories

1. **`app/`** - Next.js App Router pages and API routes
2. **`components/`** - React components
3. **`lib/`** - Utility functions and helpers
4. **`public/`** - Static assets (images, etc.)
5. **`types/`** - TypeScript type definitions
6. **`supabase/`** - Database schemas and migrations

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL`

---

## For Hostinger Support Team

**Application Type**: Next.js 14.0.0 (App Router)  
**Deployment Method**: Node.js Web Apps (auto-detection)  
**Build Command**: `npm run build`  
**Start Command**: `npm start`  
**Output Directory**: `.next`  
**Node.js Version**: 20.x (or 18.x, 22.x, 24.x)  

**Package Structure**: Standard Next.js App Router structure  
**Total Files**: ~324 source files  
**Main Entry**: `app/layout.tsx` and `app/page.tsx`  

Please use this information to diagnose the build failure.


