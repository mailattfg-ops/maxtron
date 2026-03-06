const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function addFk() {
    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Adding FK...');
        await pool.query(`
            ALTER TABLE rm_orders 
            ADD CONSTRAINT fk_rm_orders_supplier_id 
            FOREIGN KEY (supplier_id) 
            REFERENCES supplier_master(id) 
            ON DELETE RESTRICT;
        `);
        console.log('Done mapping supplier_id to supplier_master!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

addFk();
