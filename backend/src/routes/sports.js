'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sports WHERE is_active = true ORDER BY sort_order, name');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sports WHERE slug = $1', [req.params.slug]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.use(authenticate);

router.post('/', async (req, res) => {
  const { slug, name, icon, color, team_count, sort_order } = req.body;
  if (!slug || !name) return res.status(400).json({ error: 'slug and name are required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO sports (slug, name, icon, color, team_count, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name, icon = EXCLUDED.icon, color = EXCLUDED.color,
         team_count = EXCLUDED.team_count, sort_order = EXCLUDED.sort_order,
         updated_at = now()
       RETURNING *`,
      [slug, name, icon || 'Trophy', color || '#F4B400', team_count || 0, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', async (req, res) => {
  const { slug, name, icon, color, team_count, sort_order, is_active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE sports SET
        slug = COALESCE($1, slug), name = COALESCE($2, name), icon = COALESCE($3, icon),
        color = COALESCE($4, color), team_count = COALESCE($5, team_count),
        sort_order = COALESCE($6, sort_order), is_active = COALESCE($7, is_active),
        updated_at = now()
       WHERE id = $8 RETURNING *`,
      [slug, name, icon, color, team_count, sort_order, is_active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM sports WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
