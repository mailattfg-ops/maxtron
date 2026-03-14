const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function testInsert() {
  const client = await pool.connect();
  try {
    // Get a supplier and a raw material
    const supRes = await client.query('SELECT id FROM supplier_master LIMIT 1');
    const rmRes = await client.query('SELECT id FROM raw_materials LIMIT 1');

    if (supRes.rows.length && rmRes.rows.length) {
      const supId = supRes.rows[0].id;
      const rmId = rmRes.rows[0].id;
      console.log(`Inserting relationship: Supplier ${supId}, Material ${rmId}`);
      
      const insRes = await client.query(
        'INSERT INTO supplier_materials (supplier_id, rm_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
        [supId, rmId]
      );
      console.log('Insert Result:', insRes.rows);
    } else {
      console.log('Not enough data to test.');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

testInsert();
