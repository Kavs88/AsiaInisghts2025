# WhatsApp & Zalo Integration Setup Guide

## Current Status

✅ **Both WhatsApp and Zalo functions are now fully implemented!** They support:
- **WhatsApp**: WhatsApp Business Cloud API (Meta)
- **Zalo**: Zalo Official Account API

You just need to configure the API credentials in Supabase secrets.

---

## 📱 WhatsApp Integration

### WhatsApp Business Cloud API (Meta)

**Setup Steps:**

1. **Create Meta Business Account:**
   - Go to [developers.facebook.com](https://developers.facebook.com)
   - Create a Meta App
   - Add WhatsApp product

2. **Get Access Token:**
   - Generate a temporary access token for testing
   - For production, set up a system user and get permanent token

3. **Get Phone Number ID:**
   - Found in WhatsApp → API Setup

4. **Set Secrets:**
   ```powershell
   supabase secrets set WHATSAPP_ACCESS_TOKEN=your_access_token
   supabase secrets set WHATSAPP_PHONE_ID=your_phone_id
   ```

5. **Deploy Function:**
   ```powershell
   supabase functions deploy send-vendor-whatsapp
   ```
   
   The function will use Meta API when `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_ID` are set.

---

## 💬 Zalo Integration

### Setup Steps:

1. **Create Zalo Official Account:**
   - Go to [developers.zalo.me](https://developers.zalo.me)
   - Sign up for a Zalo Official Account
   - Complete verification process

2. **Get API Credentials:**
   - **OA ID**: Your Official Account ID
   - **Access Token**: Generate from Zalo Developer Console
   - **Secret Key**: Found in app settings

3. **Set Secrets in Supabase:**
   ```powershell
   supabase secrets set ZALO_ACCESS_TOKEN=your_access_token
   supabase secrets set ZALO_OA_ID=your_oa_id
   supabase secrets set ZALO_SECRET_KEY=your_secret_key
   ```

4. **Deploy the Function:**
   ```powershell
   supabase functions deploy send-vendor-zalo
   ```
   
   The function is already fully implemented and ready to use once credentials are set.

---

## 🔧 Deployment Steps

### For WhatsApp:

1. **Set Secrets:**
   ```powershell
   supabase secrets set WHATSAPP_ACCESS_TOKEN=your_access_token
   supabase secrets set WHATSAPP_PHONE_ID=your_phone_id
   ```

2. **Deploy:**
   ```powershell
   supabase functions deploy send-vendor-whatsapp
   ```

### For Zalo:

1. **Set Secrets:**
   ```powershell
   supabase secrets set ZALO_ACCESS_TOKEN=your_access_token
   supabase secrets set ZALO_OA_ID=your_oa_id
   ```

2. **Deploy:**
   ```powershell
   supabase functions deploy send-vendor-zalo
   ```

   The function is ready to use once credentials are configured.

---

## 🧪 Testing

### Test WhatsApp:
```powershell
# View logs
supabase functions logs send-vendor-whatsapp --follow
```

### Test Zalo:
```powershell
# View logs
supabase functions logs send-vendor-zalo --follow
```

---

## 📝 Current Function Status

- ✅ **Email Functions**: Fully working (Resend API configured)
- ✅ **WhatsApp Function**: Fully implemented - supports Meta WhatsApp Business API
- ✅ **Zalo Function**: Fully implemented - ready to use with Zalo Official Account API

---

## 💡 Quick Start Checklist

### WhatsApp (Meta):
- [ ] Create Meta Business Account
- [ ] Create Meta App and add WhatsApp product
- [ ] Get Access Token and Phone Number ID
- [ ] Set secrets: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_ID`
- [ ] Deploy function
- [ ] Test

### Zalo:
- [ ] Create Zalo Official Account
- [ ] Get OA ID and Access Token
- [ ] Set secrets: `ZALO_ACCESS_TOKEN`, `ZALO_OA_ID`, `ZALO_SECRET_KEY`
- [ ] Update function code
- [ ] Deploy function
- [ ] Test

---

## 🔗 Resources

- **Meta WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Zalo Official Account API**: https://developers.zalo.me/docs/api/official-account-api

---

## ⚠️ Important Notes

1. **WhatsApp Business API**: Requires Meta Business Account and app setup. For production, you need WhatsApp Business API approval.

2. **Zalo Verification**: Zalo requires business verification for Official Accounts.

3. **Phone Number Format**: Always use international format (e.g., `+84123456789` for Vietnam).

4. **Rate Limits**: Both services have rate limits. Check their documentation.

5. **Costs**: 
   - Meta WhatsApp: Free for WhatsApp Business API (with limits)
   - Zalo: Free for Official Accounts (with limits)

---

## ✅ Implementation Complete!

Both functions are now fully implemented with:
- ✅ Proper API integrations (Meta WhatsApp Business API, Zalo API)
- ✅ Error handling and validation
- ✅ Detailed logging for debugging
- ✅ Support for all order intent fields (market date, location, notes, etc.)

## 🆘 Need Help?

If you need help:
1. Setting up API credentials with the providers
2. Testing the integrations
3. Troubleshooting issues

Just let me know!

