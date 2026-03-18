const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

async function checkPermissions() {
    const { data, error } = await supabase.from('permissions').select('permission_key, module_name, sub_module');
    if (error) return console.error(error);
    data.forEach(p => {
        console.log(`${p.permission_key} | ${p.module_name} | ${p.sub_module}`);
    });
}

checkPermissions();
