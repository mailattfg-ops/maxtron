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
    console.log('Checking RLS for supplier_materials...');
    const res = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
      WHERE relname = 'supplier_materials' AND nspname = 'public';
    `);
    console.log('RLS Status:', res.rows);

    const polRes = await client.query(`
      SELECT * FROM pg_policies WHERE tablename = 'supplier_materials';
    `);
    console.log('Policies:', polRes.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

check();
