# File Cleanup Guide - What to Keep vs Remove

## ✅ Essential Files (KEEP)

### Database Setup (Required):
- ✅ `supabase/schema_safe.sql` - Main schema (already run)
- ✅ `supabase/functions.sql` - Database functions (already run)
- ✅ `supabase/seed_data.sql` - Demo data (already run)

### Edge Functions (Required):
- ✅ `supabase/functions/send-vendor-email/index.ts`
- ✅ `supabase/functions/send-customer-email/index.ts`
- ✅ `supabase/functions/send-vendor-whatsapp/index.ts`
- ✅ `supabase/functions/send-vendor-zalo/index.ts`

### Core Application Files:
- ✅ All files in `app/` directory
- ✅ All files in `components/` directory
- ✅ All files in `lib/` directory
- ✅ `next.config.js`, `package.json`, `tsconfig.json`
- ✅ `tailwind.config.js`, `postcss.config.js`

### Essential Documentation (Keep):
- ✅ `README.md` - Main project readme
- ✅ `NEXT_STEPS_REQUIRED.md` - Current action items
- ✅ `EXTERNAL_INTEGRATIONS_REVIEW.md` - Integration status
- ✅ `DATABASE_SETUP_COMPLETE.md` - Setup confirmation

---

## 🗑️ Can Be Removed (Old/Duplicate)

### Old Schema Files (Already Merged):
- ❌ `supabase/schema.sql` - Old version (use `schema_safe.sql` instead)
- ❌ `supabase/migrations.sql` - Old migrations (already in schema_safe.sql)
- ❌ `supabase/order_intents_schema.sql` - Already in schema_safe.sql
- ❌ `supabase/vendor_notifications_migration.sql` - Already in schema_safe.sql
- ❌ `supabase/add_declined_status.sql` - Already in schema_safe.sql
- ❌ `supabase/temporary_public_update_policy.sql` - Temporary fix, already applied
- ❌ `supabase/order_intent_notification_trigger.sql` - Already in schema_safe.sql
- ❌ `supabase/vendor_signup_policies.sql` - Old version
- ❌ `supabase/vendor_signup_policies_fixed.sql` - Old version

### Utility/Verification (Optional):
- ⚠️ `supabase/verify_migrations.sql` - Can remove (verification only)
- ⚠️ `supabase/verify_seed_data.sql` - Can remove (verification only)
- ⚠️ `supabase/analytics_queries.sql` - Keep if you need analytics queries
- ⚠️ `supabase/drop-all-tables.sql` - Keep if you want to reset database

### Duplicate Documentation (Old Guides):
- ❌ `CREATE_ENV_FILE.md` - Duplicate of `ENV_SETUP.md`
- ❌ `COPY_TO_ENV_LOCAL.txt` - Duplicate of `ENV_LOCAL_CONTENT.txt`
- ❌ `ENV_LOCAL_CONTENT.txt` - Duplicate info
- ❌ `FIND_SERVICE_ROLE_KEY.md` - Info in `ENV_SETUP.md`
- ❌ `HOW_TO_FIX_ENV_LOCAL.md` - Info in `ENV_SETUP.md`
- ❌ `HOW_TO_FIX_SCHEMA_ERROR.md` - One-time fix, can archive
- ❌ `QUICK_SETUP.md` - Info in `NEXT_STEPS_REQUIRED.md`
- ❌ `QUICK_START.md` - Info in `NEXT_STEPS_REQUIRED.md`
- ❌ `SETUP_INSTRUCTIONS.txt` - Duplicate
- ❌ `YOUR_SETUP_COMPLETE.md` - Old status file
- ❌ `DATABASE_SETUP_NOW.md` - Old status file
- ❌ `SCHEMA_SETUP_COMPLETE.md` - Old status file
- ❌ `NEXT_STEP_FUNCTIONS.md` - Old status file
- ❌ `YOU_ARE_READY.md` - Old status file
- ❌ `QUICK_VERIFY.md` - Old verification file

### Old Implementation Docs (Can Archive):
- ❌ `STAGE_6_VERIFICATION.md` - Old stage documentation
- ❌ `STAGE_8_IMPLEMENTATION_COMPLETE.md` - Old stage documentation
- ❌ `FULL_CHANGES_SINCE_STAGE_6.md` - Old change log
- ❌ `PROJECT_STATUS_UPDATE.md` - Old status
- ❌ `PROJECT_STATUS_OVERVIEW.md` - Old status
- ❌ `DEPLOYMENT_STAGE_8.md` - Old deployment doc
- ❌ `VENDOR_ACCOUNT_NAVIGATION_FIX.md` - Old fix doc
- ❌ `MESSAGING_FIX.md` - Old fix doc
- ❌ `NAVIGATION_FIX.md` - Old fix doc
- ❌ `NAVIGATION_FIX_REPORT.md` - Old fix doc
- ❌ `FIXES_APPLIED.md` - Old fix doc
- ❌ `FIXES_APPLIED_CONSOLE_ERRORS.md` - Old fix doc
- ❌ `SCHEMA_FIX.md` - Old fix doc
- ❌ `BRANDING_UPDATE.md` - Old update doc

### Keep But Archive (Reference):
- 📦 `CONTINUE_IN_NEW_CHAT.md` - Reference for new sessions
- 📦 `IMPLEMENTATION_GUIDE.md` - Reference documentation
- 📦 `IMPLEMENTATION_STATUS.md` - Reference status
- 📦 `PROJECT_PLAN.md` - Reference planning doc
- 📦 `PROJECT_SUMMARY.md` - Reference summary

---

## 📋 Recommended Action

### Option 1: Keep Essential Only (Recommended)
**Remove ~20-25 files** - Keep only what you need going forward

### Option 2: Archive Old Files
Create an `archive/` folder and move old docs there instead of deleting

### Option 3: Keep Everything
If you want to keep all files for reference, that's fine too (just more clutter)

---

## 🎯 My Recommendation

**Keep these SQL files:**
- ✅ `schema_safe.sql` (main schema)
- ✅ `functions.sql` (functions)
- ✅ `seed_data.sql` (demo data)
- ✅ `drop-all-tables.sql` (useful for reset)
- ⚠️ `analytics_queries.sql` (if you need analytics)

**Remove these SQL files:**
- ❌ All other `.sql` files in supabase/ (old migrations, duplicates)

**Keep these docs:**
- ✅ `README.md`
- ✅ `NEXT_STEPS_REQUIRED.md`
- ✅ `EXTERNAL_INTEGRATIONS_REVIEW.md`
- ✅ `DATABASE_SETUP_COMPLETE.md`
- ✅ `WHATSAPP_ZALO_SETUP.md`
- ✅ `ENV_SETUP.md`
- ✅ `SETUP_SUPABASE.md`

**Remove/Archive:**
- ❌ All other `.md` files in root (old guides, duplicates, status files)

This would reduce from ~36 files to ~10-12 essential files.

---

## 💡 Quick Decision

**If you want a clean project:**
- Remove all old migration SQL files (keep only schema_safe.sql, functions.sql, seed_data.sql)
- Remove duplicate documentation files
- Keep only current/essential docs

**If you want to keep everything:**
- That's fine too - they don't hurt anything, just add clutter

What would you prefer?

