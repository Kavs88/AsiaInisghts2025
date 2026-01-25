# Hostinger Build Settings - Final Configuration

## ✅ Current Status

**Good News:** Hostinger has auto-detected Next.js! ✅

## ⚙️ Required Settings

### 1. Framework Preset
- ✅ **Next.js** (auto-detected - correct!)

### 2. Node Version
- **Current:** 18.x
- **Recommendation:** Change to **20.x** (better compatibility with Next.js 14)
- **Action:** Click "Node version" dropdown → Select **20.x**

### 3. Root Directory
- ✅ **./** (correct - root directory)

### 4. Build and Output Settings
- **Current:** "Default for Next.js"
- **Verify these are set:**
  - **Build Command:** `npm run build`
  - **Output Directory:** `.next`
  - **Package Manager:** `npm`
  - **Start Command:** `npm start`

**Action:** Click "Change" to verify/update if needed

### 5. Environment Variables ⚠️ CRITICAL

**Click "Add" and add these EXACT variables:**

```
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
```

```
SUPABASE_SERVICE_ROLE_KEY=sb_secret_PNblE5m4cWt7_AqvxK6dKw_ewS8K_L_
```

```
NODE_ENV=production
```

```
NEXT_PUBLIC_APP_URL=https://darksalmon-horse-629482.hostingersite.com
```

**Important:** 
- Add each variable separately
- Use EXACT values shown above
- For `NEXT_PUBLIC_APP_URL`, use your temporary domain shown: `darksalmon-horse-629482.hostingersite.com`

---

## 📋 Step-by-Step Actions

### Step 1: Change Node Version
1. Click on **"Node version"** dropdown
2. Select **20.x** (instead of 18.x)
3. This ensures better compatibility

### Step 2: Verify Build Settings
1. Click **"Change"** next to "Build and output settings"
2. Verify:
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Package Manager:** `npm`
3. Click **"Save"** or **"OK"**

### Step 3: Add Environment Variables
1. Click **"Add"** button
2. Add each variable one by one:

   **Variable 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://hkssuvamxdnqptyprsom.supabase.co`
   - Click **"Add"**

   **Variable 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk`
   - Click **"Add"**

   **Variable 3:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `sb_secret_PNblE5m4cWt7_AqvxK6dKw_ewS8K_L_`
   - Click **"Add"**

   **Variable 4:**
   - Key: `NODE_ENV`
   - Value: `production`
   - Click **"Add"**

   **Variable 5:**
   - Key: `NEXT_PUBLIC_APP_URL`
   - Value: `https://darksalmon-horse-629482.hostingersite.com`
   - Click **"Add"**

### Step 4: Deploy
1. Review all settings
2. Click **"Deploy"** or **"Save"** button
3. Wait for build to complete (2-5 minutes)
4. Check build logs if there are any errors

---

## ✅ Final Checklist

Before deploying, verify:
- [ ] Node version: **20.x** (changed from 18.x)
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Environment variables: **5 variables added**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NODE_ENV=production`
  - [ ] `NEXT_PUBLIC_APP_URL` (with your temp domain)

---

## 🚨 Important Notes

1. **Environment Variables are CRITICAL** - Your app won't work without them
2. **Node 20.x** is recommended for Next.js 14
3. **Build will take 2-5 minutes** - be patient
4. **Check logs** if build fails for specific error messages

---

## 🎯 After Deployment

Once deployed:
1. Visit: `https://darksalmon-horse-629482.hostingersite.com`
2. Test the application
3. If errors occur, check:
   - Build logs in hPanel
   - Browser console for client errors
   - Environment variables are set correctly

---

**You're almost there! Just add the environment variables and change Node version to 20.x, then deploy!**


