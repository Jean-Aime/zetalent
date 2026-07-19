'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const pg = new Pool({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

async function run() {
  const { rows } = await pg.query("SELECT body FROM news_translations WHERE body LIKE '%/assets/images%' LIMIT 1");
  const body = rows[0].body;
  const idx = body.indexOf('/assets/');
  const snippet = body.substring(Math.max(0, idx - 30), idx + 50);
  // Print char codes around src=
  console.log('snippet:', snippet);
  console.log('char codes:', [...snippet].map(c => c.charCodeAt(0)));
  await pg.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
