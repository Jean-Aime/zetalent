'use strict';
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

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

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/messages',   require('./routes/messages'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/sports',     require('./routes/sports'));
app.use('/api/teams',      require('./routes/teams'));
app.use('/api/players',    require('./routes/players'));
app.use('/api/matches',    require('./routes/matches'));
app.use('/api/news',       require('./routes/news'));
app.use('/api/users',      require('./routes/users'));

const { standingsRouter, sponsorsRouter, socialRouter } = require('./routes/content');
app.use('/api/standings', standingsRouter);
app.use('/api/sponsors',  sponsorsRouter);
app.use('/api/social',    socialRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`ZT Media API running on port ${PORT}`));
