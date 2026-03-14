import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.SUPABASE_DB_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM information_schema.tables WHERE table_name = 'supplier_materials'");
    console.log('Result:', res.rows);
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

test();
