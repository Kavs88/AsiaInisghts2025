# Admin Panel Setup Guide

## Overview

The admin panel allows super users to manage vendors, products, orders, and view platform statistics.

## Step 1: Make Yourself an Admin

1. **Sign up or sign in** to your account on the platform
2. **Go to Supabase Dashboard** → SQL Editor
3. **Run this SQL query** (replace with your email):

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

4. **Verify** you're an admin:

```sql
SELECT id, email, full_name, role
FROM public.users
WHERE role = 'admin';
```

## Step 2: Access Admin Panel

Once you're an admin:

1. **Sign in** to your account
2. **Look for "Admin" link** in the navigation bar (only visible to admins)
3. **Click "Admin"** to go to `/admin`

Or navigate directly to: `http://localhost:3000/admin`

## Admin Features

### Dashboard (`/admin`)
- **Statistics**: View total vendors, products, orders, and users
- **Quick Actions**: Links to manage vendors, products, and orders

### Manage Vendors (`/admin/vendors`)
- View all vendors in a table
- See vendor status (Active/Inactive, Verified)
- View vendor contact information
- Quick links to view/edit vendors

### Manage Products (`/admin/products`)
- View all products in a table
- See product details (price, stock, vendor)
- View product status (Available/Unavailable)
- Quick links to view/edit products

### View Orders (`/admin/orders`)
- View all orders
- Order details and status

## Security

- **Admin-only access**: All admin pages check if the user has `role = 'admin'`
- **Automatic redirect**: Non-admin users are redirected to homepage
- **Server-side checks**: Admin checks happen on the server for security

## Files Created

1. **`lib/auth/admin.ts`** - Admin authentication utilities
2. **`app/admin/page.tsx`** - Admin dashboard
3. **`app/admin/vendors/page.tsx`** - Vendor management
4. **`app/admin/products/page.tsx`** - Product management
5. **`components/ui/AdminLink.tsx`** - Admin link in header (only shows for admins)
6. **`supabase/make_admin.sql`** - SQL script to make a user admin

## Next Steps (Future Enhancements)

- [ ] Edit vendor/product forms
- [ ] Create new vendors/products from admin panel
- [ ] Delete vendors/products
- [ ] Bulk operations
- [ ] User management
- [ ] Market day management
- [ ] Analytics and reports
- [ ] Export data (CSV, JSON)

## Troubleshooting

### "Admin" link not showing
- Make sure you've set your role to 'admin' in the database
- Sign out and sign back in
- Check browser console for errors

### Can't access admin pages
- Verify your user has `role = 'admin'` in the `users` table
- Make sure you're signed in
- Check server logs for errors

### SQL update not working
- Make sure the email matches exactly (case-sensitive)
- Check that the user exists in the `users` table
- Verify the user was created in `auth.users` first





