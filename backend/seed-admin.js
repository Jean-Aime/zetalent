'use strict';
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/db/pool');

async function seed() {
  const email = 'admin@zetalentmedia.com';
  const password = '12@Zetalentmedia34?';
  const name = 'ZeTalent Admin';
  const role = 'super_admin';

  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO admin_users (email, name, role, password_hash)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET password_hash = $4, name = $2, role = $3`,
    [email, name, role, hash]
  );

  console.log(`Admin user seeded: ${email} / ${password}`);
  console.log('IMPORTANT: Change this password after first login!');
  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
