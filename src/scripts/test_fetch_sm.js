const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || ''; // anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Supplier Fetch with Materials...');
    const { data, error } = await supabase
        .from('supplier_master')
        .select('id, supplier_name, supplied_materials:supplier_materials(rm_id)')
        .limit(5);
        
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

test();
