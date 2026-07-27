# ZeTalent Media Platform

<div align="center">

**The digital home of women's sports in Rwanda and East Africa.**

[![Live](https://img.shields.io/badge/Live-zetalent--media.com-gold?style=for-the-badge)](https://zetalent-media.com)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](#license)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20PostgreSQL-blue?style=for-the-badge)](#tech-stack)

</div>

---

## About

ZeTalent Media is a full-stack sports media platform built and owned by **Jean-Aimé**, covering women's football, basketball, volleyball, handball, athletics and more across Rwanda and East Africa.

The platform features a public-facing news and sports portal with a powerful admin panel for full content management.

---

## Features

### Public Portal
- Multi-language support — English, French, Kinyarwanda
- Breaking news ticker with live article pages
- Sports categories: football, basketball, volleyball, handball, athletics
- Fixtures, standings, teams and player profiles
- Social sharing — WhatsApp, X/Twitter, Facebook, copy link
- OG meta tags for rich link previews on WhatsApp and social media
- Social wall (Twitter/X embed feed)
- Newsletter subscription
- Dark / light theme toggle
- Fully responsive — mobile first

### Admin Panel (`/admin`)
- Secure JWT-based authentication
- News article editor with multi-language tabs (EN / FR / RW)
- Rich body editor with image upload support
- Article settings: status, category, sport, author, cover image, featured / trending / breaking flags
- Mobile-responsive modal editor with collapsible settings panel
- Media library
- Team, player, match and standings management
- Sponsor management
- Newsletter management
- User management
- Analytics dashboard
- Contact messages inbox

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 14 |
| Auth | JWT (jsonwebtoken) |
| File uploads | Multer |
| Web server | Nginx (reverse proxy + static files) |
| Process manager | PM2 |
| SSL | Let's Encrypt (Certbot) |
| Hosting | VPS — AlmaLinux 9 (Namecheap) |

---

## Project Structure

```
zetalent/
├── frontend/                   # React + TypeScript SPA
│   ├── src/
│   │   ├── admin/              # Admin panel pages and layout
│   │   ├── components/         # Shared UI components
│   │   ├── contexts/           # Theme and language context
│   │   ├── lib/                # API client
│   │   ├── pages/              # Public pages (news, sports, teams...)
│   │   └── utils/              # Helpers
│   ├── public/
│   └── vite.config.ts
├── backend/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── middleware/         # Auth middleware
│   │   └── db/                 # PostgreSQL pool
│   └── uploads/                # Uploaded media files
├── nginx.conf                  # Nginx server configuration
├── setup.sh                    # VPS initial setup script
└── DEPLOY.md                   # Deployment guide
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your environment variables
npm install
node seed-admin.js
npm start
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:4000/api
npm install
npm run dev
```

### Environment Variables

**Backend `.env`**
```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/zetalent
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://zetalent-media.com
```

**Frontend `.env.local`**
```env
VITE_API_URL=http://localhost:4000/api
```

---

## Deployment

See [DEPLOY.md](./DEPLOY.md) for the full VPS deployment guide.

Quick deploy after changes:

```bash
cd /var/www/zetalent
git pull origin main
cd frontend
npm run build
\cp -rf dist/* /var/www/zetalent/frontend_dist/
pm2 restart zetalent-api
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Admin login |
| GET | `/api/news` | No | List published articles |
| GET | `/api/news/:slug` | No | Get article by slug |
| POST | `/api/news` | Yes | Create article |
| PATCH | `/api/news/:id` | Yes | Update article |
| DELETE | `/api/news/:id` | Yes | Delete article |
| GET | `/api/sports` | No | List sports |
| GET | `/api/teams` | No | List teams |
| GET | `/api/players` | No | List players |
| GET | `/api/matches` | No | List matches |
| POST | `/api/upload` | Yes | Upload image |
| GET | `/og/news/:slug` | No | OG meta page for social crawlers |

---

## Social Sharing

When a news article link is shared on WhatsApp, Facebook, X/Twitter or any other platform, the crawler receives a server-rendered HTML page with full Open Graph meta tags — including the article title, excerpt and cover image — served by the `/og/news/:slug` endpoint via Nginx user-agent detection.

---

## License

**Copyright © 2026 Jean-Aimé. All rights reserved.**

This project, including all source code, design, content, and intellectual property, is the exclusive property of the owner. No part of this codebase may be copied, reproduced, modified, distributed, sublicensed, or used in any form — commercial or non-commercial — without explicit written permission from the owner.

Unauthorized use will be subject to legal action.

---

## Contact

**ZeTalent Media**

| | |
|---|---|
| Website | [zetalent-media.com](https://zetalent-media.com) |
| Email | baraime450@gmail.com |
