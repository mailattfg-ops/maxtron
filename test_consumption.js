const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testConsumptions() {
    let query = supabase.from('material_consumptions').select(`
            *,
            raw_materials(rm_name, rm_code, unit_type)
        `);
    
    const { data, error } = await query;
    console.log("Error:", error);
    console.log("Data count:", data?.length);
}

testConsumptions();
