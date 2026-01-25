# Hostinger Deployment Guide

## Prerequisites

1. **Node.js Version**: Hostinger requires Node.js 18.x or higher
2. **Build Tools**: Ensure you have access to SSH or File Manager
3. **Environment Variables**: Prepare your Supabase credentials

## Deployment Steps

### Step 1: Prepare Files for Upload

The deployment package includes:
- All source code (app/, components/, lib/, actions/, etc.)
- `package.json` and `package-lock.json`
- `next.config.js`
- `public/` folder
- Configuration files (tsconfig.json, tailwind.config.js, etc.)
- `.htaccess` (for Apache servers)

**Excluded files:**
- `node_modules/` (will be installed on server)
- `.next/` (will be built on server)
- `.env.local` (create on server)
- Development files and documentation

### Step 2: Upload to Hostinger

1. **Via File Manager:**
   - Log into Hostinger hPanel
   - Navigate to File Manager
   - Upload the deployment package to your domain's `public_html` folder
   - Extract the files if uploaded as ZIP

2. **Via FTP/SFTP:**
   - Use FileZilla or similar FTP client
   - Connect to your Hostinger server
   - Upload files to `public_html` or your Node.js app directory

### Step 3: Install Dependencies

**Via SSH:**
```bash
cd /home/your-username/domains/plum-dogfish-418157.hostingersite.com/public_html
npm install --production
```

**Via Hostinger Terminal:**
- Open Terminal in hPanel
- Navigate to your project directory
- Run: `npm install --production`

### Step 4: Build the Application

```bash
npm run build
```

This creates the `.next` folder with optimized production files.

### Step 5: Set Environment Variables

Create a `.env.local` file in your project root (use `env.template` as reference):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Never commit `.env.local` to version control.

### Step 6: Configure Node.js App in Hostinger

1. **In hPanel:**
   - Go to "Advanced" → "Node.js"
   - Select your domain
   - Set:
     - **App Root Directory**: `/public_html` (or your app folder)
     - **App Startup File**: `server.js` (for standalone mode) or `package.json` (for npm start)
     - **Node.js Version**: 18.x or higher
     - **App Mode**: Production

2. **For Standalone Mode:**
   - The build creates a `.next/standalone` folder
   - Point your Node.js app to: `.next/standalone/server.js`

### Step 7: Start the Application

**Option A: Using npm start (Recommended)**
```bash
npm start
```

**Option B: Using PM2 (if available)**
```bash
pm2 start npm --name "sunday-market" -- start
pm2 save
pm2 startup
```

### Step 8: Configure Domain & Port

- **Port**: Hostinger typically assigns a port (check in Node.js settings)
- **Domain**: Your domain should point to the Node.js app
- **SSL**: Enable SSL certificate in hPanel

## File Structure on Server

```
public_html/
├── .next/              # Build output (created after npm run build)
├── .next/standalone/  # Standalone server (if using standalone mode)
├── app/               # Next.js app directory
├── components/        # React components
├── lib/               # Utility libraries
├── actions/           # Server actions
├── public/            # Static assets
├── package.json       # Dependencies
├── next.config.js     # Next.js configuration
├── .env.local         # Environment variables (create on server)
└── server.js          # Entry point (if using standalone)
```

## Troubleshooting

### Issue: "Cannot find module"
**Solution:** Run `npm install` again, ensure all dependencies are in `package.json`

### Issue: "Port already in use"
**Solution:** Check Hostinger Node.js settings, use the assigned port

### Issue: "Build fails"
**Solution:** 
- Check Node.js version (should be 18+)
- Ensure all environment variables are set
- Check build logs for specific errors

### Issue: "404 errors on routes"
**Solution:** 
- Ensure `.htaccess` is configured correctly
- Check Next.js routing configuration
- Verify `next.config.js` redirects are correct

### Issue: "Supabase connection errors"
**Solution:**
- Verify environment variables in `.env.local`
- Check Supabase project settings
- Ensure RLS policies allow public access where needed

## Performance Optimization

1. **Enable Caching:**
   - Static assets are automatically cached
   - Configure CDN if available

2. **Image Optimization:**
   - Next.js Image component handles optimization
   - Ensure `sharp` is installed: `npm install sharp`

3. **Database Connection:**
   - Use connection pooling
   - Monitor query performance

## Security Checklist

- [ ] Environment variables are set (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] SSL certificate is enabled
- [ ] RLS policies are configured in Supabase
- [ ] API keys are restricted in Supabase
- [ ] Error pages don't expose sensitive info

## Support

For Hostinger-specific issues:
- Hostinger Support: https://www.hostinger.com/contact
- Hostinger Docs: https://support.hostinger.com/

For application issues:
- Check console logs
- Review Next.js build output
- Check Supabase logs

## Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] All routes are accessible
- [ ] Images load correctly
- [ ] Database connections work
- [ ] Authentication flows work
- [ ] Forms submit successfully
- [ ] Mobile responsiveness verified
- [ ] SSL certificate active
- [ ] Performance is acceptable

