/**
 * Generate favicon and app icons from brand logo
 * Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available, if not, provide instructions
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp package is required. Install it with: npm install --save-dev sharp');
  process.exit(1);
}

const logoPath = path.join(process.cwd(), 'public', 'images', 'AI MArkets.png');
const appDir = path.join(process.cwd(), 'app');

// Ensure app directory exists
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

// Check if logo exists
if (!fs.existsSync(logoPath)) {
  console.error(`Error: Logo not found at ${logoPath}`);
  process.exit(1);
}

async function generateIcons() {
  console.log('Generating icons from logo...');

  try {
    // Generate app/icon.png (32x32 for favicon, Next.js will use this)
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(appDir, 'icon.png'));

    console.log('✓ Generated app/icon.png (32x32)');

    // Generate app/apple-icon.png (180x180 for Apple devices)
    await sharp(logoPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(appDir, 'apple-icon.png'));

    console.log('✓ Generated app/apple-icon.png (180x180)');

    // Generate app/favicon.ico (16x16 and 32x32 sizes in ICO format)
    // Note: sharp doesn't support ICO directly, so we'll create a 32x32 PNG
    // and Next.js will handle it, or we can create a simple ICO
    // For now, creating a 16x16 version as well
    await sharp(logoPath)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(appDir, 'favicon.ico'));

    console.log('✓ Generated app/favicon.ico (16x16)');

    // Generate additional PWA icons in public directory for manifest.json
    const publicDir = path.join(process.cwd(), 'public');
    
    // 192x192 for Android
    await sharp(logoPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));

    console.log('✓ Generated public/icon-192.png (192x192)');

    // 512x512 for PWA
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));

    console.log('✓ Generated public/icon-512.png (512x512)');

    console.log('\n✅ All icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated icons in the app/ directory');
    console.log('2. The metadata in app/layout.tsx has been updated');
    console.log('3. Restart your dev server to see the changes');

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

