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
  const { platform, author, handle, avatar_url, content, image_url, likes, comments, shares, category } = req.body;
  if (!platform || !author || !content) return res.status(400).json({ error: 'platform, author and content are required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO social_posts (platform,author,handle,avatar_url,content,image_url,likes,comments,shares,category)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [platform,author,handle,avatar_url,content,image_url,likes||0,comments||0,shares||0,category||'latest']
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
