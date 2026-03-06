const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function insertConsumption() {
    const pool = new Pool({
        connectionString: process.env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // Find a raw material and company
        const rmRes = await pool.query('SELECT id, company_id FROM raw_materials LIMIT 1');
        if (rmRes.rows.length === 0) {
            console.log('No raw materials found to test.');
            return;
        }

        const rm = rmRes.rows[0];

        console.log('Inserting with empty issued_by...');
        try {
            await pool.query(`
                INSERT INTO material_consumptions 
                (consumption_slip_no, consumption_date, rm_id, quantity_used, process_type, machine_no, issued_by, remarks, company_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                'TEST-1', new Date(), rm.id, 10, 'Extrusion', '', '', '', rm.company_id
            ]);
        } catch(e) {
            console.error('Error with empty string:', e.message);
        }

    } catch (err) {
        console.error('Outer Error:', err.message);
    } finally {
        await pool.end();
    }
}

insertConsumption();
