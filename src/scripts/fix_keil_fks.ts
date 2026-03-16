import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
    console.error('❌ Error: SUPABASE_DB_URL is missing.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function fixKeilFks() {
    console.log('🔄 Fixing KEIL Foreign Key constraints...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Fix keil_routes -> keil_branches FK to SET NULL instead of RESTRICT
        console.log('Updating keil_routes_branch_id_fkey...');
        await client.query(`
            ALTER TABLE keil_routes 
            DROP CONSTRAINT IF EXISTS keil_routes_branch_id_fkey;
            
            ALTER TABLE keil_routes 
            ADD CONSTRAINT keil_routes_branch_id_fkey 
            FOREIGN KEY (branch_id) 
            REFERENCES keil_branches(id) 
            ON DELETE SET NULL;
        `);

        // 2. Fix keil_hces -> keil_branches FK to SET NULL
        console.log('Updating keil_hces_branch_id_fkey...');
        await client.query(`
            ALTER TABLE keil_hces 
            DROP CONSTRAINT IF EXISTS keil_hces_branch_id_fkey;
            
            ALTER TABLE keil_hces 
            ADD CONSTRAINT keil_hces_branch_id_fkey 
            FOREIGN KEY (branch_id) 
            REFERENCES keil_branches(id) 
            ON DELETE SET NULL;
        `);

        // PostgREST Schema Reload
        console.log('Notifying PostgREST to reload schema cache...');
        await client.query("NOTIFY pgrst, 'reload schema';");

        await client.query('COMMIT');
        console.log('✅ KEIL Foreign Keys updated successfully!');

    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('❌ Fix failed:', err.message);
    } finally {
        client.release();
        pool.end();
    }
}

fixKeilFks();
