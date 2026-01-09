#!/bin/bash
set -e

echo "============================================"
echo "  Posta Frontend Deployment"
echo "============================================"

# Configuration
GCS_BUCKET="getposta.app"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Ensure we're in the frontend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Step 1: Build for production
log_info "Building frontend..."
npm run build

if [ ! -d "dist" ]; then
    echo "Build failed - dist directory not found"
    exit 1
fi

log_info "Build completed successfully"
log_info "Build size: $(du -sh dist | cut -f1)"

# Step 2: Deploy to GCS
log_info "Deploying to gs://$GCS_BUCKET..."

# Sync files to bucket (delete removed files)
gsutil -m rsync -r -d dist/ gs://$GCS_BUCKET/

# Set cache headers for assets (1 year)
log_info "Setting cache headers for assets..."
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
    "gs://$GCS_BUCKET/assets/**" 2>/dev/null || true

# Set no-cache for index.html (always fetch latest)
gsutil setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" \
    "gs://$GCS_BUCKET/index.html"

echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo ""
echo "  URL: https://www.getposta.app"
echo "  Bucket: gs://$GCS_BUCKET"
echo "  Time: $TIMESTAMP"
echo ""
echo "============================================"
