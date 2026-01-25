# Information for Hostinger Support

## Package.json Scripts

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
    "lint": "next lint"
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

- **`"build"`**: `"next build"` - Builds the Next.js application
- **`"start"`**: `"next start"` - Starts the production server
- **`"dev"`**: `"next dev -p 3001"` - Development server (not used in production)
- **`"lint"`**: `"next lint"` - Runs ESLint (optional)

## Directory Structure

```
hostinger-deploy/
├── package.json          ✅ Main package file
├── package-lock.json     ✅ Dependency lock file
├── next.config.js        ✅ Next.js configuration
├── tsconfig.json         ✅ TypeScript configuration
├── tailwind.config.js    ✅ Tailwind CSS configuration
├── postcss.config.js     ✅ PostCSS configuration
├── middleware.ts         ✅ Next.js middleware
├── next-env.d.ts         ✅ Next.js TypeScript definitions
│
├── app/                  ✅ Next.js App Router
│   ├── api/             ✅ API routes
│   ├── auth/             ✅ Authentication pages
│   ├── markets/          ✅ Main application pages
│   ├── layout.tsx        ✅ Root layout
│   ├── page.tsx          ✅ Homepage
│   └── ...               ✅ All other pages
│
├── components/           ✅ React components
│   ├── ui/              ✅ UI components
│   ├── layout/          ✅ Layout components
│   └── ...              ✅ Other components
│
├── lib/                  ✅ Utility functions
│   ├── supabase/        ✅ Supabase clients
│   ├── auth/            ✅ Authentication utilities
│   └── ...              ✅ Other utilities
│
├── public/               ✅ Static assets
│   ├── images/          ✅ Image files
│   └── ...              ✅ Other static files
│
├── types/                ✅ TypeScript type definitions
│   └── database.ts      ✅ Database types
│
└── supabase/             ✅ Database schemas (optional)
    └── ...               ✅ SQL files
```

## Framework Information

- **Framework**: Next.js 14.0.0 (App Router)
- **Node.js Version**: 18.17.0+ (supports 18.x, 20.x, 22.x, 24.x)
- **Package Manager**: npm
- **Build Output**: `.next` directory
- **Entry Point**: Standard Next.js (no custom server.js)

## Build Configuration

### Auto-Detected Settings (Expected)
- **Framework Preset**: Next.js
- **Node Version**: 20.x (or 18.x, 22.x, 24.x)
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Package Manager**: `npm`
- **Start Command**: `npm start` (runs `next start`)

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL`

## File Count Summary

- **Root Files**: ~20 configuration files
- **App Directory**: ~100+ page and API route files
- **Components**: ~50+ React components
- **Total Files**: ~200+ source files

## Deployment Method

- **Method**: Node.js Web Apps (auto-detection)
- **Upload**: Zip file upload
- **Framework Detection**: Automatic (Next.js)
- **Build Process**: Automatic (`npm install` → `npm run build`)

---

## For Hostinger Support

**Please provide this information when contacting support:**

1. **Package.json scripts** (shown above)
2. **Directory structure** (shown above)
3. **Framework**: Next.js 14.0.0
4. **Node.js version**: 20.x (or 18.x, 22.x, 24.x)
5. **Build command**: `npm run build`
6. **Start command**: `npm start`
7. **Output directory**: `.next`
8. **Exact error message** from build logs

This information will help Hostinger support diagnose the build failure.


