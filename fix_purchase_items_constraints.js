const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function fixPurchaseItems() {
    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Cleaning up duplicate constraints on items...');
        await pool.query(`ALTER TABLE purchase_entry_items DROP CONSTRAINT IF EXISTS fk_pei_entry_id`);
        await pool.query(`ALTER TABLE purchase_entry_items DROP CONSTRAINT IF EXISTS fk_pei_rm_id`);
        await pool.query(`ALTER TABLE purchase_entry_items DROP CONSTRAINT IF EXISTS purchase_entry_items_entry_id_fkey`);
        await pool.query(`ALTER TABLE purchase_entry_items DROP CONSTRAINT IF EXISTS purchase_entry_items_rm_id_fkey`);
       
        console.log('Adding fresh entry FK...');
        await pool.query(`
            ALTER TABLE purchase_entry_items 
            ADD CONSTRAINT purchase_entry_items_entry_id_fkey 
            FOREIGN KEY (entry_id) REFERENCES purchase_entries(id)
        `);

        console.log('Adding fresh rm FK...');
        await pool.query(`
            ALTER TABLE purchase_entry_items 
            ADD CONSTRAINT purchase_entry_items_rm_id_fkey 
            FOREIGN KEY (rm_id) REFERENCES raw_materials(id)
        `);

        console.log('Done mapping FKs uniquely on items!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

fixPurchaseItems();
