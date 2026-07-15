'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// Generic CRUD factory
function crudRouter(table, publicGet = true) {
  const r = require('express').Router();

  if (publicGet) {
    r.get('/', async (req, res) => {
      try {
        const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
        res.json(rows);
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
    r.get('/:id', async (req, res) => {
      try {
        const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
        if (!rows[0]) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
  }

  r.use(authenticate);

  if (!publicGet) {
    r.get('/', async (req, res) => {
      try {
        const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
        res.json(rows);
      } catch (err) { res.status(500).json({ error: err.message }); }
    });
  }

  return r;
}

module.exports = { crudRouter };
