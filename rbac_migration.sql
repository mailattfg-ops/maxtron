-- 1. Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name VARCHAR(100) NOT NULL,
    sub_module VARCHAR(100),
    permission_key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES user_types(id) ON DELETE CASCADE,
    permission_key VARCHAR(100) REFERENCES permissions(permission_key) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_key)
);

-- 3. Initial Permissions Seed
INSERT INTO permissions (module_name, sub_module, permission_key, description) VALUES
('Dashboard', NULL, 'dashboard_view', 'View Dashboard metrics'),
('HR', 'Employee Information', 'hr_employee_view', 'View employee records'),
('HR', 'Employee Information', 'hr_employee_manage', 'Create/Edit/Delete employee records'),
('HR', 'Company Information', 'hr_company_view', 'View company details'),
('HR', 'Company Information', 'hr_company_manage', 'Manage company details'),
('HR', 'Attendance', 'hr_attendance_view', 'View attendance logs'),
('HR', 'Attendance', 'hr_attendance_manage', 'Edit/Delete attendance logs'),
('HR', 'Marketing', 'hr_marketing_view', 'View marketing visits'),
('HR', 'Marketing', 'hr_marketing_manage', 'Manage marketing visits'),
('Sales', 'Customers', 'sales_customers_view', 'View customer database'),
('Sales', 'Customers', 'sales_customers_manage', 'Manage customer data'),
('System', 'Global', 'company_switching', 'Ability to switch between MAXTRON and KEIL entities'),
('System', 'Admin', 'admin_permissions', 'Access to Permission Console to change role rights')
ON CONFLICT (permission_key) DO NOTHING;
