const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkRMOrders() {
    let query = supabase.from('rm_orders').select(`
            *,
            supplier_master(supplier_name, supplier_code),
            rm_order_items(
                rm_id, quantity, rate, amount,
                raw_materials(rm_name, rm_code)
            )
        `);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    fs.writeFileSync('test_supabase_orders.json', JSON.stringify({ data, error }, null, 2));
    console.log('Done test_supabase_orders.json');
}

checkRMOrders();
