const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function verifyAll() {
    console.log('\n--- Purchase Returns ---');
    const { data: returns, error: rErr } = await supabase.from('purchase_returns').select(`
        id, return_no, return_date, quantity_returned, status,
        supplier_master(supplier_name),
        purchase_entries(entry_number)
    `);
    console.log('Error:', rErr?.message || 'none');
    console.log('Returns count:', returns?.length);
    if (returns?.[0]) console.log('First:', JSON.stringify(returns[0], null, 2));

    console.log('\n--- Purchase Entries with supplier ---');
    const { data: entries, error: eErr } = await supabase.from('purchase_entries').select(`
        id, entry_number, supplier_id,
        supplier_master(supplier_name)
    `).limit(2);
    console.log('Error:', eErr?.message || 'none');
    console.log('Entries count:', entries?.length);
    if (entries?.[0]) console.log('First entry:', JSON.stringify(entries[0], null, 2));
}

verifyAll();
