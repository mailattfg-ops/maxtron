import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.SUPABASE_DB_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Creating supplier_materials many-to-many relationship table...');
    
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS supplier_materials (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        supplier_id UUID REFERENCES supplier_master(id) ON DELETE CASCADE,
        rm_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(supplier_id, rm_id)
      );
    `);
    
    await client.query('COMMIT');
    console.log('✅ Migration successful.');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
