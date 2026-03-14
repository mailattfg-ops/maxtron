const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkStock() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM raw_materials LIMIT 1');
    console.log('Raw Material Sample:', res.rows[0]);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

checkStock();
