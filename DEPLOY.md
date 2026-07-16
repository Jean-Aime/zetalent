# ZeTalent — VPS Deployment Guide
# Server: server1.streamoova.com (209.74.72.59)
# Repo:   https://github.com/Jean-Aime/zetalent.git

=======================================================================
PART 1 — CPANEL: CREATE POSTGRESQL DATABASE
=======================================================================

1. Login to cPanel: https://server1.streamoova.com:2083
2. Go to: PostgreSQL Databases
3. Create Database:    zetalent_db
4. Create DB User:     zetalent_user   (set a strong password)
5. Add user to DB:     Grant ALL PRIVILEGES
6. Note down:
   - DB_NAME     = <cpanel_prefix>_zetalent_db   (cPanel prefixes with your username)
   - DB_USER     = <cpanel_prefix>_zetalent_user
   - DB_PASSWORD = (what you set)
   - DB_HOST     = localhost
   - DB_PORT     = 5432

=======================================================================
PART 2 — CPANEL: SETUP NODE.JS APP
=======================================================================

1. cPanel → Setup Node.js App → Create Application
   - Node.js version:      18.x  (or 20.x)
   - Application mode:     Production
   - Application root:     zetalent          ← folder in your home dir
   - Application URL:      yourdomain.com    ← your actual domain
   - Application startup:  backend/src/index.js

2. Click CREATE — cPanel will create ~/zetalent folder

=======================================================================
PART 3 — SSH: CLONE REPO & INSTALL
=======================================================================

SSH into your VPS:
  ssh <your_cpanel_username>@209.74.72.59
  OR use cPanel → Terminal

Run these commands ONE BY ONE:

# Go to the app folder cPanel created
cd ~/zetalent

# Clone the repo INTO this folder
git init
git remote add origin https://github.com/Jean-Aime/zetalent.git
git pull origin main

# Install backend dependencies
cd backend
npm install --production
cd ..

# Create the .env file
cat > backend/.env << 'EOF'
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=REPLACE_WITH_CPANEL_DB_NAME
DB_USER=REPLACE_WITH_CPANEL_DB_USER
DB_PASSWORD=REPLACE_WITH_YOUR_DB_PASSWORD
JWT_SECRET=REPLACE_WITH_LONG_RANDOM_STRING_MIN_32_CHARS
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://REPLACE_WITH_YOUR_DOMAIN.com
EOF

# Edit the .env with real values:
nano backend/.env

# Run database migrations
cd backend
node migrate.js

# Seed the admin user
node seed-admin.js
cd ..

=======================================================================
PART 4 — CPANEL: START THE NODE.JS APP
=======================================================================

1. cPanel → Setup Node.js App
2. Find your app → click the pencil (Edit) icon
3. Click "Run NPM Install"
4. Click "Start App"
5. The app should show status: RUNNING on port 4000

Test it:
  curl http://localhost:4000/api/health
  → should return: {"status":"ok"}

=======================================================================
PART 5 — FRONTEND: BUILD WITH PRODUCTION API URL
=======================================================================

On your LOCAL machine (Windows):

1. Edit frontend/.env:
   VITE_API_URL=https://YOURDOMAIN.com/api
   VITE_SUPABASE_URL=https://drjhesyheyywwrtzhfrt.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. Build:
   cd frontend
   npm run build

3. The built files are in: frontend/dist/

=======================================================================
PART 6 — CPANEL: UPLOAD FRONTEND TO public_html
=======================================================================

Option A — File Manager (easiest):
1. Zip the contents of frontend/dist/ (NOT the dist folder, its contents)
2. cPanel → File Manager → public_html
3. Upload the zip → Extract here
4. Make sure index.html and .htaccess are directly in public_html/

Option B — FTP (FileZilla):
  Host:     209.74.72.59
  Username: your_cpanel_username
  Password: your_cpanel_password
  Port:     21
  Upload contents of frontend/dist/ → /public_html/

=======================================================================
PART 7 — APACHE PROXY: CONNECT /api TO NODE.JS PORT 4000
=======================================================================

In cPanel → File Manager → public_html → .htaccess
ADD these lines at the TOP (before the React SPA rules):

  RewriteEngine On

  # Proxy /api to Node.js backend on port 4000
  RewriteCond %{REQUEST_URI} ^/api [NC]
  RewriteRule ^api/(.*)$ http://localhost:4000/api/$1 [P,L]

  # Proxy /uploads to Node.js backend
  RewriteCond %{REQUEST_URI} ^/uploads [NC]
  RewriteRule ^uploads/(.*)$ http://localhost:4000/uploads/$1 [P,L]

  # React SPA — all other routes → index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]

NOTE: For [P] proxy to work, mod_proxy must be enabled on the server.
If it's not, use cPanel → Node.js App → "Application URL" subdomain approach instead.

=======================================================================
PART 8 — VERIFY EVERYTHING WORKS
=======================================================================

1. Visit https://yourdomain.com              → React app loads
2. Visit https://yourdomain.com/api/health   → {"status":"ok"}
3. Visit https://yourdomain.com/news         → News page loads (React Router)
4. Login at https://yourdomain.com/auth      → admin@zetalentmedia.com / 12@Zetalentmedia34?
5. Visit https://yourdomain.com/admin        → Admin panel works

=======================================================================
PART 9 — UPDATING AFTER CODE CHANGES
=======================================================================

On VPS (SSH):
  cd ~/zetalent
  git pull origin main
  cd backend && npm install --production
  # Restart from cPanel Node.js App manager OR:
  # Find the passenger restart file:
  touch ~/zetalent/tmp/restart.txt

For frontend changes (local machine):
  cd frontend
  npm run build
  # Re-upload dist/ contents to public_html/

=======================================================================
ADMIN CREDENTIALS (change after first login!)
=======================================================================
  Email:    admin@zetalentmedia.com
  Password: 12@Zetalentmedia34?

=======================================================================
