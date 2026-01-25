# Sunday Market - Multi-Vendor Platform

A production-grade marketplace platform supporting vendor portfolios, online stores, and real-world Sunday markets with stalls.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. **Set up database:**
Run the SQL schema in `supabase/schema.sql` in your Supabase SQL editor.

4. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── layout/         # Layout components (Header, Footer)
├── lib/                # Utility functions
│   ├── supabase/       # Supabase client setup
│   └── utils.ts        # Helper functions
├── types/              # TypeScript type definitions
├── supabase/           # Database schema and migrations
└── public/             # Static assets
```

## Key Features

- ✅ Complete database schema with RLS policies and indexes
- ✅ Design system with Tailwind tokens (8px grid, color palette, typography)
- ✅ Global header with search, navigation, mega menu, cart
- ✅ Vendor discovery and profiles with tabs (Store/Portfolio/About/Stall)
- ✅ Product catalog with search and typeahead
- ✅ Market day pages with interactive SVG stall map
- ✅ Vendor dashboard with stats and order management
- ✅ Production-ready Supabase queries
- ✅ Transactional order creation with stock management
- ✅ Accessible UI components (keyboard nav, ARIA, focus management)

## Pages Implemented

- ✅ Home page (hero, featured vendors/products)
- ✅ Vendors list page (filters, search)
- ✅ Vendor profile page (tabs, portfolio, products)
- ✅ Product detail page (images, add to cart, delivery options)
- ✅ Market days page (upcoming markets, stall map)
- ✅ Vendor dashboard (stats, orders, products)

## Components

- ✅ Header (sticky, responsive, integrated search & mega menu)
- ✅ SearchBar (typeahead, keyboard navigation, fullscreen mobile)
- ✅ MegaMenu (categories, featured vendors, market preview)
- ✅ VendorCard (badges, attendance status)
- ✅ ProductCard (price, stock, preorder badges)
- ✅ StallMap (interactive SVG with hover cards)
- ✅ Modal (accessible, focus management)
- ✅ Toast/Notifications
- ✅ Footer

## Next Steps

1. Install dependencies: `npm install`
2. Set up Supabase project and run `supabase/schema.sql` + `supabase/functions.sql`
3. Configure environment variables (see `.env.example`)
4. Connect pages to Supabase (replace mock data with queries)
5. Add authentication flow
6. Implement cart & checkout modals
7. Add image upload for vendors/products

## Security Notes

- Service role key should NEVER be exposed to client-side code
- All sensitive operations use server-side API routes
- RLS policies enforce data access rules
- Use environment variables for all secrets

## License

Private project

