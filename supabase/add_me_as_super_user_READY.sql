INSERT INTO public.super_users (uid, email, full_name, notes, created_by)
SELECT 
    u.id as uid,
    u.email,
    COALESCE(pu.full_name, u.email) as full_name,
    'Site owner - full access' as notes,
    u.id as created_by
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.email = 'sam@kavsulting.com'
ON CONFLICT (uid) DO UPDATE
SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    notes = EXCLUDED.notes,
    updated_at = NOW()
RETURNING 
    uid,
    email,
    full_name,
    notes,
    created_at,
    'Successfully added as super user!' as status;


