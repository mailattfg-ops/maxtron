const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkRMStockTest() {
    let purQuery = supabase.from('purchase_entry_items').select('rm_id, received_quantity, purchase_entries!inner(company_id)');
    const { data: purchaseItems, error: purErr } = await purQuery;

    console.log('purchaseItems:', purchaseItems);
    console.log('error:', purErr);
}

checkRMStockTest();
