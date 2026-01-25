# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Run the SQL to create all tables, indexes, and policies

## Step 3: Get Your Supabase Keys

1. Go to Project Settings → API
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 4: Create Environment File

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase keys.

## Step 5: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## What's Built So Far

✅ **Complete Database Schema** - All tables with RLS policies  
✅ **Design System** - Tailwind config with tokens  
✅ **Project Structure** - Next.js 14 with TypeScript  
✅ **Basic Layout** - Root layout with accessibility features  

## Next Components to Build

1. Global Header (with navigation, search, cart)
2. VendorCard component
3. ProductCard component
4. Home page with hero section

## Development Workflow

Work in small increments:
1. Build one component at a time
2. Test in isolation
3. Integrate into pages
4. Add functionality incrementally


