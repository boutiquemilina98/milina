require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const queries = [
  'ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);'
];

async function run() {
  for (const q of queries) {
    try {
      await pool.query(q);
      console.log('Success:', q);
    } catch(e) {
      console.log('Skipped/Error:', q, e.message);
    }
  }
  pool.end();
}

run();
