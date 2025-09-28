#!/bin/bash

# RiseRoll Release Script
# Creates a production build and packages it for deployment

set -e

echo "🚀 Creating RiseRoll Release..."

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📦 Version: $VERSION"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -f riseroll-v*.tar.gz

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

# Create release package
echo "📦 Creating release package..."
cd dist
tar -czf "../riseroll-v$VERSION.tar.gz" .
cd ..

# Create deployment instructions
cat > "riseroll-v$VERSION-DEPLOYMENT.txt" << EOF
RiseRoll v$VERSION - Deployment Instructions
==========================================

1. Extract the archive:
   tar -xzf riseroll-v$VERSION.tar.gz

2. Upload all files to your web server root directory

3. For Apache: The .htaccess file is included for SPA routing
4. For Nginx: See DEPLOYMENT.md for nginx configuration

5. Ensure HTTPS is enabled for PWA functionality

Files included:
- index.html (main app)
- manifest.webmanifest (PWA manifest)
- sw.js (service worker)
- assets/ (CSS, JS, images)
- All PWA icons and favicons

For detailed instructions, see DEPLOYMENT.md
EOF

echo "✅ Release created successfully!"
echo "📁 Files created:"
echo "   - riseroll-v$VERSION.tar.gz (deployment package)"
echo "   - riseroll-v$VERSION-DEPLOYMENT.txt (instructions)"
echo ""
echo "🚀 Ready to deploy!"
echo "   Extract and upload to your VPS or serve locally"
