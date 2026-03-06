const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function printSchemas() {
    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        const tables = ['raw_materials', 'purchase_entries', 'purchase_entry_items', 'material_consumptions', 'purchase_returns'];
        for (const table of tables) {
            const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table]);
            console.log(`\nTable: ${table}`);
            console.log(res.rows.map(r => `${r.column_name}: ${r.data_type}`).join('\n'));
        }
    } catch(e) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}
printSchemas();
