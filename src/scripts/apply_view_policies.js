const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyPolicies() {
  const views = ['v_sales_invoice_balances', 'v_purchase_entry_balances', 'v_marketing_visits_report'];
  const tables = ['sales_invoices', 'sales_invoice_items', 'purchase_entries', 'purchase_entry_items', 'marketing_visits'];

  try {
    // 1. Grant SELECT on views
    for (const v of views) {
      console.log(`Granting SELECT on ${v}...`);
      await pool.query(`GRANT SELECT ON ${v} TO anon, authenticated`);
    }

    // 2. Apply Universal Access policy to underlying tables
    for (const t of tables) {
      console.log(`Applying RLS policy to ${t}...`);
      await pool.query(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`);
      await pool.query(`DROP POLICY IF EXISTS "Universal Access" ON ${t}`);
      await pool.query(`CREATE POLICY "Universal Access" ON ${t} FOR ALL USING (true)`);
    }

    console.log('✅ All policies and permissions applied successfully.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

applyPolicies();
