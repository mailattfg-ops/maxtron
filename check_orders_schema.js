
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
        const resOrders = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'rm_orders'");
        console.log('rm_orders columns:', resOrders.rows.map(r => r.column_name));

        const resItems = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'rm_order_items'");
        console.log('rm_order_items columns:', resItems.rows.map(r => r.column_name));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
