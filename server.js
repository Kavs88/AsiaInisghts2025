// Standalone server entry point for Hostinger
// This file is used when Next.js is built with output: 'standalone'
// The actual server.js will be in .next/standalone/server.js after build

// For development/testing, you can use this file
// In production, use the server.js from .next/standalone/

if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️  This is a placeholder file.')
  console.log('⚠️  After running "npm run build", use: .next/standalone/server.js')
  console.log('⚠️  Or use "npm start" which will use the correct entry point.')
  process.exit(1)
}

// Production: This should not be reached if using standalone mode correctly
// The actual server is in .next/standalone/server.js
console.error('Error: Standalone server not found. Run "npm run build" first.')
process.exit(1)



