const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function fixPurchases() {
    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Cleaning up duplicate constraints...');
        await pool.query(`ALTER TABLE purchase_entries DROP CONSTRAINT IF EXISTS fk_pe_order_id`);
        await pool.query(`ALTER TABLE purchase_entries DROP CONSTRAINT IF EXISTS fk_pe_supplier_id`);
        await pool.query(`ALTER TABLE purchase_entries DROP CONSTRAINT IF EXISTS purchase_entries_supplier_id_fkey`);
        
        console.log('Adding fresh supplier FK...');
        await pool.query(`
            ALTER TABLE purchase_entries 
            ADD CONSTRAINT purchase_entries_supplier_id_fkey 
            FOREIGN KEY (supplier_id) REFERENCES supplier_master(id)
        `);

        console.log('Adding fresh order FK...');
        await pool.query(`ALTER TABLE purchase_entries DROP CONSTRAINT IF EXISTS purchase_entries_order_id_fkey`);
        await pool.query(`
            ALTER TABLE purchase_entries 
            ADD CONSTRAINT purchase_entries_order_id_fkey 
            FOREIGN KEY (order_id) REFERENCES rm_orders(id)
        `);

        console.log('Done mapping FKs uniquely!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

fixPurchases();
