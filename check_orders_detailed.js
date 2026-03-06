
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
        console.log('--- rm_orders ---');
        const resOrders = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'rm_orders'");
        resOrders.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log('\n--- rm_order_items ---');
        const resItems = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'rm_order_items'");
        resItems.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
