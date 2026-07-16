'use strict';
const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, sport, featured, trending, limit } = req.query;
    let q = `SELECT a.*, json_object_agg(t.locale, json_build_object('title',t.title,'excerpt',t.excerpt,'body',t.body)) as translations
             FROM news_articles a
             LEFT JOIN news_translations t ON t.article_id = a.id
             WHERE (a.status = 'published' OR a.is_breaking = true)`;
    const vals = [];
    let i = 1;
    if (category) { q += ` AND a.category = $${i++}`; vals.push(category); }
    if (sport) { q += ` AND a.sport_slug = $${i++}`; vals.push(sport); }
    if (featured === 'true') q += ` AND a.is_featured = true`;
    if (trending === 'true') q += ` AND a.is_trending = true`;
    q += ` GROUP BY a.id ORDER BY a.published_at DESC`;
    if (limit) { q += ` LIMIT $${i++}`; vals.push(Number(limit)); }
    const { rows } = await pool.query(q, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/admin/all', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, json_object_agg(COALESCE(t.locale,'en'), json_build_object('title',t.title,'excerpt',t.excerpt,'body',t.body)) as translations
       FROM news_articles a LEFT JOIN news_translations t ON t.article_id = a.id
       GROUP BY a.id ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, json_object_agg(t.locale, json_build_object('title',t.title,'excerpt',t.excerpt,'body',t.body)) as translations
       FROM news_articles a LEFT JOIN news_translations t ON t.article_id = a.id
       WHERE a.slug = $1 GROUP BY a.id`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query('UPDATE news_articles SET views = views + 1 WHERE slug = $1', [req.params.slug]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.use(authenticate);

router.post('/', async (req, res) => {
  const { slug, category, sport_slug, author, author_avatar, image_url, image_alt, read_time, is_featured, is_trending, is_breaking, status, tags, translations } = req.body;
  if (!slug || !category || !author) return res.status(400).json({ error: 'slug, category and author are required' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO news_articles (slug,category,sport_slug,author,author_avatar,image_url,image_alt,read_time,is_featured,is_trending,is_breaking,status,tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [slug,category,sport_slug,author,author_avatar,image_url,image_alt,read_time||3,is_featured||false,is_trending||false,is_breaking||false,status||'published',JSON.stringify(tags||[])]
    );
    const articleId = rows[0].id;
    if (translations) {
      for (const [locale, data] of Object.entries(translations)) {
        await client.query(
          `INSERT INTO news_translations (article_id, locale, title, excerpt, body) VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (article_id, locale) DO UPDATE SET title=$3, excerpt=$4, body=$5`,
          [articleId, locale, data.title, data.excerpt, data.body]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

router.patch('/:id', async (req, res) => {
  const { translations, tags, ...rest } = req.body;
  const fields = ['slug','category','sport_slug','author','author_avatar','image_url','image_alt','read_time','is_featured','is_trending','is_breaking','status'];
  const updates = [];
  const values = [];
  let i = 1;
  for (const f of fields) {
    if (rest[f] !== undefined) { updates.push(`${f} = $${i++}`); values.push(rest[f]); }
  }
  if (tags !== undefined) { updates.push(`tags = $${i++}`); values.push(JSON.stringify(tags)); }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (updates.length) {
      updates.push('updated_at = now()');
      values.push(req.params.id);
      const { rows } = await client.query(`UPDATE news_articles SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, values);
      if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Not found' }); }
    }
    if (translations) {
      for (const [locale, data] of Object.entries(translations)) {
        await client.query(
          `INSERT INTO news_translations (article_id, locale, title, excerpt, body) VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (article_id, locale) DO UPDATE SET title=$3, excerpt=$4, body=$5`,
          [req.params.id, locale, data.title, data.excerpt, data.body]
        );
      }
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM news_articles WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
