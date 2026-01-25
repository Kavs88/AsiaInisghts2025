# Quick Deploy to Hostinger - 5 Minute Guide

## Step 1: Upload Files (2 minutes)

**Option A: Upload ZIP**
1. Go to Hostinger hPanel → File Manager
2. Navigate to `public_html` folder
3. Upload `hostinger-deploy.zip`
4. Extract the ZIP file

**Option B: Upload via FTP**
1. Use FileZilla or similar
2. Connect to your Hostinger server
3. Upload all files from `hostinger-deploy/` folder to `public_html/`

## Step 2: Install Dependencies (1 minute)

**Via SSH/Terminal:**
```bash
cd public_html
npm install --production
```

## Step 3: Build Application (1 minute)

```bash
npm run build
```

## Step 4: Set Environment Variables (1 minute)

Create `.env.local` file in `public_html/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
```

## Step 5: Configure Node.js App

1. In hPanel → Advanced → Node.js
2. Set:
   - **App Root Directory**: `public_html`
   - **App Startup File**: `package.json` (or `.next/standalone/server.js` if using standalone)
   - **Node.js Version**: 18.x or higher
   - **App Mode**: Production
3. Click "Create" or "Update"

## Step 6: Start Application

**Via Terminal:**
```bash
npm start
```

**Or use PM2 (recommended for production):**
```bash
npm install -g pm2
pm2 start npm --name "sunday-market" -- start
pm2 save
```

## Verify Deployment

1. Visit: **https://plum-dogfish-418157.hostingersite.com**
2. Check that pages load correctly
3. **Configure Supabase Redirect URLs** (see SUPABASE_REDIRECT_URLS.md)
4. Test authentication
5. Verify database connections

## Troubleshooting

**"Cannot find module"**
→ Run `npm install` again

**"Port already in use"**
→ Check Hostinger Node.js settings for assigned port

**"404 errors"**
→ Check `.htaccess` file is uploaded and Next.js routing is configured

**"Supabase errors"**
→ Verify `.env.local` has correct credentials

## Full Documentation

See `HOSTINGER_DEPLOYMENT.md` for detailed instructions.

