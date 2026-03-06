const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkOrders() {
    const { data, error } = await supabase.from('rm_orders').select(`
        id, order_number, total_amount,
        supplier_master(supplier_name),
        rm_order_items(rm_id, quantity, rate, amount, raw_materials(rm_name))
    `).limit(3);

    console.log('Error:', error?.message || 'none');
    data?.forEach(o => {
        console.log(`\nOrder: ${o.order_number}`);
        console.log(`  Supplier: ${o.supplier_master?.supplier_name}`);
        console.log(`  Items count: ${o.rm_order_items?.length}`);
        o.rm_order_items?.forEach(i => {
            console.log(`    - ${i.raw_materials?.rm_name}, qty: ${i.quantity}`);
        });
    });
}

checkOrders();
