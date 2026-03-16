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

async function fixUserFks() {
    console.log('🔄 Fixing User Foreign Key constraints for production and sales...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const tablesToFix = [
            { table: 'production_batches', column: 'operator_id', constraint: 'production_batches_operator_id_fkey' },
            { table: 'production_batches', column: 'supervisor_id', constraint: 'production_batches_supervisor_id_fkey' },
            { table: 'production_conversions', column: 'operator_id', constraint: 'production_conversions_operator_id_fkey' },
            { table: 'customer_orders', column: 'executive_id', constraint: 'customer_orders_executive_id_fkey' },
            { table: 'sales_invoices', column: 'executive_id', constraint: 'sales_invoices_executive_id_fkey' },
            { table: 'deliveries', column: 'delivery_person_id', constraint: 'deliveries_delivery_person_id_fkey' },
            { table: 'sales_returns', column: 'return_employee_id', constraint: 'sales_returns_return_employee_id_fkey' },
            { table: 'material_consumptions', column: 'issued_by', constraint: 'material_consumptions_issued_by_fkey' },
            { table: 'marketing_visits', column: 'employee_id', constraint: 'marketing_visits_employee_id_fkey' }
        ];

        for (const { table, column, constraint } of tablesToFix) {
            console.log(`Updating ${table}.${column} constraint...`);
            
            // We need to find the actual constraint name because it might vary if not explicitly named in CREATE TABLE
            const findConstraint = await client.query(`
                SELECT constraint_name 
                FROM information_schema.key_column_usage 
                WHERE table_name = '${table}' AND column_name = '${column}'
                AND table_schema = 'public'
            `);

            if (findConstraint.rows.length > 0) {
                const actualConstraintName = findConstraint.rows[0].constraint_name;
                await client.query(`
                    ALTER TABLE ${table} 
                    DROP CONSTRAINT "${actualConstraintName}";
                    
                    ALTER TABLE ${table} 
                    ADD CONSTRAINT "${actualConstraintName}" 
                    FOREIGN KEY ("${column}") 
                    REFERENCES users(id) 
                    ON DELETE SET NULL;
                `);
            } else {
                console.warn(`Could not find constraint for ${table}.${column}`);
                // Fallback attempt with guessed name if we want to be sure
                await client.query(`
                    ALTER TABLE ${table} 
                    ADD CONSTRAINT "${table}_${column}_fkey" 
                    FOREIGN KEY ("${column}") 
                    REFERENCES users(id) 
                    ON DELETE SET NULL;
                `).catch(e => console.log(`Fallback failed for ${table}.${column}: ${e.message}`));
            }
        }

        // PostgREST Schema Reload
        console.log('Notifying PostgREST to reload schema cache...');
        await client.query("NOTIFY pgrst, 'reload schema';");

        await client.query('COMMIT');
        console.log('✅ User Foreign Keys updated successfully!');

    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('❌ Fix failed:', err.message);
    } finally {
        client.release();
        pool.end();
    }
}

fixUserFks();
