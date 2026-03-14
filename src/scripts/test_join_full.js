const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || ''; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('--- Testing Join ---');
    // We use the actual table names to be safe
    const { data: suppliers, error: supErr } = await supabase
        .from('supplier_master')
        .select('id, supplier_name, supplier_materials(rm_id, raw_materials(rm_name))')
        .limit(3);

    if (supErr) {
        console.error('Supabase Error:', JSON.stringify(supErr, null, 2));
    } else {
        console.log('Result:', JSON.stringify(suppliers, null, 2));
    }
}

test();
