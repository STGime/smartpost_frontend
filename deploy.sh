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

# Step 1: Ensure Playwright browser is available for pre-rendering
log_info "Ensuring Playwright Chromium is installed..."
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium

# Step 2: Build for production (with pre-rendering for SEO)
log_info "Building frontend with pre-rendering..."
npm run build:seo

if [ ! -d "dist" ]; then
    echo "Build failed - dist directory not found"
    exit 1
fi

log_info "Build completed successfully"
log_info "Build size: $(du -sh dist | cut -f1)"

# Step 3: Deploy to GCS
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

# Set no-cache for pre-rendered HTML pages
log_info "Setting cache headers for pre-rendered pages..."
for dir in social-media-scheduler instagram-scheduler tiktok-scheduler auto-post-social-media social-media-tools cli-social-media-posting agents mcp-social-media-server n8n-social-media-node agentic-social-media-workflows autonomous-social-media-bot bluesky-scheduler threads-scheduler buffer-alternative hootsuite-alternative compare developers terms privacy impressum; do
    if [ -f "dist/$dir/index.html" ]; then
        gsutil setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" \
            "gs://$GCS_BUCKET/$dir/index.html" 2>/dev/null || true
    fi
done

# Blog + Workflows: index + every pre-rendered slug (slugs are dynamic, so glob them).
for f in dist/blog/index.html dist/blog/*/index.html dist/workflows/index.html dist/workflows/*/index.html; do
    if [ -f "$f" ]; then
        rel="${f#dist/}"
        gsutil setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" \
            "gs://$GCS_BUCKET/$rel" 2>/dev/null || true
    fi
done

# Set headers for llms.txt / llms-full.txt (LLM crawler hints).
# Markdown content-type so LLM tooling parses them, short cache so updates surface fast.
log_info "Setting headers for llms.txt and llms-full.txt..."
for f in llms.txt llms-full.txt; do
    if [ -f "dist/$f" ]; then
        gsutil setmeta -h "Content-Type:text/markdown; charset=utf-8" \
            -h "Cache-Control:public, max-age=3600" \
            "gs://$GCS_BUCKET/$f" 2>/dev/null || true
    fi
done

# Blog RSS feed (polled by automation/workflow tools — short cache for freshness).
if [ -f "dist/feed.xml" ]; then
    gsutil setmeta -h "Content-Type:application/rss+xml; charset=utf-8" \
        -h "Cache-Control:public, max-age=3600" \
        "gs://$GCS_BUCKET/feed.xml" 2>/dev/null || true
fi

# Refresh openapi.yaml from the live backend before serving it, then set headers.
# The in-tree public/openapi.yaml acts as the fallback: Vite copies public/ → dist/
# at build time, and the prior `gsutil rsync` step above already uploaded
# dist/openapi.yaml (the in-tree copy) to GCS. If the curl below fails, the bucket
# still has that fallback snapshot — do NOT reorder this block above the rsync,
# or the "fallback to in-tree copy" message becomes a lie.
# Content-Type per RFC 9512 (2023): application/yaml.
log_info "Refreshing openapi.yaml from live backend..."
if curl -sf https://api.getposta.app/docs/openapi.yaml -o dist/openapi.yaml; then
    log_info "openapi.yaml refreshed ($(wc -l < dist/openapi.yaml) lines)"
    gsutil cp dist/openapi.yaml "gs://$GCS_BUCKET/openapi.yaml"
else
    log_warn "Could not fetch live openapi.yaml; falling back to in-tree copy from public/ (already in GCS via prior rsync)"
fi
gsutil setmeta -h "Content-Type:application/yaml; charset=utf-8" \
    -h "Cache-Control:public, max-age=3600" \
    "gs://$GCS_BUCKET/openapi.yaml" 2>/dev/null || true

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
