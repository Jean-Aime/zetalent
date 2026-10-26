'use strict';
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/db/pool');

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'ZeTalent Admin';
  const role = 'super_admin';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long');
  }

  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO admin_users (email, name, role, password_hash)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET password_hash = $4, name = $2, role = $3`,
    [email, name, role, hash]
  );

  console.log(`Admin user seeded: ${email}`);
  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
