'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { sport } = req.query;
    const q = sport
      ? 'SELECT t.*, s.slug as sport_slug FROM teams t LEFT JOIN sports s ON s.id = t.sport_id WHERE s.slug = $1 AND t.is_active = true ORDER BY t.name'
      : 'SELECT t.*, s.slug as sport_slug FROM teams t LEFT JOIN sports s ON s.id = t.sport_id WHERE t.is_active = true ORDER BY t.name';
    const { rows } = await pool.query(q, sport ? [sport] : []);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT t.*, s.slug as sport_slug FROM teams t LEFT JOIN sports s ON s.id = t.sport_id WHERE t.slug = $1',
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.use(authenticate);

router.post('/', async (req, res) => {
  const { sport_id, slug, name, short_name, city, founded, stadium, coach, primary_color, logo_url, description, achievements } = req.body;
  if (!slug || !name) return res.status(400).json({ error: 'slug and name are required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO teams (sport_id, slug, name, short_name, city, founded, stadium, coach, primary_color, logo_url, description, achievements)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [sport_id, slug, name, short_name, city, founded, stadium, coach, primary_color || '#F4B400', logo_url, description, JSON.stringify(achievements || [])]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', async (req, res) => {
  const fields = ['sport_id','slug','name','short_name','city','founded','stadium','coach','primary_color','logo_url','description','achievements','is_active'];
  const updates = [];
  const values = [];
  let i = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${i++}`);
      values.push(f === 'achievements' ? JSON.stringify(req.body[f]) : req.body[f]);
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  updates.push(`updated_at = now()`);
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(`UPDATE teams SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM teams WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
