'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const pg = new Pool({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

const BASE = 'https://zetalent-media.com';

async function fix() {
  const backslashQuote = String.fromCharCode(92, 34); // \"
  const fromStr = 'src=' + backslashQuote + '/assets/';
  const toStr   = 'src=' + backslashQuote + BASE + '/assets/';

  console.log('from:', JSON.stringify(fromStr));
  console.log('to:  ', JSON.stringify(toStr));

  // Use position() to avoid LIKE backslash issues
  const count = await pg.query(
    'SELECT COUNT(*) FROM news_translations WHERE position($1 IN body) > 0',
    [fromStr]
  );
  console.log('matching rows:', count.rows[0].count);

  const { rowCount } = await pg.query(
    'UPDATE news_translations SET body = replace(body, $1, $2) WHERE position($1 IN body) > 0',
    [fromStr, toStr]
  );
  console.log('body <img> src fixed:', rowCount, 'rows');
  await pg.end();
}

fix().catch(e => { console.error(e.message); process.exit(1); });
