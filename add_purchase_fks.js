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
        console.log('Adding FKs for purchase_entries...');
        
        await pool.query(`
            ALTER TABLE purchase_entries 
            ADD CONSTRAINT fk_pe_supplier_id 
            FOREIGN KEY (supplier_id) 
            REFERENCES supplier_master(id) ON DELETE SET NULL;
        `).catch(err => console.log('fk_pe_supplier_id error/exists:', err.message));

        await pool.query(`
            ALTER TABLE purchase_entries 
            ADD CONSTRAINT fk_pe_order_id 
            FOREIGN KEY (order_id) 
            REFERENCES rm_orders(id) ON DELETE SET NULL;
        `).catch(err => console.log('fk_pe_order_id error/exists:', err.message));

        await pool.query(`
            ALTER TABLE purchase_entry_items 
            ADD CONSTRAINT fk_pei_entry_id 
            FOREIGN KEY (entry_id) 
            REFERENCES purchase_entries(id) ON DELETE CASCADE;
        `).catch(err => console.log('fk_pei_entry_id error/exists:', err.message));

        await pool.query(`
            ALTER TABLE purchase_entry_items 
            ADD CONSTRAINT fk_pei_rm_id 
            FOREIGN KEY (rm_id) 
            REFERENCES raw_materials(id) ON DELETE RESTRICT;
        `).catch(err => console.log('fk_pei_rm_id error/exists:', err.message));

        console.log('Done mapping foreign keys for purchase entries!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

addFk();
