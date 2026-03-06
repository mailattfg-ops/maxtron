
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectionString = process.env.SUPABASE_DB_URL;

async function seedKeil() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding Keil company details...');
    
    // Get Keil ID
    const res = await client.query("SELECT id FROM companies WHERE company_name = 'KEIL'");
    if (res.rows.length === 0) {
      console.log('❌ Keil company not found in DB.');
      return;
    }
    const keilId = res.rows[0].id;

    // Update Keil details
    await client.query(`
      UPDATE companies SET
        gst_no = '32AAACK1234K1Z1',
        license_no = 'L-987654321',
        license_details = 'Standard Industrial License',
        license_renewal_date = '2027-12-31',
        pcb_authorization_no = 'PCB/K/2024/001',
        pcb_details = 'Air & Water Consent Valid',
        pcb_renewal_date = '2026-06-30',
        no_of_employees = 45,
        email = 'contact@keil.com',
        phone = '+91 98765 43210',
        website = 'www.keil.com'
      WHERE id = $1
    `, [keilId]);

    // Insert sample addresses if not present
    const addrRes = await client.query("SELECT id FROM addresses WHERE company_id = $1", [keilId]);
    if (addrRes.rows.length === 0) {
      await client.query(`
        INSERT INTO addresses (company_id, address_type, street, city, state, zip_code, country) VALUES
        ($1, 'OFFICE', '101, Keil Business Park', 'Kochi', 'Kerala', '682001', 'India'),
        ($1, 'MANUFACTURING_UNIT', 'Plot 42, Industrial Area, Keil', 'Palakkad', 'Kerala', '678001', 'India'),
        ($1, 'BILLING', 'HQ Finance Dept, Floor 2', 'Kochi', 'Kerala', '682001', 'India')
      `, [keilId]);
    }

    console.log('✅ Keil company details seeded successfully.');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

seedKeil();
