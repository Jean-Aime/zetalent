'use strict';
require('dotenv').config({ path: './backend/.env' });
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Parse MySQL INSERT statements for the news table
function parseNewsFromSQL(sqlContent) {
  const news = [];
  // Match all INSERT INTO `news` blocks
  const insertRegex = /INSERT INTO `news`[^;]+;/gs;
  const matches = sqlContent.match(insertRegex) || [];

  for (const block of matches) {
    // Extract individual rows - match (value, value, ...) patterns
    const rowRegex = /\((\d+),\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*(NULL|'(?:[^'\\]|\\.)*'),\s*'([^']+)',\s*'([^']+)'\)/gs;
    let match;
    while ((match = rowRegex.exec(block)) !== null) {
      const imageRaw = match[4];
      news.push({
        id: parseInt(match[1]),
        title: match[2].replace(/\\'/g, "'").replace(/\\\\/g, '\\'),
        content: match[3].replace(/\\'/g, "'").replace(/\\\\/g, '\\').replace(/\\n/g, '\n').replace(/\\r/g, ''),
        featured_image: imageRaw === 'NULL' ? null : imageRaw.replace(/^'|'$/g, '').replace(/\\'/g, "'"),
        created_at: match[5],
        updated_at: match[6],
      });
    }
  }
  return news;
}

function slugify(text, id) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80) + '-' + id;
}

async function migrate() {
  const sqlContent = fs.readFileSync('./iwacevvb_zmedia.sql', 'utf8');
  const newsItems = parseNewsFromSQL(sqlContent);

  console.log(`Found ${newsItems.length} news articles to migrate`);

  let imported = 0;
  let skipped = 0;

  for (const item of newsItems) {
    const slug = slugify(item.title, item.id);

    try {
      // Insert into news_articles
      const result = await pool.query(
        `INSERT INTO news_articles 
          (slug, category, sport_slug, author, image_url, image_alt, published_at, 
           is_featured, is_trending, is_breaking, status, views)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [
          slug,
          'match-reports',
          'football',
          'ZeTalent Media',
          item.featured_image || '',
          item.title,
          item.created_at,
          false, false, false,
          'published',
          0,
        ]
      );

      if (result.rows.length === 0) {
        skipped++;
        continue;
      }

      const articleId = result.rows[0].id;

      // Insert translations (EN only — original content is in English/French)
      await pool.query(
        `INSERT INTO news_translations (article_id, locale, title, excerpt, body)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (article_id, locale) DO NOTHING`,
        [
          articleId,
          'en',
          item.title,
          item.content.substring(0, 300).replace(/<[^>]+>/g, '').trim() + '...',
          item.content,
        ]
      );

      imported++;
      console.log(`✓ [${item.id}] ${item.title.substring(0, 60)}`);
    } catch (err) {
      console.error(`✗ [${item.id}] ${item.title.substring(0, 40)} — ${err.message}`);
    }
  }

  console.log(`\nDone! Imported: ${imported}, Skipped (duplicates): ${skipped}`);
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
