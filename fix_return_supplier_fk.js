const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function fixReturnFk() {
    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // Add FK from purchase_returns.supplier_id to supplier_master.id
        console.log('Adding supplier_master FK to purchase_returns...');
        await pool.query(`
            ALTER TABLE purchase_returns
            ADD CONSTRAINT purchase_returns_supplier_id_fkey
            FOREIGN KEY (supplier_id) REFERENCES supplier_master(id) ON DELETE SET NULL;
        `);
        console.log('Success!');

        // Verify
        const res = await pool.query(`
            SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='purchase_returns';
        `);
        console.log('All FKs on purchase_returns:', res.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

fixReturnFk();
