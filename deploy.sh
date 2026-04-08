#!/bin/bash
# KD Lithium - Deploy to EC2 (build locally, deploy artifacts)
# Run from project root: ./deploy.sh

set -e

EC2_HOST="ubuntu@65.0.185.143"
EC2_PATH="/home/ubuntu/Kalikadev"
SSH_KEY="/Users/ayushdixit/Documents/dev-outreach-key.pem"

echo "=== 1. Building locally (uses Webpack, portable to EC2) ==="
npm run build

echo ""
echo "=== 2. Syncing to EC2 (excluding node_modules) ==="
# Exclude huge local-only paths: .next/dev (Turbopack) blows up transfer size and can kill SSH mid-rsync.
RSYNC_SSH="ssh -i $SSH_KEY -o ServerAliveInterval=30 -o ServerAliveCountMax=10 -o TCPKeepAlive=yes"
rsync -avz --delete \
  -e "$RSYNC_SSH" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude '.env.production' \
  --exclude '.next/dev' \
  --exclude '.next/cache/images' \
  --exclude '.cursor' \
  --filter 'P public/uploads' \
  ./ "$EC2_HOST:$EC2_PATH/"

echo ""
echo "=== 3. Installing deps & restarting PM2 on EC2 ==="
ssh -i "$SSH_KEY" "$EC2_HOST" << 'REMOTE'
  cd /home/ubuntu/Kalikadev
  npm install --production
  pm2 restart kalikadev || pm2 start npm --name "kalikadev" -- start
  pm2 save
  echo ""
  pm2 status
  echo ""
  echo "App: http://localhost:3000 (from EC2) | https://kdlithium.in"
REMOTE

echo ""
echo "=== Deploy complete ==="
