const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testReturns() {
    let query = supabase.from('purchase_returns').select(`
        *,
        suppliers:supplier_master(supplier_name, supplier_code),
        purchase_entries(entry_number, invoice_number)
    `);
    
    const { data, error } = await query;
    console.log("Error:", error);
    console.log("Data count:", data?.length);
    if (data?.length > 0) console.log("First item:", data[0]);
}

testReturns();
