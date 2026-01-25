#!/bin/bash
# Hostinger Deployment Quick Script
# Run this in SSH/Terminal after uploading files

echo "🚀 Starting Hostinger Deployment Setup..."
echo ""

# Navigate to public_html
cd public_html || exit 1

echo "📦 Step 1: Installing dependencies..."
npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Dependency installation failed!"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Step 2: Creating .env.local from template..."
    cp env.template .env.local
    echo "⚠️  IMPORTANT: Edit .env.local with your Supabase credentials!"
    echo "   Run: nano .env.local"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Build the application
echo "🔨 Step 3: Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Check errors above."
    exit 1
fi
echo "✅ Build completed"
echo ""

# Check if .next folder exists
if [ -d ".next" ]; then
    echo "✅ .next folder created successfully"
else
    echo "❌ .next folder not found - build may have failed"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local with your Supabase credentials:"
echo "   nano .env.local"
echo ""
echo "2. Start the Node.js app:"
echo "   Option A: hPanel → Node.js → Click 'Start'"
echo "   Option B: npm start"
echo "   Option C: pm2 start npm --name 'asia-insights' -- start"
echo ""
echo "3. Visit: https://plum-dogfish-418157.hostingersite.com"
echo ""

