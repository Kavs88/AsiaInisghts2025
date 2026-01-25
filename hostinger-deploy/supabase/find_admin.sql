-- Find an admin user to assign orphaned vendors to
SELECT id, email, role FROM auth.users ORDER BY created_at ASC LIMIT 5;
