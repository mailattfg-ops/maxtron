const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const client = await pool.connect();
  try {
    const sRes = await client.query('SELECT id, supplier_name FROM supplier_master LIMIT 1');
    if (sRes.rows.length) {
      const sid = sRes.rows[0].id;
      console.log(`Checking materials for Supplier: ${sRes.rows[0].supplier_name} (${sid})`);
      const mRes = await client.query('SELECT * FROM supplier_materials WHERE supplier_id = $1', [sid]);
      console.log('Materials in DB:', mRes.rows);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

check();
