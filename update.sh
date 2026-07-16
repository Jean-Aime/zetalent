#!/bin/bash
# ============================================================
# ZeTalent — Update/Redeploy Script
# Run on VPS after pushing new code to GitHub
# Usage: bash update.sh
# ============================================================

set -e
cd /var/www/zetalent

echo "Pulling latest code..."
git pull origin main

echo "Installing backend dependencies..."
cd backend && npm install --production && cd ..

echo "Restarting backend..."
pm2 restart zetalent-api

echo "Deploying frontend..."
cp -r frontend/dist/* /var/www/zetalent/frontend_dist/

echo "Reloading Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "✅ Update complete!"
pm2 status
