import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'placeholder';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder') {
    console.warn('⚠️ Supabase URL or Key is missing from your environment variables! Database queries will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
