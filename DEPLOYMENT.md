# Deployment Guide

## Prerequisites

- Supabase project set up
- Vercel account (or your preferred hosting)
- Environment variables ready

## Step 1: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run `supabase/schema.sql` first
4. Then run `supabase/functions.sql`
5. Enable Storage for vendor/product images:
   - Go to Storage → Create bucket: `vendor-assets`
   - Set to public or configure signed URLs
   - Create bucket: `product-images`

## Step 2: Environment Variables

Set these in your deployment platform:

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Optional
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=your-analytics-id
```

## Step 3: Deploy to Vercel

### Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

### Using GitHub Integration
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

### Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_key"
  }
}
```

## Step 4: Post-Deployment

### 1. Configure Supabase Auth
- Add your domain to Supabase Auth → URL Configuration
- Set redirect URLs for auth callbacks

### 2. Set Up Storage Policies
```sql
-- Allow public read access to product images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow vendors to upload their own images
CREATE POLICY "Vendor Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vendor-assets' AND
  auth.uid() IN (SELECT user_id FROM vendors)
);
```

### 3. Enable Edge Functions (if using)
- Deploy Supabase Edge Functions for serverless operations
- Configure function URLs in environment variables

## Step 5: Domain & SSL

1. Add custom domain in Vercel
2. Configure DNS records
3. SSL is automatically enabled

## Performance Optimization

### Image Optimization
- Images served via Supabase Storage
- Use Next.js Image component (already configured)
- Enable AVIF format in `next.config.js`

### Caching
- Static pages are automatically cached
- API routes should implement caching headers
- Use Supabase caching for frequently accessed data

### Build Optimization
```bash
npm run build
# Check bundle size
npm run analyze  # (requires @next/bundle-analyzer)
```

## Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- View performance metrics
- Monitor errors

### Supabase Monitoring
- Check Supabase dashboard for:
  - Database performance
  - API usage
  - Storage usage
  - Error logs

## Rollback

If deployment fails:
```bash
vercel rollback
# Or use Vercel dashboard → Deployments → Rollback
```

## Environment-Specific Configs

### Development
- Use local `.env.local`
- Connect to dev Supabase project

### Staging
- Use separate Supabase project
- Test all features before production

### Production
- Use production Supabase project
- Enable all monitoring
- Set up backups

## Security Checklist

- ✅ Environment variables not in code
- ✅ Service role key only on server
- ✅ RLS policies enabled
- ✅ HTTPS enforced
- ✅ CORS configured
- ✅ Rate limiting enabled (add middleware)
- ✅ Input validation on all forms

## Troubleshooting

### Build Errors
- Check Node.js version (18+)
- Verify all dependencies installed
- Check TypeScript errors

### Runtime Errors
- Check Supabase connection
- Verify RLS policies
- Check environment variables

### Performance Issues
- Enable Vercel Analytics
- Check database query performance
- Optimize images
- Use CDN for static assets






