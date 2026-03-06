const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function dumpSchemas() {
    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        const tables = ['raw_materials', 'purchase_entries', 'purchase_entry_items', 'material_consumptions', 'purchase_returns'];
        const result = {};
        for (const table of tables) {
            const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table]);
            result[table] = res.rows;
        }
        fs.writeFileSync('schemas.json', JSON.stringify(result, null, 2), 'utf8');
    } catch(e) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}
dumpSchemas();
