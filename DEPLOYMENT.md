# RiseRoll Deployment Guide

Simple guide for deploying RiseRoll PWA on VPS or locally.

## 🚀 Quick Deploy

### Option 1: Create Release Package (Recommended)
```bash
# Create a release package
npm run release

# This creates:
# - dist/ folder with built files
# - riseroll-v1.0.0.tar.gz (deployment package)
# - riseroll-v1.0.0-DEPLOYMENT.txt (instructions)
```

### Option 2: Build Only
```bash
# Just build the application
npm run build

# This creates a dist/ folder with all production files
```

### Deploy the Files
Upload the `dist/` folder contents (or extract the tar.gz) to your web server.

## 🖥️ VPS Deployment

### Apache Server
1. **Upload Files**: Upload `dist/` contents to your web root (e.g., `/var/www/html/`)
2. **Configuration**: The included `.htaccess` file handles everything:
   - SPA routing
   - Security headers
   - PWA headers
   - Caching rules
   - Compression

### Nginx Server
1. **Upload Files**: Upload `dist/` contents to your web directory
2. **Add Configuration**: Add this to your nginx server block:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # PWA headers
    location /sw.js {
        add_header Cache-Control "public, max-age=0";
        add_header Service-Worker-Allowed "/";
    }

    location /manifest.webmanifest {
        add_header Content-Type "application/manifest+json";
        add_header Cache-Control "public, max-age=86400";
    }

    # Static assets
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000";
    }

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

3. **Restart Nginx**: `sudo systemctl restart nginx`

## 🏠 Local Deployment

### Using Python (Simple)
```bash
# Navigate to dist folder
cd dist

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Access at http://localhost:8000
```

### Using Node.js
```bash
# Install serve globally
npm install -g serve

# Serve the dist folder
serve -s dist -l 3000

# Access at http://localhost:3000
```

### Using PHP
```bash
# Navigate to dist folder
cd dist

# Start PHP server
php -S localhost:8000

# Access at http://localhost:8000
```

## 📦 Release Management

### Creating a New Release
```bash
# 1. Update version in package.json
npm version patch  # for bug fixes (1.0.0 -> 1.0.1)
npm version minor  # for new features (1.0.0 -> 1.1.0)
npm version major  # for breaking changes (1.0.0 -> 2.0.0)

# 2. Create release package
npm run release

# 3. Deploy the new package
```

### Version History
- **v1.0.0**: Initial release with core PWA functionality
- Future versions will be tracked in package.json and git tags

## 🔧 PWA Requirements

### HTTPS Required
PWAs require HTTPS in production. You'll need to configure SSL certificate on your VPS or hosting provider.