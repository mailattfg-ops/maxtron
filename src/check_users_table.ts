import { supabase } from './config/supabase';

async function checkUsers() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    if (data && data.length > 0) {
        console.log('Columns in users table:', Object.keys(data[0]));
        console.log('Example user:', data[0]);
    } else {
        console.log('No users found.');
    }
}

checkUsers();
