'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { sport, status } = req.query;
    let q = `SELECT m.*, s.slug as sport_slug FROM matches m LEFT JOIN sports s ON s.id = m.sport_id WHERE 1=1`;
    const vals = [];
    let i = 1;
    if (sport) { q += ` AND s.slug = $${i++}`; vals.push(sport); }
    if (status) { q += ` AND m.status = $${i++}`; vals.push(status); }
    q += ' ORDER BY m.match_date DESC, m.match_time DESC';
    const { rows } = await pool.query(q, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM matches WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    const events = await pool.query('SELECT * FROM match_events WHERE match_id = $1 ORDER BY minute', [req.params.id]);
    res.json({ ...rows[0], events: events.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.use(authenticate);

router.post('/', async (req, res) => {
  const { sport_id, league_id, home_team_id, away_team_id, home_team_name, away_team_name, home_team_logo, away_team_logo, home_score, away_score, match_date, match_time, venue, status, league_name, matchweek, mvp } = req.body;
  if (!home_team_name || !away_team_name || !match_date) return res.status(400).json({ error: 'home_team_name, away_team_name and match_date are required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO matches (sport_id,league_id,home_team_id,away_team_id,home_team_name,away_team_name,home_team_logo,away_team_logo,home_score,away_score,match_date,match_time,venue,status,league_name,matchweek,mvp)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [sport_id,league_id,home_team_id,away_team_id,home_team_name,away_team_name,home_team_logo,away_team_logo,home_score,away_score,match_date,match_time,venue,status||'upcoming',league_name,matchweek||0,mvp]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', async (req, res) => {
  const fields = ['sport_id','league_id','home_team_id','away_team_id','home_team_name','away_team_name','home_team_logo','away_team_logo','home_score','away_score','match_date','match_time','venue','status','league_name','matchweek','mvp'];
  const updates = [];
  const values = [];
  let i = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f} = $${i++}`); values.push(req.body[f]); }
  }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  updates.push('updated_at = now()');
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(`UPDATE matches SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM matches WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
