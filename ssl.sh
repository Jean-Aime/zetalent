#!/bin/bash
# ============================================================
# SSL Setup — Free HTTPS via Let's Encrypt / Certbot
# Run AFTER setup.sh and AFTER DNS is pointing to 209.74.72.59
# ============================================================

echo "Installing Certbot..."
dnf install -y certbot python3-certbot-nginx

echo "Getting SSL certificate for zetalent-media.com..."
certbot --nginx \
  -d zetalent-media.com \
  -d www.zetalent-media.com \
  --non-interactive \
  --agree-tos \
  --email admin@zetalentmedia.com \
  --redirect

echo "Testing auto-renewal..."
certbot renew --dry-run

echo ""
echo "========================================"
echo " SSL is active!"
echo " Site: https://zetalent-media.com"
echo "========================================"
