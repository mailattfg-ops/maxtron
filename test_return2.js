const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testReturns() {
    const { data, error } = await supabase.from('purchase_returns').select(`
        *,
        supplier_master(supplier_name, supplier_code),
        purchase_entries(entry_number)
    `);
    
    console.log("Error:", error);
    console.log("Data count:", data?.length);
    if (data?.length > 0) console.log("First:", JSON.stringify(data[0], null, 2));
    else if (data) console.log("No records exist yet, but no error = query works!");
}

testReturns();
