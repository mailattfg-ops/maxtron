import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
});

const sql = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS basic_salary NUMERIC(15, 2) DEFAULT 0;
`;

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query(sql);
        console.log('Migration successful: basic_salary added to users');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
