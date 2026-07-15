'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, is_active, created_at, updated_at FROM admin_users ORDER BY created_at ASC'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, is_active, created_at FROM admin_users WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { email, name, role, password } = req.body;
  if (!email || !name || !password) return res.status(400).json({ error: 'email, name and password are required' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO admin_users (email, name, role, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, is_active, created_at`,
      [email, name, role || 'editor', hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { name, role, is_active, password } = req.body;
  const updates = [];
  const values = [];
  let i = 1;
  if (name !== undefined)      { updates.push(`name = $${i++}`);          values.push(name); }
  if (role !== undefined)      { updates.push(`role = $${i++}`);          values.push(role); }
  if (is_active !== undefined) { updates.push(`is_active = $${i++}`);     values.push(is_active); }
  if (password)                { updates.push(`password_hash = $${i++}`); values.push(await bcrypt.hash(password, 12)); }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  updates.push('updated_at = now()');
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE admin_users SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, email, name, role, is_active, updated_at`,
      values
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM admin_users WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
