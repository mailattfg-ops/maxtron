
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkSchema() {
    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const tables = ['raw_materials', 'purchase_entries', 'purchase_entry_items', 'material_consumptions', 'rm_orders', 'rm_order_items'];
        for (const table of tables) {
            console.log(`--- ${table} ---`);
            const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table]);
            res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
            console.log('');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
