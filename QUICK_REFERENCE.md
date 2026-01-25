# Quick Reference Guide

## 🚀 Supabase CLI Commands

### Authentication & Setup
```powershell
supabase login
supabase link --project-ref hkssuvamxdnqptyprsom
```

### Edge Functions
```powershell
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy send-customer-email

# List functions
supabase functions list

# View logs
supabase functions logs send-customer-email --follow
```

### Secrets Management
```powershell
# Set secret
supabase secrets set RESEND_API_KEY=your_key

# List secrets
supabase secrets list

# Remove secret
supabase secrets unset RESEND_API_KEY
```

### Database
```powershell
# Create migration
supabase migration new migration_name

# Push migrations
supabase db push

# Dump database
supabase db dump -f backup.sql
```

---

## 📱 Current Status

### ✅ Working
- Email notifications (Resend API configured)
- All 4 Edge Functions deployed

### ⚠️ Needs Setup
- WhatsApp notifications (stub - needs Meta WhatsApp Business API)
- Zalo notifications (stub - needs Zalo Official Account API)

---

## 🔑 Project Info

- **Project Reference ID**: `hkssuvamxdnqptyprsom`
- **Supabase URL**: `https://hkssuvamxdnqptyprsom.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom

---

## 📚 Documentation Files

- `CLI_USAGE_GUIDE.md` - Complete CLI usage guide
- `WHATSAPP_ZALO_SETUP.md` - Setup WhatsApp & Zalo
- `BACKUP_GUIDE.md` - Complete backup guide
- `backup.ps1` - Automated backup script

---

## 🔄 Quick Backup

```powershell
# Run backup script
.\backup.ps1
```

---

## 🆘 Common Issues

### "Command not found"
- Restart terminal or run: `$env:PATH = "$env:PATH;C:\Users\admin\scoop\shims"`

### "Project not linked"
- Run: `supabase link --project-ref hkssuvamxdnqptyprsom`

### "Not logged in"
- Run: `supabase login`

---

## 📞 Next Steps

1. **Set up WhatsApp**: See `WHATSAPP_ZALO_SETUP.md`
2. **Set up Zalo**: See `WHATSAPP_ZALO_SETUP.md`
3. **Backup project**: Run `.\backup.ps1`
4. **Test functions**: Check logs with `supabase functions logs`

