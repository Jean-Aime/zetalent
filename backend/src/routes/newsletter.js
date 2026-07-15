'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// POST /api/newsletter/subscribe — public
router.post('/subscribe', async (req, res) => {
  const { email, source } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    await pool.query(
      `INSERT INTO newsletter_subscribers (email, source)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET is_active = true`,
      [email.toLowerCase().trim(), source === 'social' ? 'social' : 'website']
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// All routes below require admin auth
router.use(authenticate);

// GET /api/newsletter
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, subscribed_at, 
              CASE WHEN is_active THEN 'active' ELSE 'unsubscribed' END AS status,
              source
       FROM newsletter_subscribers
       ORDER BY subscribed_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get subscribers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/newsletter/:id — toggle active status
router.patch('/:id', async (req, res) => {
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be a boolean' });
  }
  try {
    const { rowCount } = await pool.query(
      'UPDATE newsletter_subscribers SET is_active = $1 WHERE id = $2',
      [is_active, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Subscriber not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Update subscriber error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/newsletter/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM newsletter_subscribers WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Subscriber not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete subscriber error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
