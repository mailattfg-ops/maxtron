const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkReportData() {
    console.log('\n--- Purchase Entries with items ---');
    const { data: purchases, error: pErr } = await supabase.from('purchase_entries').select(`
        id, entry_number, entry_date, invoice_number, invoice_date, unloading_charges, remarks,
        supplier_master(supplier_name, supplier_code),
        rm_orders(order_number),
        purchase_entry_items(rm_id, ordered_quantity, received_quantity, rate, amount, raw_materials(rm_name, rm_code, unit_type))
    `).limit(2);
    console.log('Purchase Error:', pErr?.message || 'none');
    console.log('Purchase count:', purchases?.length);
    if (purchases?.[0]) {
        const p = purchases[0];
        console.log('Entry:', p.entry_number, 'Supplier:', p.supplier_master?.supplier_name);
        console.log('Items:', p.purchase_entry_items?.length);
        console.log('First item:', p.purchase_entry_items?.[0]);
    }

    console.log('\n--- Consumptions ---');
    const { data: cons, error: cErr } = await supabase.from('material_consumptions').select(`
        id, consumption_slip_no, consumption_date, quantity_used, process_type, machine_no, remarks,
        raw_materials(rm_name, rm_code, unit_type)
    `).limit(2);
    console.log('Consumption Error:', cErr?.message || 'none');
    console.log('Consumption count:', cons?.length);
    if (cons?.[0]) console.log('First:', cons[0]);
}

checkReportData();
