'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// POST /api/messages — public, submit contact form
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO contact_messages (name, email, subject, body, status)
       VALUES ($1, $2, $3, $4, 'unread') RETURNING id`,
      [name.trim(), email.toLowerCase().trim(), (subject || '').trim(), message.trim()]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error('Submit message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// All routes below require admin auth
router.use(authenticate);

// GET /api/messages
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, subject, body, created_at AS date, status FROM contact_messages ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/messages/:id — update status
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  const allowed = ['unread', 'read', 'archived'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  try {
    const { rowCount } = await pool.query(
      'UPDATE contact_messages SET status = $1 WHERE id = $2',
      [status, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Update message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM contact_messages WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
