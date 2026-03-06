
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectionString = process.env.SUPABASE_DB_URL;

const permissions = [
    // Dashboard
    { module: 'Dashboard', sub: null, key: 'dashboard_view', desc: 'View Dashboard metrics' },

    // HR
    { module: 'HR', sub: null, key: 'hr_view', desc: 'Access HR & Administration Group' },
    { module: 'HR', sub: 'Employee Information', key: 'hr_employee_view', desc: 'View employee records' },
    { module: 'HR', sub: 'Company Information', key: 'hr_company_view', desc: 'View company details' },
    { module: 'HR', sub: 'Attendance', key: 'hr_attendance_view', desc: 'View attendance logs' },
    { module: 'HR', sub: 'Marketing', key: 'hr_marketing_view', desc: 'View marketing visits' },

    // Inventory
    { module: 'Inventory', sub: null, key: 'inv_view', desc: 'Access Inventory & Procurement Group' },
    { module: 'Inventory', sub: 'Raw Material', key: 'inv_rm_view', desc: 'Manage raw material registry' },
    { module: 'Inventory', sub: 'Suppliers', key: 'inv_supplier_view', desc: 'Manage supplier information' },
    { module: 'Inventory', sub: 'Orders', key: 'inv_order_view', desc: 'Issue purchase orders' },
    { module: 'Inventory', sub: 'Purchase', key: 'inv_purchase_view', desc: 'Log purchase entries and returns' },
    { module: 'Inventory', sub: 'Consumption', key: 'inv_consumption_view', desc: 'Track material consumption' },

    // Production
    { module: 'Production', sub: null, key: 'prod_view', desc: 'Access Production MES Group' },
    { module: 'Production', sub: 'Products', key: 'prod_product_view', desc: 'View product details and wastage' },
    { module: 'Production', sub: 'Extrusion', key: 'prod_extrusion_view', desc: 'Manage extrusion production' },
    { module: 'Production', sub: 'Cutting', key: 'prod_cutting_view', desc: 'Manage cutting and sealing' },
    { module: 'Production', sub: 'Packing', key: 'prod_packing_view', desc: 'Manage packing logs' },

    // Sales
    { module: 'Sales', sub: null, key: 'sales_view', desc: 'Access Sales & Logistics Group' },
    { module: 'Sales', sub: 'Customers', key: 'sales_customers_view', desc: 'Manage customer database' },
    { module: 'Sales', sub: 'Vehicles', key: 'sales_vehicles_view', desc: 'Manage fleet information' },
    { module: 'Sales', sub: 'Orders', key: 'sales_orders_view', desc: 'Manage sales orders and delivery' },
    { module: 'Sales', sub: 'Invoice', key: 'sales_invoice_view', desc: 'Manage billing and sales returns' },

    // Finance
    { module: 'Finance', sub: null, key: 'fin_view', desc: 'Access Finance & Accounts Group' },
    { module: 'Finance', sub: 'Collection', key: 'fin_collection_view', desc: 'Track customer collections' },
    { module: 'Finance', sub: 'Payment', key: 'fin_payment_view', desc: 'Track supplier payments' },
    { module: 'Finance', sub: 'Petty Cash', key: 'fin_petty_cash_view', desc: 'Track petty cash entries' },

    // System
    { module: 'System', sub: 'Admin', key: 'admin_permissions', desc: 'Access to Permission Console' }
];

async function seedPermissions() {
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    console.log('🌱 Seeding missing ERP permissions...');

    try {
        for (const p of permissions) {
            await pool.query(
                `INSERT INTO permissions (module_name, sub_module, permission_key, description) 
                 VALUES ($1, $2, $3, $4) 
                 ON CONFLICT (permission_key) DO UPDATE SET 
                    module_name = EXCLUDED.module_name, 
                    sub_module = EXCLUDED.sub_module, 
                    description = EXCLUDED.description`,
                [p.module, p.sub, p.key, p.desc]
            );
        }

        // Auto-assign to Admin
        const adminRes = await pool.query("SELECT id FROM user_types WHERE name = 'admin' LIMIT 1");
        if (adminRes.rows.length > 0) {
            const adminId = adminRes.rows[0].id;
            for (const p of permissions) {
                await pool.query(
                    `INSERT INTO role_permissions (role_id, permission_key, can_view, can_create, can_edit, can_delete) 
                     VALUES ($1, $2, true, true, true, true) 
                     ON CONFLICT (role_id, permission_key) DO UPDATE SET 
                        can_view = true, can_create = true, can_edit = true, can_delete = true`,
                    [adminId, p.key]
                );
            }
        }

        console.log('✅ Permissions seeded and assigned to Admin.');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        await pool.end();
    }
}

seedPermissions();
