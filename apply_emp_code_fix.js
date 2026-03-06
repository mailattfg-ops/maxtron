
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔄 Enabling auto-increment for employee_code...');
        await pool.query("CREATE SEQUENCE IF NOT EXISTS employee_code_seq START 1001;");
        await pool.query("ALTER TABLE users ALTER COLUMN employee_code SET DEFAULT 'EMP-' || nextval('employee_code_seq')::text;");
        console.log('✅ Employee code auto-increment enabled');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

runMigration();
