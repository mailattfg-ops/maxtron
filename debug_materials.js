
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function debugData() {
    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const resCol = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'raw_materials'");
        console.log('raw_materials columns:', resCol.rows.map(r => r.column_name));

        const resData = await pool.query("SELECT * FROM raw_materials LIMIT 5");
        console.log('raw_materials sample data:', resData.rows);

        const resCount = await pool.query("SELECT COUNT(*) FROM raw_materials");
        console.log('raw_materials total count:', resCount.rows[0].count);

        const resComp = await pool.query("SELECT id, company_name FROM companies");
        console.log('Companies:', resComp.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

debugData();
