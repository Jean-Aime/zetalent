'use strict';
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'blob:', 'http://localhost:4000', 'https:'],
      'script-src': ["'self'", 'https://platform.twitter.com', 'https://cdn.syndication.twimg.com'],
      'frame-src': ["'self'", 'https://platform.twitter.com', 'https://syndication.twitter.com', 'https://twitter.com', 'https://x.com'],
      'connect-src': ["'self'", 'https://api.twitter.com', 'https://syndication.twitter.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://platform.twitter.com', 'https:'],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, require('express').static(require('path').join(__dirname, '../uploads')));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
}));

app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, try again later.' },
}));

app.use('/api/upload',     require('./routes/upload'));
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/messages',   require('./routes/messages'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/sports',     require('./routes/sports'));
app.use('/api/teams',      require('./routes/teams'));
app.use('/api/players',    require('./routes/players'));
app.use('/api/matches',    require('./routes/matches'));
app.use('/api/news',       require('./routes/news'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/analytics',  require('./routes/analytics'));

const { standingsRouter, sponsorsRouter, socialRouter } = require('./routes/content');
app.use('/api/standings', standingsRouter);
app.use('/api/sponsors',  sponsorsRouter);
app.use('/api/social',    socialRouter);

// ── Image proxy (for admin preview of external URLs without CORS issues) ──
const fetch = require('node-fetch');
app.get('/api/img-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });

  let origin = '';
  try { origin = new URL(url).origin; } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const upstream = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': origin + '/',
      },
      timeout: 10000,
    });

    if (upstream.status === 404) return res.status(404).json({ error: 'Image not found — the URL no longer exists (404)' });
    if (upstream.status === 403) return res.status(403).json({ error: 'Access denied — this site blocks hotlinking (403)' });
    if (!upstream.ok) return res.status(502).json({ error: `Upstream server returned ${upstream.status}` });

    const ct = upstream.headers.get('content-type') || '';
    if (!ct.startsWith('image/')) return res.status(415).json({ error: 'URL does not point to an image file' });

    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    upstream.body.pipe(res);
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('timeout') || msg.includes('etimedout') || msg.includes('network timeout')) {
      return res.status(504).json({ error: 'Request timed out — remote server is too slow' });
    }
    if (msg.includes('enotfound')) {
      return res.status(502).json({ error: 'Domain not found — check the URL' });
    }
    if (msg.includes('econnrefused')) {
      return res.status(502).json({ error: 'Connection refused by remote server' });
    }
    console.error('[img-proxy] fetch error:', err.message);
    res.status(502).json({ error: 'Failed to fetch image from remote server' });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`ZT Media API running on port ${PORT}`));
