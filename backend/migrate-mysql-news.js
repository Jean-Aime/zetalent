'use strict';
// ============================================================
// MySQL → PostgreSQL News Migration
// SAFE: Only INSERTs new rows. Never touches existing data.
// ============================================================
require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pg = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

function slugify(text, id) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80) + '-mysql-' + id;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Parse news rows from SQL dump using a simple state machine
function parseNews(sqlFile) {
  const content = fs.readFileSync(sqlFile, 'utf8');
  const news = [];

  // Find all INSERT INTO `news` blocks
  const lines = content.split('\n');
  let inNewsBlock = false;
  let buffer = '';

  for (const line of lines) {
    if (line.startsWith("INSERT INTO `news`")) {
      inNewsBlock = true;
      buffer = '';
      continue;
    }
    if (inNewsBlock) {
      buffer += line + '\n';
      // End of INSERT block
      if (line.trim().endsWith(';')) {
        inNewsBlock = false;
        // Parse rows from buffer
        parseRows(buffer, news);
        buffer = '';
      }
    }
  }

  return news;
}

function parseRows(block, news) {
  // Each row starts with ( and ends with ),  or );
  // We need to handle multi-line rows
  let depth = 0;
  let inStr = false;
  let escape = false;
  let rowStart = -1;
  
  for (let i = 0; i < block.length; i++) {
    const ch = block[i];
    
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    
    if (ch === "'" && !escape) {
      inStr = !inStr;
      continue;
    }
    
    if (!inStr) {
      if (ch === '(') {
        if (depth === 0) rowStart = i;
        depth++;
      } else if (ch === ')') {
        depth--;
        if (depth === 0 && rowStart >= 0) {
          const row = block.substring(rowStart + 1, i);
          const parsed = parseRow(row);
          if (parsed) news.push(parsed);
          rowStart = -1;
        }
      }
    }
  }
}

function parseRow(row) {
  // Extract fields: id, title, content, featured_image, created_at, updated_at
  // Fields are separated by commas but commas inside strings are escaped
  const fields = [];
  let current = '';
  let inStr = false;
  let escape = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    
    if (escape) {
      current += ch;
      escape = false;
      continue;
    }
    
    if (ch === '\\') {
      current += ch;
      escape = true;
      continue;
    }
    
    if (ch === "'" && !escape) {
      inStr = !inStr;
      current += ch;
      continue;
    }
    
    if (ch === ',' && !inStr) {
      fields.push(current.trim());
      current = '';
      continue;
    }
    
    current += ch;
  }
  fields.push(current.trim());

  if (fields.length < 6) return null;

  const id = parseInt(fields[0]);
  if (isNaN(id)) return null;

  const unquote = (s) => {
    s = s.trim();
    if (s === 'NULL') return null;
    if (s.startsWith("'") && s.endsWith("'")) s = s.slice(1, -1);
    return s.replace(/\\'/g, "'").replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\\\/g, '\\');
  };

  return {
    id,
    title: unquote(fields[1]) || '',
    content: unquote(fields[2]) || '',
    featured_image: unquote(fields[3]),
    created_at: unquote(fields[4]),
  };
}

async function migrate() {
  console.log('Starting MySQL → PostgreSQL news migration...');
  console.log('⚠️  SAFE MODE: Only INSERT new rows. Existing data untouched.\n');

  const news = parseNews('./iwacevvb_zmedia.sql');
  console.log(`Found ${news.length} news articles in MySQL dump\n`);

  // Show current PostgreSQL state BEFORE
  const before = await pg.query('SELECT COUNT(*) FROM news_articles');
  console.log(`PostgreSQL news_articles BEFORE: ${before.rows[0].count} rows\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of news) {
    if (!item.title || item.title.length < 2) { skipped++; continue; }

    const slug = slugify(item.title, item.id);
    const plainText = stripHtml(item.content);
    const excerpt = plainText.substring(0, 300) + (plainText.length > 300 ? '...' : '');

    try {
      const result = await pg.query(
        `INSERT INTO news_articles 
          (slug, category, sport_slug, author, image_url, image_alt,
           published_at, is_featured, is_trending, is_breaking, status, views)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [
          slug, 'match-reports', 'football', 'ZeTalent Media',
          item.featured_image || '', item.title,
          item.created_at, false, false, false, 'published', 0,
        ]
      );

      if (result.rows.length === 0) {
        skipped++;
        continue;
      }

      const articleId = result.rows[0].id;

      await pg.query(
        `INSERT INTO news_translations (article_id, locale, title, excerpt, body)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (article_id, locale) DO NOTHING`,
        [articleId, 'en', item.title, excerpt, item.content]
      );

      imported++;
      console.log(`✓ [${item.id}] ${item.title.substring(0, 70)}`);
    } catch (err) {
      errors++;
      console.error(`✗ [${item.id}] ${err.message}`);
    }
  }

  // Show PostgreSQL state AFTER
  const after = await pg.query('SELECT COUNT(*) FROM news_articles');
  console.log(`\nPostgreSQL news_articles AFTER: ${after.rows[0].count} rows`);
  console.log(`\n✅ Done! Imported: ${imported} | Skipped: ${skipped} | Errors: ${errors}`);

  await pg.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
