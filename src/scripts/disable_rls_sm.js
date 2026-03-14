const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  const client = await pool.connect();
  try {
    console.log('Disabling RLS on supplier_materials...');
    await client.query('ALTER TABLE supplier_materials DISABLE ROW LEVEL SECURITY');
    console.log('✅ RLS Disabled Successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

fix();
