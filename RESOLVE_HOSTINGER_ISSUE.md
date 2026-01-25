# Resolve Hostinger 403 Error - Step by Step

## The Problem

Your site at `https://plum-dogfish-418157.hostingersite.com` shows **403 Forbidden** because:
- ✅ Files are uploaded correctly
- ❌ Node.js app is **NOT configured** in hPanel
- ❌ Node.js app is **NOT started**
- ❌ Dependencies are **NOT installed**
- ❌ Application is **NOT built**

## The Solution (Follow These Steps)

### ⚠️ CRITICAL: You Must Do This in hPanel

Next.js **requires** a running Node.js process. Just uploading files won't work.

---

## Step-by-Step Resolution

### Step 1: Configure Node.js App (5 minutes)

1. **Login to Hostinger hPanel**
2. **Go to:** Advanced → Node.js
3. **Click:** "Create Node.js App" or "Add Application"
4. **Fill in:**
   - **App Root Directory**: `public_html`
   - **App Startup File**: `package.json`
   - **Node.js Version**: 18.x or 20.x (choose latest)
   - **App Mode**: Production
   - **Port**: (Auto-assigned - **write this down!**)
5. **Click:** "Create" or "Save"

**✅ You should now see your app listed in Node.js panel**

---

### Step 2: Open SSH/Terminal (1 minute)

1. **In hPanel:** Advanced → Terminal (or SSH)
2. **Click:** "Open Terminal" or "Launch SSH"
3. **Wait for connection**

---

### Step 3: Install Dependencies (3-5 minutes)

**In the SSH terminal, type:**
```bash
cd public_html
npm install --production
```

**Wait for it to finish** (you'll see "added X packages")

---

### Step 4: Create Environment File (2 minutes)

**In SSH terminal:**
```bash
cd public_html
cp env.template .env.local
nano .env.local
```

**In the nano editor, add/edit:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://plum-dogfish-418157.hostingersite.com
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

---

### Step 5: Build Application (5-10 minutes)

**In SSH terminal:**
```bash
cd public_html
npm run build
```

**Wait for completion** - you should see:
```
✓ Compiled successfully
✓ Generating static pages
```

---

### Step 6: Start the App (30 seconds)

**Option A: In hPanel (Easiest)**
1. **Go to:** hPanel → Advanced → Node.js
2. **Find your app** in the list
3. **Click:** "Start" button
4. **Status should show:** "Running" ✅

**Option B: In SSH**
```bash
cd public_html
npm start
```

**Option C: Using PM2 (Best for Production)**
```bash
cd public_html
npm install -g pm2
pm2 start npm --name "asia-insights" -- start
pm2 save
```

---

### Step 7: Test Your Site

1. **Visit:** `https://plum-dogfish-418157.hostingersite.com`
2. **Should see:** Your homepage! ✅

---

## Still Getting 403?

### Quick Checks:

1. **Is Node.js app running?**
   - hPanel → Node.js → Status should be "Running"
   - If not, click "Start"

2. **Are dependencies installed?**
   ```bash
   cd public_html
   ls node_modules
   ```
   Should show many folders

3. **Is build complete?**
   ```bash
   cd public_html
   ls .next
   ```
   Should show `.next` folder

4. **Check logs:**
   - hPanel → Node.js → Your App → View Logs
   - Look for error messages

---

## Common Errors & Fixes

### "Cannot find module"
```bash
cd public_html
rm -rf node_modules
npm install --production
```

### "Build failed"
- Check error message in build output
- Verify `.env.local` has correct values
- Check Node.js version (should be 18+)

### "Port already in use"
- Check Node.js settings for assigned port
- Restart the app in hPanel

### Site loads but shows blank/errors
- Check browser console (F12)
- Verify Supabase credentials in `.env.local`
- Check Node.js logs for errors

---

## Success Checklist

- [ ] Node.js app created in hPanel
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with Supabase credentials
- [ ] Application built (`npm run build`)
- [ ] Node.js app started (Status: "Running")
- [ ] Site accessible at: `https://plum-dogfish-418157.hostingersite.com`

---

## Need Help?

If you're stuck:
1. Check **hPanel → Advanced → Error Log**
2. Check **Node.js → View Logs**
3. Verify each step above was completed
4. Share specific error messages for help


