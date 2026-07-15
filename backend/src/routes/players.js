'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { sport, team, featured } = req.query;
    let q = 'SELECT p.*, t.name as team_name, s.slug as sport_slug FROM players p LEFT JOIN teams t ON t.id = p.team_id LEFT JOIN sports s ON s.id = p.sport_id WHERE 1=1';
    const vals = [];
    let i = 1;
    if (sport) { q += ` AND s.slug = $${i++}`; vals.push(sport); }
    if (team) { q += ` AND t.id = $${i++}`; vals.push(team); }
    if (featured === 'true') { q += ` AND p.is_featured = true`; }
    q += ' ORDER BY p.name';
    const { rows } = await pool.query(q, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT p.*, t.name as team_name, s.slug as sport_slug FROM players p LEFT JOIN teams t ON t.id = p.team_id LEFT JOIN sports s ON s.id = p.sport_id WHERE p.slug = $1',
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.use(authenticate);

router.post('/', async (req, res) => {
  const { team_id, sport_id, slug, name, position, shirt_number, nationality, flag, age, height, photo_url, bio, achievements, stats, social_links, is_featured } = req.body;
  if (!slug || !name) return res.status(400).json({ error: 'slug and name are required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO players (team_id,sport_id,slug,name,position,shirt_number,nationality,flag,age,height,photo_url,bio,achievements,stats,social_links,is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [team_id,sport_id,slug,name,position,shirt_number,nationality,flag||'🇷🇼',age,height,photo_url,bio,
       JSON.stringify(achievements||[]),JSON.stringify(stats||[]),JSON.stringify(social_links||[]),is_featured||false]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', async (req, res) => {
  const jsonFields = ['achievements','stats','social_links'];
  const fields = ['team_id','sport_id','slug','name','position','shirt_number','nationality','flag','age','height','photo_url','bio','is_featured',...jsonFields];
  const updates = [];
  const values = [];
  let i = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${i++}`);
      values.push(jsonFields.includes(f) ? JSON.stringify(req.body[f]) : req.body[f]);
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  updates.push('updated_at = now()');
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(`UPDATE players SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM players WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
