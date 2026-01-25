# Supabase CLI - Practical Usage Guide

A quick reference guide for using Supabase CLI with your Sunday Market project.

---

## 🚀 Getting Started (First Time Setup)

### 1. Login to Supabase
```bash
supabase login
```
- Opens your browser to authenticate
- Saves your access token locally
- Only needed once (or when token expires)

### 2. Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF_ID
```

**To find your Project Reference ID:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **General**
4. Copy the **Reference ID** (looks like: `abcdefghijklmnop`)

**Example:**
```bash
supabase link --project-ref abcdefghijklmnop
```

---

## 📦 Edge Functions (Your Notification Functions)

You have 4 Edge Functions in your project:
- `send-customer-email`
- `send-vendor-email`
- `send-vendor-whatsapp`
- `send-vendor-zalo`

### Deploy a Function
```bash
supabase functions deploy send-customer-email
supabase functions deploy send-vendor-email
supabase functions deploy send-vendor-whatsapp
supabase functions deploy send-vendor-zalo
```

### Deploy All Functions at Once
```bash
supabase functions deploy
```

### List All Deployed Functions
```bash
supabase functions list
```

### View Function Logs
```bash
# View logs for a specific function
supabase functions logs send-customer-email

# Follow logs in real-time
supabase functions logs send-customer-email --follow

# View logs from last hour
supabase functions logs send-customer-email --since 1h
```

### Delete a Function
```bash
supabase functions delete send-customer-email
```

---

## 🔐 Secrets (Environment Variables)

Your functions need API keys stored as secrets.

### Set a Secret
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
supabase secrets set WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
supabase secrets set WHATSAPP_PHONE_ID=your_phone_id
supabase secrets set ZALO_API_KEY=your_zalo_key
```

### List All Secrets
```bash
supabase secrets list
```

### Remove a Secret
```bash
supabase secrets unset RESEND_API_KEY
```

### Set Multiple Secrets at Once
```bash
supabase secrets set RESEND_API_KEY=key1 WHATSAPP_ACCESS_TOKEN=key2 WHATSAPP_PHONE_ID=key3 ZALO_ACCESS_TOKEN=key4
```

---

## 🗄️ Database Migrations

### Create a New Migration
```bash
supabase migration new migration_name
```
Creates a new file in `supabase/migrations/` with timestamp.

### Apply Migrations to Remote Database
```bash
supabase db push
```
Pushes all pending migrations to your linked project.

### Reset Database (⚠️ Destructive)
```bash
supabase db reset
```
Drops all tables and re-runs all migrations.

### View Migration History
```bash
supabase migration list
```

---

## 📊 Project Management

### Check Project Status
```bash
supabase status
```
Shows connection info, linked project, and local services status.

### View Project Info
```bash
supabase projects list
```

### Unlink Project
```bash
supabase unlink
```

### Logout
```bash
supabase logout
```

---

## 🧪 Local Development (Optional)

### Start Local Supabase
```bash
supabase start
```
Starts local Docker containers for development.

### Stop Local Supabase
```bash
supabase stop
```

### Check Local Status
```bash
supabase status
```

---

## 📝 Common Workflows

### Workflow 1: Deploy All Edge Functions
```bash
# 1. Make sure you're logged in and linked
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 2. Deploy all functions
supabase functions deploy

# 3. Set secrets
supabase secrets set RESEND_API_KEY=your_key

# 4. Verify deployment
supabase functions list
```

### Workflow 2: Update a Function
```bash
# 1. Edit the function code in supabase/functions/function-name/index.ts
# 2. Deploy the updated function
supabase functions deploy function-name

# 3. Check logs to verify it's working
supabase functions logs function-name --follow
```

### Workflow 3: Apply Database Changes
```bash
# 1. Create a new migration
supabase migration new add_new_table

# 2. Edit the migration file in supabase/migrations/
# 3. Push to remote database
supabase db push

# 4. Verify changes in Supabase Dashboard
```

### Workflow 4: Debug a Function
```bash
# 1. View recent logs
supabase functions logs send-customer-email --since 1h

# 2. Follow logs in real-time
supabase functions logs send-customer-email --follow

# 3. Test the function endpoint
# (Use your API client or the Supabase Dashboard)
```

---

## 🆘 Troubleshooting

### "Not logged in" Error
```bash
supabase login
```

### "Project not linked" Error
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### "Function not found" Error
- Make sure you're in the project root directory
- Check that the function folder exists in `supabase/functions/`

### Check if CLI is working
```bash
supabase --version
supabase status
```

### Get Help for Any Command
```bash
supabase [command] --help
# Example:
supabase functions deploy --help
supabase secrets set --help
```

---

## 📚 Quick Reference

| Task | Command |
|------|---------|
| Login | `supabase login` |
| Link project | `supabase link --project-ref REF_ID` |
| Deploy function | `supabase functions deploy function-name` |
| Deploy all functions | `supabase functions deploy` |
| List functions | `supabase functions list` |
| View logs | `supabase functions logs function-name` |
| Set secret | `supabase secrets set KEY=value` |
| List secrets | `supabase secrets list` |
| Create migration | `supabase migration new name` |
| Push migrations | `supabase db push` |
| Check status | `supabase status` |

---

## 🎯 Next Steps for Your Project

Based on your project structure, here's what you might want to do:

1. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy
   ```

2. **Set API Keys:**
   ```bash
   supabase secrets set RESEND_API_KEY=your_key
   # Add other API keys as needed
   ```

3. **Verify Everything Works:**
   ```bash
   supabase functions list
   supabase status
   ```

---

## 💡 Tips

- Always run commands from your project root directory
- Use `--help` flag to see options for any command
- Logs are helpful for debugging: `supabase functions logs function-name`
- Secrets are encrypted and only accessible to your Edge Functions
- Migrations are version-controlled and can be rolled back

---

## 🔗 Resources

- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
- [Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

