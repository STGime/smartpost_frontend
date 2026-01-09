# Posta Frontend Deployment Guide

## Overview

The frontend is a Vue 3 + Vite SPA hosted on Google Cloud Storage with Cloudflare for DNS and CDN.

- **URL**: https://www.getposta.app
- **Hosting**: Google Cloud Storage (static website)
- **CDN/DNS**: Cloudflare
- **Cost**: ~$0.02-0.05/month (storage + egress)

## Architecture

```
                         Internet
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare                              │
│  - DNS: www.getposta.app → GCS bucket                       │
│  - SSL termination                                          │
│  - CDN caching                                              │
│  - DDoS protection                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Cloud Storage                           │
│  Bucket: gs://getposta.app                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  index.html          (no-cache)                      │   │
│  │  assets/*.js         (1 year cache, hashed)          │   │
│  │  assets/*.css        (1 year cache, hashed)          │   │
│  │  assets/*.png        (1 year cache)                  │   │
│  │  favicon.svg                                         │   │
│  │  robots.txt                                          │   │
│  │  sitemap.xml                                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                              │
│  https://api.getposta.app                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Deploy New Version
```bash
cd /Users/stefangimeson/smartpost_frontend
./deploy.sh
```

### Manual Deploy (Step by Step)
```bash
# Build
npm run build

# Upload to GCS
gsutil -m rsync -r -d dist/ gs://getposta.app/

# Set cache headers
gsutil setmeta -h "Cache-Control:no-cache" gs://getposta.app/index.html
```

### View Current Deployment
```bash
gsutil ls -l gs://getposta.app/
```

---

## Deploying New Versions

### Standard Deployment

When you have code changes to deploy:

```bash
cd /Users/stefangimeson/smartpost_frontend

# Run the deploy script
./deploy.sh
```

**What happens:**
1. Vue/TypeScript is compiled (`npm run build`)
2. Vite creates optimized bundles with content hashes
3. Files are synced to GCS bucket (old files removed)
4. Cache headers are set:
   - `index.html`: no-cache (always fetch latest)
   - `assets/*`: 1 year cache (content-hashed filenames)

### Manual Deployment

For more control:

```bash
# 1. Build the frontend
npm run build

# 2. Preview locally (optional)
npm run preview

# 3. Upload to GCS
gsutil -m rsync -r -d dist/ gs://getposta.app/

# 4. Set proper cache headers
gsutil setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" \
    gs://getposta.app/index.html

gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
    "gs://getposta.app/assets/**"
```

---

## Rolling Back

Since Vite uses content-hashed filenames, rolling back requires:

### Option 1: Redeploy from Git

```bash
# Checkout the previous version
git checkout <previous-commit>

# Build and deploy
npm run build
gsutil -m rsync -r -d dist/ gs://getposta.app/
```

### Option 2: Keep Backup Before Deploy

Before deploying, backup current version:

```bash
# Backup current version
gsutil -m cp -r gs://getposta.app gs://getposta.app-backup-$(date +%Y%m%d)

# Deploy new version
./deploy.sh

# If rollback needed:
gsutil -m rsync -r -d gs://getposta.app-backup-YYYYMMDD/ gs://getposta.app/
```

---

## Environment Configuration

### Production Environment

The frontend uses `.env.production` for production builds:

```bash
# .env.production
VITE_API_URL=https://api.getposta.app
VITE_APP_URL=https://www.getposta.app
```

### Build-time Variables

All `VITE_*` environment variables are embedded at build time. To change them:

1. Update `.env.production`
2. Rebuild: `npm run build`
3. Redeploy: `./deploy.sh`

---

## GCS Bucket Configuration

### Bucket Settings

| Setting | Value |
|---------|-------|
| Bucket name | `getposta.app` |
| Location | Multi-region (US) |
| Storage class | Standard |
| Public access | Allowed (for website) |
| Website config | `index.html` as main page |

### CORS Configuration

If you need to update CORS:

```bash
# Create cors.json
cat > cors.json << 'EOF'
[
  {
    "origin": ["https://www.getposta.app", "https://getposta.app"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply CORS config
gsutil cors set cors.json gs://getposta.app
```

---

## Cloudflare Configuration

### DNS Records

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | www | c.storage.googleapis.com | Proxied (orange) |
| CNAME | @ | c.storage.googleapis.com | Proxied (orange) |

### Page Rules (Optional)

For SPA routing, add a page rule:
- URL: `www.getposta.app/*`
- Setting: Cache Level = Bypass (for index.html)

### SSL/TLS

- Mode: Full (strict)
- Always Use HTTPS: On
- Auto Minify: Off (Vite already minifies)

---

## Troubleshooting

### Changes Not Appearing

1. **Clear browser cache** - Hard refresh (Cmd+Shift+R)
2. **Clear Cloudflare cache** - Purge in Cloudflare dashboard
3. **Check index.html headers**:
   ```bash
   gsutil stat gs://getposta.app/index.html | grep Cache-Control
   # Should show: no-cache, no-store, must-revalidate
   ```

### 404 Errors on Routes

The SPA needs all routes to serve `index.html`. This is handled by:
1. Cloudflare Page Rules, OR
2. GCS website configuration

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

### Permission Denied on GCS

```bash
# Check authentication
gcloud auth list

# Re-authenticate if needed
gcloud auth login

# Verify bucket access
gsutil ls gs://getposta.app/
```

---

## Cost Breakdown

| Service | Estimated Cost |
|---------|---------------|
| GCS Storage (~10MB) | ~$0.002/month |
| GCS Egress (via Cloudflare) | ~$0.01-0.05/month |
| Cloudflare | Free tier |
| **Total** | **~$0.02-0.05/month** |

---

## Console Links

- **GCS Bucket**: https://console.cloud.google.com/storage/browser/getposta.app
- **Cloudflare Dashboard**: https://dash.cloudflare.com (getposta.app zone)

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue | 3.x | Frontend framework |
| Vite | 7.x | Build tool |
| TypeScript | 5.x | Type safety |
| Pinia | 2.x | State management |
| Vue Router | 4.x | Routing |
| Tailwind CSS | 3.x | Styling |
