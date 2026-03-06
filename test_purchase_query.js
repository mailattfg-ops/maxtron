const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkPurchases() {
    console.log("Testing purchase query");
    let query = supabase.from('purchase_entries').select(`
            *,
            supplier_master(supplier_name, supplier_code),
            rm_orders(order_number),
            purchase_entry_items(
                rm_id, received_quantity, rate, amount,
                raw_materials(rm_name, rm_code)
            )
        `);
    
    const { data, error } = await query;
    
    if (error) {
        console.error("Error fetching purchases:", error);
    } else {
        console.log(`Successfully fetched ${data.length} purchase entries.`);
    }
}

checkPurchases();
