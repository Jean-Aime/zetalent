#!/bin/bash
# ============================================================
# ZeTalent VPS Setup Script
# Server: 209.74.72.59  |  OS: AlmaLinux 9
# Domain: zetalent-media.com
# Run as: root
# Usage:  bash setup.sh
# ============================================================

set -e

echo "========================================"
echo " ZeTalent VPS Setup — AlmaLinux 9"
echo "========================================"

# ── 1. System update ─────────────────────────────────────────
echo "[1/9] Updating system..."
dnf update -y -q
dnf install -y git curl wget nano unzip epel-release

# ── 2. Node.js 20 ────────────────────────────────────────────
echo "[2/9] Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs
node -v && npm -v

# ── 3. PostgreSQL 15 ─────────────────────────────────────────
echo "[3/9] Installing PostgreSQL 15..."
dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
dnf -qy module disable postgresql
dnf install -y postgresql15-server postgresql15
/usr/pgsql-15/bin/postgresql-15-setup initdb
systemctl enable postgresql-15
systemctl start postgresql-15

# Create DB and user
echo "[3/9] Creating database..."
sudo -u postgres psql -c "CREATE USER zetalent_user WITH PASSWORD 'ZeT@lent2024!Secure';"
sudo -u postgres psql -c "CREATE DATABASE zetalent OWNER zetalent_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE zetalent TO zetalent_user;"

# ── 4. Nginx ─────────────────────────────────────────────────
echo "[4/9] Installing Nginx..."
dnf install -y nginx
systemctl enable nginx
systemctl start nginx

# ── 5. PM2 (Node.js process manager) ─────────────────────────
echo "[5/9] Installing PM2..."
npm install -g pm2

# ── 6. Clone repo ────────────────────────────────────────────
echo "[6/9] Cloning repository..."
mkdir -p /var/www/zetalent
cd /var/www/zetalent
git clone https://github.com/Jean-Aime/zetalent.git .

# ── 7. Backend setup ─────────────────────────────────────────
echo "[7/9] Setting up backend..."
cd /var/www/zetalent/backend
npm install --production

# Create .env
cat > .env << 'ENVEOF'
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zetalent
DB_USER=zetalent_user
DB_PASSWORD=ZeT@lent2024!Secure
JWT_SECRET=ZeTalentMedia2024SuperSecretJWTKey!@#$%^&*()
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://zetalent-media.com
ENVEOF

# Run migrations
node migrate.js

# Seed admin user
node seed-admin.js

# ── 8. Frontend static files ──────────────────────────────────
echo "[8/9] Deploying frontend..."
mkdir -p /var/www/zetalent/frontend_dist
cp -r /var/www/zetalent/frontend/dist/* /var/www/zetalent/frontend_dist/

# ── 9. Nginx config ───────────────────────────────────────────
echo "[9/9] Configuring Nginx..."
cp /var/www/zetalent/nginx.conf /etc/nginx/conf.d/zetalent.conf

# Remove default nginx config
rm -f /etc/nginx/conf.d/default.conf

# Update root path in nginx config to point to frontend_dist
sed -i 's|root /var/www/zetalent/frontend;|root /var/www/zetalent/frontend_dist;|' /etc/nginx/conf.d/zetalent.conf

# Test nginx config
nginx -t

# ── Start backend with PM2 ────────────────────────────────────
echo "Starting backend with PM2..."
cd /var/www/zetalent
pm2 start backend/src/index.js --name zetalent-api
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

# ── Firewall ──────────────────────────────────────────────────
echo "Configuring firewall..."
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

# ── Reload Nginx (HTTP only for now) ─────────────────────────
# NOTE: SSL config in nginx.conf is commented out until certbot runs
# Temporarily use HTTP-only config:
cat > /etc/nginx/conf.d/zetalent.conf << 'NGINXEOF'
server {
    listen 80;
    server_name zetalent-media.com www.zetalent-media.com;

    root /var/www/zetalent/frontend_dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location /api {
        proxy_pass         http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    location /uploads {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

nginx -t && systemctl reload nginx

echo ""
echo "========================================"
echo " Setup complete!"
echo "========================================"
echo " Site:    http://zetalent-media.com"
echo " API:     http://zetalent-media.com/api/health"
echo " Admin:   admin@zetalentmedia.com"
echo " Pass:    12@Zetalentmedia34?"
echo ""
echo " NEXT: Run SSL setup:"
echo "   bash ssl.sh"
echo "========================================"
