import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('supplier_master').select('id, supplier_materials(rm_id)').limit(1);
    if (error) {
        console.error('API Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('API Data:', JSON.stringify(data, null, 2));
    }
}

test();
