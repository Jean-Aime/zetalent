'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// Auto-create table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS page_views (
    id         BIGSERIAL PRIMARY KEY,
    path       TEXT NOT NULL,
    viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`).catch(() => {});

// POST /api/analytics/track  — called from frontend on every page load (no auth needed)
router.post('/track', async (req, res) => {
  const { path } = req.body;
  if (!path || typeof path !== 'string') return res.status(400).json({ error: 'path required' });
  try {
    await pool.query('INSERT INTO page_views (path) VALUES ($1)', [path.slice(0, 500)]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/analytics/traffic  — admin only
router.get('/traffic', authenticate, async (req, res) => {
  try {
    // Last 7 days, one row per day
    const { rows: daily } = await pool.query(`
      SELECT
        to_char(d.day, 'Dy') AS label,
        COALESCE(v.count, 0)::int AS visits
      FROM generate_series(
        (now() AT TIME ZONE 'UTC')::date - interval '6 days',
        (now() AT TIME ZONE 'UTC')::date,
        interval '1 day'
      ) AS d(day)
      LEFT JOIN (
        SELECT date_trunc('day', viewed_at AT TIME ZONE 'UTC') AS day, COUNT(*) AS count
        FROM page_views
        WHERE viewed_at >= now() - interval '7 days'
        GROUP BY 1
      ) v ON v.day = d.day
      ORDER BY d.day
    `);

    // Total visits last 7 days
    const { rows: totals } = await pool.query(`
      SELECT
        COUNT(*) AS total_7d,
        COUNT(*) FILTER (WHERE viewed_at >= now() - interval '14 days' AND viewed_at < now() - interval '7 days') AS prev_7d
      FROM page_views
      WHERE viewed_at >= now() - interval '14 days'
    `);

    // Total article views (sum of views column)
    const { rows: articleViews } = await pool.query(
      `SELECT COALESCE(SUM(views), 0)::int AS total FROM news_articles`
    );

    const total7d = parseInt(totals[0]?.total_7d || '0');
    const prev7d  = parseInt(totals[0]?.prev_7d  || '0');
    const pct = prev7d === 0 ? null : Math.round(((total7d - prev7d) / prev7d) * 100);

    res.json({
      days: daily,          // [{ label: 'Mon', visits: 42 }, ...]
      total7d,
      changePercent: pct,   // null if no previous data
      totalArticleViews: articleViews[0]?.total || 0,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
