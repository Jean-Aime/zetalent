'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// ===== STANDINGS =====
const standingsRouter = require('express').Router();

standingsRouter.get('/', async (req, res) => {
  try {
    const { sport, league } = req.query;
    let q = 'SELECT * FROM standings WHERE 1=1';
    const vals = [];
    let i = 1;
    if (sport) { q += ` AND sport_id = (SELECT id FROM sports WHERE slug = $${i++})`; vals.push(sport); }
    if (league) { q += ` AND league_id = $${i++}`; vals.push(league); }
    q += ' ORDER BY position';
    const { rows } = await pool.query(q, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

standingsRouter.use(authenticate);

standingsRouter.post('/', async (req, res) => {
  const { sport_id, league_id, team_id, position, team_name, team_logo, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form, season } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO standings (sport_id,league_id,team_id,position,team_name,team_logo,played,won,drawn,lost,goals_for,goals_against,goal_difference,points,form,season)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [sport_id,league_id,team_id,position,team_name,team_logo,played||0,won||0,drawn||0,lost||0,goals_for||0,goals_against||0,goal_difference||0,points||0,JSON.stringify(form||[]),season]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

standingsRouter.patch('/:id', async (req, res) => {
  const fields = ['position','team_name','team_logo','played','won','drawn','lost','goals_for','goals_against','goal_difference','points','season'];
  const updates = [];
  const values = [];
  let i = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f} = $${i++}`); values.push(req.body[f]); }
  }
  if (req.body.form !== undefined) { updates.push(`form = $${i++}`); values.push(JSON.stringify(req.body.form)); }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(`UPDATE standings SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

standingsRouter.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM standings WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== SPONSORS =====
const sponsorsRouter = require('express').Router();

sponsorsRouter.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sponsors WHERE is_active = true ORDER BY sort_order, tier');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

sponsorsRouter.use(authenticate);

sponsorsRouter.post('/', async (req, res) => {
  const { name, tier, logo_text, logo_url, website, sort_order } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO sponsors (name, tier, logo_text, logo_url, website, sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, tier||'silver', logo_text, logo_url, website, sort_order||0]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

sponsorsRouter.patch('/:id', async (req, res) => {
  const fields = ['name','tier','logo_text','logo_url','website','sort_order','is_active'];
  const updates = [];
  const values = [];
  let i = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f} = $${i++}`); values.push(req.body[f]); }
  }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(`UPDATE sponsors SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

sponsorsRouter.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sponsors WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== SOCIAL POSTS =====
const socialRouter = require('express').Router();
const fetch = (() => { try { return require('node-fetch'); } catch { return null; } })();

// ensure tweet_url column exists (safe to run every startup)
pool.query(`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS tweet_url TEXT`).catch(() => {});

// ── Fetch tweet metadata from oEmbed (free, no API key) ──
socialRouter.post('/fetch-tweet', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });
  if (!fetch) return res.status(500).json({ error: 'node-fetch not available' });

  // validate it looks like a tweet URL
  if (!/twitter\.com|x\.com/.test(url)) return res.status(400).json({ error: 'Not a Twitter/X URL' });

  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
    const r = await fetch(oembedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 });
    if (!r.ok) return res.status(r.status).json({ error: 'Tweet not found or not public' });
    const data = await r.json();

    // extract plain text from the HTML (strip <a> tags etc.)
    const text = data.html
      .replace(/<a[^>]*>.*?<\/a>/gs, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .trim();

    // extract handle from author_url: https://twitter.com/handle
    const handle = (data.author_url || '').split('/').filter(Boolean).pop() || '';

    res.json({
      author: data.author_name || '',
      handle: handle ? `@${handle}` : '',
      content: text,
      tweet_url: url,
      platform: 'twitter',
    });
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('timeout')) return res.status(504).json({ error: 'Request timed out' });
    res.status(502).json({ error: 'Failed to fetch tweet' });
  }
});

socialRouter.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const q = category
      ? 'SELECT * FROM social_posts WHERE category = $1 ORDER BY posted_at DESC'
      : 'SELECT * FROM social_posts ORDER BY posted_at DESC';
    const { rows } = await pool.query(q, category ? [category] : []);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

socialRouter.use(authenticate);

socialRouter.post('/', async (req, res) => {
  const { platform, author, handle, avatar_url, content, image_url, likes, comments, shares, category, tweet_url } = req.body;
  if (!platform || !author || !content) return res.status(400).json({ error: 'platform, author and content are required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO social_posts (platform,author,handle,avatar_url,content,image_url,likes,comments,shares,category,tweet_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [platform,author,handle,avatar_url,content,image_url,likes||0,comments||0,shares||0,category||'latest',tweet_url||null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

socialRouter.patch('/:id', async (req, res) => {
  const fields = ['platform','author','handle','avatar_url','content','image_url','likes','comments','shares','category'];
  const updates = [];
  const values = [];
  let i = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f} = $${i++}`); values.push(req.body[f]); }
  }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(`UPDATE social_posts SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

socialRouter.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM social_posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = { standingsRouter, sponsorsRouter, socialRouter };
