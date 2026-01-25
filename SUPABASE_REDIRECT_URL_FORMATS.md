# Supabase Redirect URL Formats

## Try These Formats (in order):

### Format 1: Full URL with path
```
http://localhost:3000/auth/reset-password
```

### Format 2: Just the origin (root)
```
http://localhost:3000
```
Then the `AuthCallbackHandler` will redirect to `/auth/reset-password`

### Format 3: With wildcard (if supported)
```
http://localhost:3000/*
```

### Format 4: Just the path (if it accepts paths)
```
/auth/reset-password
```

## Recommended Approach

**Use Format 2** (just `http://localhost:3000`) because:
1. Supabase definitely accepts root URLs
2. The `AuthCallbackHandler` component will automatically redirect to `/auth/reset-password` when it detects a recovery token
3. This is more flexible for other auth flows too

## Steps:

1. Add: `http://localhost:3000` (just the root, no path)
2. Save
3. Request a new password reset email
4. Click the link - it should work!

The `AuthCallbackHandler` in your app will catch the recovery token and redirect to the reset password page automatically.





