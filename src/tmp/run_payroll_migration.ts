import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
});

const sql = `
-- Create employee_payroll table
CREATE TABLE IF NOT EXISTS employee_payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES users(id) NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    basic_salary NUMERIC(15, 2) DEFAULT 0,
    allowances NUMERIC(15, 2) DEFAULT 0,
    deductions NUMERIC(15, 2) DEFAULT 0,
    incentives NUMERIC(15, 2) DEFAULT 0,
    net_salary NUMERIC(15, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID')),
    payment_date DATE,
    payment_mode TEXT,
    remarks TEXT,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, month, year)
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON employee_payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_company ON employee_payroll(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_date ON employee_payroll(year, month);

-- RLS
ALTER TABLE employee_payroll ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow auth select payroll' AND tablename = 'employee_payroll') THEN
        CREATE POLICY "Allow auth select payroll" ON employee_payroll FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow auth insert payroll' AND tablename = 'employee_payroll') THEN
        CREATE POLICY "Allow auth insert payroll" ON employee_payroll FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow auth update payroll' AND tablename = 'employee_payroll') THEN
        CREATE POLICY "Allow auth update payroll" ON employee_payroll FOR UPDATE TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow auth delete payroll' AND tablename = 'employee_payroll') THEN
        CREATE POLICY "Allow auth delete payroll" ON employee_payroll FOR DELETE TO authenticated USING (true);
    END IF;
END $$;
`;

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query(sql);
        console.log('Migration successful');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
