#!/usr/bin/env bash
# deploy.sh — build the Next.js SPA and sync to S3 + invalidate CloudFront
# Usage: ./infra/deploy.sh [--env prod|dev]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="$REPO_ROOT/medical-appointments"
TF_DIR="$SCRIPT_DIR/terraform/phase1"
ENV="${1:---env}"
ENV="${2:-prod}"

echo "==> Building Next.js static export (env: $ENV)"
cd "$FRONTEND_DIR"
npm ci --silent
npm run build

echo "==> Reading Terraform outputs"
cd "$TF_DIR"
BUCKET=$(terraform output -raw s3_bucket_name)
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
SITE_URL=$(terraform output -raw site_url)

echo "==> Syncing to s3://$BUCKET"
cd "$FRONTEND_DIR"
# --delete removes files in S3 that no longer exist locally
# Cache-Control: immutable for hashed Next.js assets, no-cache for index.html
aws s3 sync out/ "s3://$BUCKET" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html"

aws s3 sync out/ "s3://$BUCKET" \
  --delete \
  --cache-control "no-cache, no-store, must-revalidate" \
  --include "*.html"

echo "==> Invalidating CloudFront distribution $DISTRIBUTION_ID"
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query "Invalidation.Id" \
  --output text

echo ""
echo "Deploy complete."
echo "Site URL: $SITE_URL"
