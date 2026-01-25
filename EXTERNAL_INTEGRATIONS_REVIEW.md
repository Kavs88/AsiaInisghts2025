# External Integrations & Outside Input Review

## 🔍 What Needs External Setup/Configuration

### ✅ Already Configured
- ✅ Supabase connection (URL + Anon Key)
- ✅ Email notifications (Resend API - configured)
- ✅ Client-side messaging (WhatsApp/Zalo/Email links - working)

---

## 🔴 Critical: Required for Production

### 1. **Supabase Service Role Key** ⚠️
**Status**: Needs to be added to `.env.local`

**What it is**: Secret key for server-side operations that bypass RLS

**Where to get it**:
1. Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api
2. Find "service_role" key (marked as "secret")
3. Click eye icon to reveal
4. Copy and add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-actual-key-here
   ```

**Why needed**: Required for:
- Server-side API routes
- Admin operations
- Secure order processing
- Edge function authentication

**Priority**: 🔴 **CRITICAL** - App won't work fully without it

---

### 2. **Database Schema Setup** ⚠️
**Status**: SQL files exist but need to be run in Supabase

**Files to run**:
- `supabase/schema.sql` - Main database schema
- `supabase/functions.sql` - Database functions
- `supabase/seed_data.sql` - Optional demo data

**How to run**:
1. Go to Supabase SQL Editor
2. Copy contents of each file
3. Paste and click "Run"

**Priority**: 🔴 **CRITICAL** - Database tables don't exist yet

---

### 3. **Business Contact Information** 📱
**Status**: Using defaults, should be configured

**Environment Variables Needed**:
```env
NEXT_PUBLIC_BUSINESS_WHATSAPP=84386435947
NEXT_PUBLIC_BUSINESS_ZALO=84386435947
NEXT_PUBLIC_BUSINESS_EMAIL=info@sundaymarket.com
```

**Current**: Using hardcoded defaults from another project

**Where used**: 
- `components/ui/OrderMessagingOptions.tsx` - Customer messaging buttons

**Priority**: 🟡 **MEDIUM** - Should use your actual business numbers

---

## 🟡 Optional: Enhanced Features

### 4. **Search Functionality** 🔍
**Status**: Using mock data, needs Supabase connection

**Current**: `components/ui/SearchBar.tsx` uses `MOCK_SEARCH_RESULTS`

**What needs to be done**:
- Connect to `searchProducts()` function in `lib/supabase/queries.ts`
- Implement full-text search in database
- Add search RPC function to Supabase

**Files**:
- `components/ui/SearchBar.tsx` - Line 129: `// TODO: Replace with actual Supabase query`

**Priority**: 🟡 **MEDIUM** - Search currently shows mock results

---

### 5. **WhatsApp Business API (Server-side)** 📱
**Status**: Stub implementation, needs API credentials

**Current**: Client-side links work, but server-side notifications are stubs

**What's needed**:
- **Meta WhatsApp Business API**
  - Access Token
  - Phone Number ID

**Files**:
- `supabase/functions/send-vendor-whatsapp/index.ts` - Needs credentials
- `lib/notifications/vendor-notifications.ts` - Stub implementation

**Setup Guide**: See `WHATSAPP_ZALO_SETUP.md`

**Priority**: 🟢 **LOW** - Client-side messaging works, this is for automated notifications

---

### 6. **Zalo Official Account API** 💬
**Status**: Stub implementation, needs API credentials

**Current**: Client-side links work, but server-side notifications are stubs

**What's needed**:
- Zalo Official Account
- Access Token
- OA ID
- Secret Key

**Files**:
- `supabase/functions/send-vendor-zalo/index.ts` - Needs credentials
- `lib/notifications/vendor-notifications.ts` - Stub implementation

**Setup Guide**: See `WHATSAPP_ZALO_SETUP.md`

**Priority**: 🟢 **LOW** - Client-side messaging works, this is for automated notifications

---

## 🟢 Nice to Have: Future Enhancements

### 7. **Payment Integration** 💳
**Status**: Not implemented

**Options**:
- Stripe
- PayPal
- VNPay (for Vietnam)
- Other payment gateways

**Priority**: 🟢 **FUTURE** - Not needed for MVP

---

### 8. **Image Upload/Storage** 📸
**Status**: Not implemented

**Current**: Images are URLs (from Supabase storage or external)

**What's needed**:
- Supabase Storage bucket setup
- Image upload component
- Image optimization pipeline

**Priority**: 🟢 **FUTURE** - Can use external URLs for now

---

### 9. **Analytics** 📊
**Status**: Not implemented

**Options**:
- Google Analytics
- Plausible
- Custom analytics

**Priority**: 🟢 **FUTURE** - Not needed for MVP

---

### 10. **Email Service (Resend API)** 📧
**Status**: ⚠️ Needs API key in Supabase secrets

**Current**: Email functions exist but need `RESEND_API_KEY` secret

**What's needed**:
1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Set as Supabase secret:
   ```powershell
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   ```
4. Verify domain in Resend dashboard (for production)

**Files**:
- `supabase/functions/send-vendor-email/index.ts` - Uses `RESEND_API_KEY`
- `supabase/functions/send-customer-email/index.ts` - Uses `RESEND_API_KEY`

**Current behavior**: Without API key, emails are logged but not sent

**Priority**: 🟡 **MEDIUM** - Email notifications won't work without it

---

## 📋 Quick Checklist

### Must Do (Critical):
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] Run `supabase/functions.sql` in Supabase SQL Editor
- [ ] Test database connection at `/test-connection`

### Should Do (Important):
- [ ] Update business contact info in `.env.local`:
  - `NEXT_PUBLIC_BUSINESS_WHATSAPP`
  - `NEXT_PUBLIC_BUSINESS_ZALO`
  - `NEXT_PUBLIC_BUSINESS_EMAIL`
- [ ] Connect SearchBar to real Supabase queries
- [ ] Set up Resend API key:
  - Sign up at resend.com
  - Get API key
  - Set Supabase secret: `supabase secrets set RESEND_API_KEY=re_...`

### Nice to Have (Optional):
- [ ] Set up WhatsApp Business API (Meta)
- [ ] Set up Zalo Official Account API
- [ ] Add payment integration
- [ ] Set up image upload/storage
- [ ] Add analytics tracking

---

## 🔗 Resources & Documentation

### Setup Guides:
- `WHATSAPP_ZALO_SETUP.md` - WhatsApp & Zalo integration
- `SETUP_SUPABASE.md` - Supabase setup instructions
- `ENV_SETUP.md` - Environment variables guide
- `FIND_SERVICE_ROLE_KEY.md` - How to find service role key

### Current Status Files:
- `IMPLEMENTATION_STATUS.md` - Overall implementation status
- `PERFORMANCE_OPTIMIZATION_REPORT.md` - Performance improvements

---

## 🎯 Summary

### Critical (Do First):
1. ✅ Supabase Service Role Key
2. ✅ Database Schema Setup
3. ✅ Business Contact Info

### Important (Do Soon):
4. ✅ Search Functionality
5. ✅ Email Service Verification

### Optional (Can Wait):
6. ✅ WhatsApp Business API
7. ✅ Zalo Official Account API
8. ✅ Payment Integration
9. ✅ Image Upload
10. ✅ Analytics

---

## 💡 Next Steps

1. **Immediate**: Add service role key and run database schema
2. **Short-term**: Update business contact info and connect search
3. **Long-term**: Add optional integrations as needed

The app is functional for basic use, but needs the critical items above for full production readiness.

