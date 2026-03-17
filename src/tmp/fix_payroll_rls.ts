import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
});

const sql = `
-- Drop existing restricted policies
DROP POLICY IF EXISTS "Allow auth select payroll" ON employee_payroll;
DROP POLICY IF EXISTS "Allow auth insert payroll" ON employee_payroll;
DROP POLICY IF EXISTS "Allow auth update payroll" ON employee_payroll;
DROP POLICY IF EXISTS "Allow auth delete payroll" ON employee_payroll;

-- Create more inclusive policies for public/anon access since Express backend handles auth
CREATE POLICY "Enable all for payroll" ON employee_payroll FOR ALL TO public USING (true) WITH CHECK (true);

-- Ensure RLS is still enabled but permissive to the backend role
ALTER TABLE employee_payroll ENABLE ROW LEVEL SECURITY;
`;

async function fix() {
    const client = await pool.connect();
    try {
        await client.query(sql);
        console.log('RLS Policies for employee_payroll updated successfully');
    } catch (error) {
        console.error('Failed to update RLS Policies:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

fix();
