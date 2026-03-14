import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.SUPABASE_DB_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function reload() {
  const client = await pool.connect();
  try {
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log('Schema reload triggered');
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

reload();
