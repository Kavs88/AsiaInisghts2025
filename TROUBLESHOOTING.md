# Troubleshooting Guide

## White Screen / 404 Errors

If you're seeing a white screen or 404 errors for CSS/JS files:

### Quick Fix:
1. **Stop the dev server** (Ctrl+C in terminal)
2. **Clear the build cache**:
   ```bash
   Remove-Item -Recurse -Force .next
   ```
3. **Restart the server**:
   ```bash
   npm run dev
   ```
4. **Hard refresh browser**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Image 404 Errors

If you see `_next/image` 404 errors:
- Image optimization is disabled in `next.config.js` with `unoptimized: true`
- This means images load directly from their source (Unsplash)
- Restart the server after changing `next.config.js`

### Still Not Working?

1. **Check terminal output** for build errors
2. **Check browser console** (F12) for JavaScript errors
3. **Try the simple test page**: `http://localhost:3001/test-simple`
4. **Verify port**: Make sure you're visiting `http://localhost:3001` (not 3000)

## Common Issues

### CSS Not Loading
- Clear `.next` cache and restart
- Check `app/globals.css` exists
- Verify Tailwind is configured in `tailwind.config.js`

### JavaScript Errors
- Check browser console for specific errors
- Verify all imports are correct
- Check for missing dependencies: `npm install`

### Images Not Loading
- Check `next.config.js` has correct `remotePatterns`
- Verify image URLs are accessible
- Try disabling optimization (already done)






