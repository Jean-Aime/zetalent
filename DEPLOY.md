# ZeTalent — Deployment Guide

## Stack
- **Frontend**: React + Vite (static files → cPanel public_html)
- **Backend**: Node.js + Express + PostgreSQL (Node.js App on cPanel)

---

## 1. GitHub Push (local machine)

```bash
git add .
git commit -m "deploy: production build"
git push origin main
```

---

## 2. Backend — Namecheap VPS / cPanel Node.js App

### In cPanel → Setup Node.js App:
| Field | Value |
|---|---|
| Node.js version | 18.x or 20.x |
| Application mode | Production |
| Application root | `/home/<user>/zetalent` |
| Application URL | `yourdomain.com` |
| Application startup file | `backend/src/index.js` |

### Steps:
1. SSH into your VPS or use cPanel Terminal
2. Clone the repo:
   ```bash
   git clone https://github.com/Jean-Aime/zetalent.git
   cd zetalent
   ```
3. Install backend dependencies:
   ```bash
   cd backend && npm install --production
   ```
4. Create backend `.env` from example:
   ```bash
   cp .env.example .env
   nano .env   # fill in real values
   ```
   Set these values:
   ```
   PORT=4000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=zetalent
   DB_USER=your_cpanel_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=generate_a_long_random_string
   FRONTEND_URL=https://yourdomain.com
   ```
5. Run DB migrations:
   ```bash
   node migrate.js
   ```
6. Create admin user:
   ```bash
   node seed-admin.js
   ```
7. Start the app via cPanel Node.js App manager (click "Run NPM Install" then "Start")

---

## 3. Frontend — Build & Upload to cPanel

### On your local machine:

1. Set production API URL in `frontend/.env`:
   ```
   VITE_API_URL=https://yourdomain.com/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
2. Build:
   ```bash
   cd frontend
   npm run build
   ```
3. Upload the entire `frontend/dist/` folder contents to `public_html/` via cPanel File Manager or FTP.
   - The `.htaccess` is already included (copied from `public/` during build).

---

## 4. Backend API Proxy (Nginx or Apache)

If your backend runs on port 4000, proxy `/api` through your domain:

### Apache `.htaccess` in `public_html/` (add to existing):
```apache
RewriteRule ^api/(.*)$ http://localhost:4000/api/$1 [P,L]
```
Or use cPanel's **Proxy** settings to forward `/api` → `http://localhost:4000/api`.

### Nginx (if VPS):
```nginx
location /api {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
location /uploads {
    proxy_pass http://localhost:4000;
}
```

---

## 5. PostgreSQL on cPanel
1. Go to cPanel → **PostgreSQL Databases**
2. Create database: `zetalent`
3. Create user and assign all privileges
4. Update `.env` with those credentials

---

## 6. Updating (after code changes)

```bash
# On VPS via SSH:
cd zetalent
git pull origin main
cd backend && npm install --production
# Restart Node.js app from cPanel or:
pm2 restart all
```

For frontend updates, rebuild locally and re-upload `dist/` to `public_html/`.
