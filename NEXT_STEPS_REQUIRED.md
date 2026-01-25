# Next Steps - Required Actions

## 🔴 Critical: Must Do First

### 1. **Set Up Database Schema** ✅
**Status**: ✅ **COMPLETE!** Schema has been created.

**Next Steps**:
1. Run `supabase/functions.sql` - Database functions (search, stock management, etc.)
   - Open the file, copy all contents
   - Paste into Supabase SQL Editor
   - Click Run

**Optional** (for demo data):
- `supabase/seed_data.sql` - Sample vendors, products, market days

**Why Critical**: ✅ Database tables are now ready!

---

### 2. **Add Service Role Key** ⚠️
**Status**: Missing from `.env.local`

**Action Required**:
1. Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api
2. Scroll to **"service_role"** key (marked as "secret")
3. Click the 👁️ eye icon to reveal
4. Click 📋 copy button
5. Open `.env.local` in your project root
6. Add or update this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=paste-your-key-here
   ```
7. Save the file
8. Restart dev server: `npm run dev`

**Why Critical**: Required for server-side operations, secure API routes, and Edge Functions.

---

### 3. **Test Database Connection** ✅
**Action Required**:
1. After steps 1 & 2, visit: http://localhost:3000/test-connection
2. Verify all checks pass:
   - ✅ Environment variables configured
   - ✅ Database connection successful
   - ✅ Schema appears to be set up

**If errors**: Check that schema SQL ran successfully and service role key is correct.

---

## 🟡 Important: Should Do Next

### 4. **Update Business Contact Information** 📱
**Status**: Using hardcoded defaults

**Action Required**:
1. Open `.env.local`
2. Add these lines (replace with your actual business info):
   ```
   NEXT_PUBLIC_BUSINESS_WHATSAPP=your_whatsapp_number
   NEXT_PUBLIC_BUSINESS_ZALO=your_zalo_number
   NEXT_PUBLIC_BUSINESS_EMAIL=your_business_email
   ```
3. Format for phone numbers: `84386435947` (no +, no spaces)
4. Save and restart dev server

**Where used**: Customer messaging buttons (WhatsApp/Zalo/Email links)

**Current**: Using defaults from another project (`84386435947`)

---

### 5. **Connect Search to Real Data** 🔍
**Status**: Using mock data

**Action Required**:
1. Open `components/ui/SearchBar.tsx`
2. Find line 129: `// TODO: Replace with actual Supabase query`
3. Replace mock search with:
   ```typescript
   import { searchProducts } from '@/lib/supabase/queries'
   
   // In performSearch function:
   const results = await searchProducts(searchQuery, 8)
   ```
4. Also search vendors if needed

**Why Important**: Search currently shows fake results, not real products/vendors.

---

### 6. **Set Up Email Notifications (Resend)** 📧
**Status**: Functions exist but need API key

**Action Required**:
1. Sign up at [resend.com](https://resend.com) (free tier available)
2. Get API key from dashboard
3. Set Supabase secret:
   ```powershell
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   ```
4. Verify domain in Resend dashboard (for production)

**Why Important**: Without this, email notifications won't send (they'll just log).

**Test**: Submit an order intent → vendor should receive email

---

## 🟢 Optional: Can Do Later

### 7. **WhatsApp Business API (Meta)** 📱
**Status**: Stub - client-side links work, server notifications don't

**Action Required** (if you want automated WhatsApp notifications):
1. Create Meta Business Account
2. Create Meta App → Add WhatsApp product
3. Get Access Token and Phone Number ID
4. Set Supabase secrets:
   ```powershell
   supabase secrets set WHATSAPP_ACCESS_TOKEN=your_token
   supabase secrets set WHATSAPP_PHONE_ID=your_phone_id
   ```

**Note**: Client-side WhatsApp links already work! This is only for automated server-side notifications.

---

### 8. **Zalo Official Account API** 💬
**Status**: Stub - client-side links work, server notifications don't

**Action Required** (if you want automated Zalo notifications):
1. Create Zalo Official Account at [developers.zalo.me](https://developers.zalo.me)
2. Get OA ID, Access Token, Secret Key
3. Set Supabase secrets:
   ```powershell
   supabase secrets set ZALO_ACCESS_TOKEN=your_token
   supabase secrets set ZALO_OA_ID=your_oa_id
   ```

**Note**: Client-side Zalo links already work! This is only for automated server-side notifications.

---

## 📋 Quick Checklist

### Do Now (Critical):
- [x] Run `supabase/schema_safe.sql` in Supabase SQL Editor ✅
- [x] Run `supabase/functions.sql` in Supabase SQL Editor ✅
- [x] Run `supabase/seed_data.sql` in Supabase SQL Editor ✅
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (if not done)
- [ ] Test connection at `/test-connection`

### Do Soon (Important):
- [ ] Update business contact info in `.env.local`
- [ ] Connect SearchBar to real Supabase queries
- [ ] Set up Resend API key for emails

### Do Later (Optional):
- [ ] Set up WhatsApp Business API (Meta)
- [ ] Set up Zalo Official Account API

---

## 🎯 Priority Order

1. **Database Schema** (5 minutes) - App won't work without it
2. **Service Role Key** (2 minutes) - Required for server operations
3. **Test Connection** (1 minute) - Verify everything works
4. **Business Contact Info** (2 minutes) - Use your actual numbers
5. **Search Functionality** (10 minutes) - Connect to real data
6. **Email API Key** (5 minutes) - Enable email notifications

**Total Time**: ~25 minutes for critical + important items

---

## 📚 Helpful Files

- `EXTERNAL_INTEGRATIONS_REVIEW.md` - Full details on all integrations
- `SETUP_SUPABASE.md` - Detailed Supabase setup guide
- `WHATSAPP_ZALO_SETUP.md` - WhatsApp/Zalo integration guide
- `FIND_SERVICE_ROLE_KEY.md` - How to find service role key

---

## 🚀 After Setup

Once you complete the critical steps:
1. ✅ Database will have tables
2. ✅ App can store/retrieve data
3. ✅ Server-side operations will work
4. ✅ You can test the full application

The app is **functional** after critical steps, and **production-ready** after important steps.

