# Hostinger Setup - Step-by-Step Guide (Node.js Web Apps Method)

Follow these steps exactly to deploy your app using Hostinger's newer Node.js Web Apps feature.

## 🚀 Step 1: Access Node.js Web Apps

1. **Login to Hostinger hPanel**
   - Go to: https://hpanel.hostinger.com
   - Login with your credentials

2. **Navigate to Add Website**
   - Click: **"Websites"** in left sidebar
   - Click: **"Add Website"** button

3. **Select Node.js Apps**
   - Choose: **"Node.js Apps"** from the available options

---

## 📦 Step 2: Upload Your Project

1. **Choose Upload Method**
   - Select: **"Upload your website files"**

2. **Upload the Zip File**
   - Click: **"Upload"** or drag & drop
   - Select: `hostinger-deploy-ready.zip`
   - Wait for upload to complete

3. **Files Will Auto-Extract**
   - Hostinger automatically extracts the zip file
   - No manual extraction needed

---

## ⚙️ Step 3: Configure Build Settings

Hostinger will **auto-detect** Next.js and suggest build settings. **Just verify these:**

### Auto-Detected Settings (Should be correct):
- ✅ **Framework Preset**: Next.js
- ✅ **Node Version**: 20.x (or select 18.x, 22.x, 24.x)
- ✅ **Root Directory**: `./`
- ✅ **Build Command**: `npm run build`
- ✅ **Output Directory**: `.next`
- ✅ **Package Manager**: `npm`

**You can edit these if needed, but auto-detection should be correct!**

---

## 🔧 Step 4: Set Environment Variables

1. **Find Environment Variables Section**
   - In the deployment settings page
   - Look for: **"Environment Variables"**

2. **Add Each Variable:**
   Click **"Add"** for each:

   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`  
     **Value**: `https://hkssuvamxdnqptyprsom.supabase.co`

   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     **Value**: `sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk`

   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`  
     **Value**: `sb_secret_PNblE5m4cWt7_AqvxK6dKw_ewS8K_L_`

   - **Key**: `NODE_ENV`  
     **Value**: `production`

   - **Key**: `NEXT_PUBLIC_APP_URL`  
     **Value**: `https://saddlebrown-stinkbug-619379.hostingersite.com`  
     (Update to your actual domain when ready)

3. **Save Environment Variables**
   - Click **"Save"** after adding each variable

---

## 🚀 Step 5: Deploy Your Website

1. **Review Settings**
   - Double-check build settings
   - Verify all environment variables are added

2. **Click Deploy**
   - Click: **"Deploy"** button
   - Hostinger will automatically:
     - Extract your files
     - Run `npm install`
     - Run `npm run build`
     - Start your application

3. **Wait for Deployment**
   - Watch the deployment progress
   - Should see: "Installing dependencies" → "Building" → "Deploying" → "Complete"

4. **Deployment Complete**
   - Your app will be deployed to a temporary subdomain
   - Example: `https://saddlebrown-stinkbug-619379.hostingersite.com`

---

## 🧪 Step 6: Test Your Site

1. **Visit Your Temporary Domain**
   - Use the subdomain provided by Hostinger
   - Or check your website dashboard for the URL

2. **Check Site Loads**
   - Open the URL in your browser
   - Should see your homepage

3. **Verify Functionality**
   - Open browser console (F12)
   - Check for any errors
   - Test key features (navigation, login, etc.)

---

## 📊 Step 7: View Deployment Details

1. **Access Deployment Dashboard**
   - In your website dashboard
   - Click: **"See details"** or **"Deployment Details"**

2. **Check Build Logs**
   - View build logs if deployment failed
   - Check for any errors or warnings

3. **Monitor Status**
   - Deployment status should show "Deployed" or "Running"
   - Check for any alerts or issues

---

## 🆘 Troubleshooting

### If Upload Fails:
- Check file size (should be under limits)
- Verify zip file is not corrupted
- Try re-uploading

### If Build Fails:
- Click **"See details"** to view build logs
- Check for specific error messages
- Verify Node.js version (18.x, 20.x, 22.x, or 24.x)
- Check that all dependencies are in package.json

### If Deployment Fails:
- Check deployment logs
- Verify environment variables are set correctly
- Ensure package.json has `"build"` and `"start"` scripts
- Verify file structure is standard Next.js

### If Site Shows Errors:
- Check browser console (F12) for errors
- Verify all environment variables are set
- Check deployment logs in Hostinger dashboard
- Verify Supabase connection

---

## ✅ Success Checklist

- [ ] Uploaded `hostinger-deploy-ready.zip`
- [ ] Build settings auto-detected (Next.js)
- [ ] All environment variables added
- [ ] Deployment completed successfully
- [ ] Site accessible at temporary domain
- [ ] No errors in browser console
- [ ] Key functionality working

---

## 📝 Important Notes

### What's Different from Old Method:
- ✅ **No manual Node.js app creation** - Auto-handled
- ✅ **No server.js file needed** - Next.js built-in server used
- ✅ **No "main" field needed** - Auto-detection handles it
- ✅ **Automatic build and deploy** - Simpler process
- ✅ **Auto-detection of framework** - Less configuration

### After Deployment:
- Your app is live on a temporary subdomain
- You can connect your custom domain later
- All builds and deployments are tracked in dashboard
- You can redeploy by uploading new files

---

## 📞 Need Help?

**If you get stuck at any step:**

1. **Tell me which step** you're on
2. **Share the exact error message** (if any)
3. **Describe what you see** vs what you expect
4. **Check deployment logs** and share any errors

I'll help you troubleshoot!

---

**Follow these steps and your app will be live on Hostinger!** 🚀
