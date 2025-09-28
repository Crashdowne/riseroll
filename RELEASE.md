# RiseRoll Release Process

Simple release management for RiseRoll PWA.

## 🚀 Creating a Release

### Quick Release
```bash
npm run release
```

This will:
1. Build the production app (`npm run build`)
2. Create a deployment package (`riseroll-v1.0.0.tar.gz`)
3. Generate deployment instructions

### Manual Release
```bash
# 1. Build the app
npm run build

# 2. Create package
npm run package

# 3. Deploy the tar.gz file
```

## 📦 Release Package Contents

The `riseroll-v1.0.0.tar.gz` contains:
- `index.html` - Main application
- `manifest.webmanifest` - PWA manifest
- `sw.js` - Service worker
- `assets/` - CSS, JS, images
- All PWA icons and favicons
- `.htaccess` - Apache configuration

## 🚀 Deploying a Release

### VPS Deployment
```bash
# 1. Extract the package
tar -xzf riseroll-v1.0.0.tar.gz

# 2. Upload to web server
scp -r * user@your-server:/var/www/html/

# 3. Set permissions (if needed)
ssh user@your-server "chmod -R 755 /var/www/html/"
```

### Local Testing
```bash
# Extract and serve locally
tar -xzf riseroll-v1.0.0.tar.gz
cd dist
python -m http.server 8000
# Visit http://localhost:8000
```

## 🔄 Version Management

### Update Version
```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)  
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

### Git Tags
```bash
# Create and push git tag
git tag v1.0.0
git push origin v1.0.0
```

## 📋 Release Checklist

- [ ] Code is tested and working
- [ ] Version updated in package.json
- [ ] Build completes without errors
- [ ] Release package created
- [ ] Deployed and tested on server
- [ ] Git tag created and pushed

## 🎯 Current Version

**v1.0.0** - Initial release with:
- ✅ PWA functionality
- ✅ Activity picking with re-rolls
- ✅ Activity management (CRUD)
- ✅ CSV import
- ✅ Dark/light mode
- ✅ Mobile optimizations
- ✅ Offline support
