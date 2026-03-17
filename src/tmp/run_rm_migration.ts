import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const sql = fs.readFileSync('C:\\Users\\shiju\\.gemini\\antigravity\\brain\\c528c308-ab4f-4166-90ff-0d09653b06f1\\rm_type_code_migration.sql', 'utf8');
    try {
        await pool.query(sql);
        console.log('Migration successful');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
