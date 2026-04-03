-- ============================================================
-- Exn-Hr: Initial Schema (baseline migration)
-- All tables as of 2026-04-03 employee model v2
-- ============================================================

-- Users & Auth
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),

    -- Thông tin cá nhân
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    personal_email VARCHAR(255) DEFAULT '',
    gender VARCHAR(20) DEFAULT '',
    permanent_address TEXT DEFAULT '',
    current_address TEXT DEFAULT '',
    dob VARCHAR(20) DEFAULT '',
    nationality VARCHAR(100) DEFAULT '',
    id_number VARCHAR(50) DEFAULT '',
    id_issue_date VARCHAR(20) DEFAULT '',
    id_front_image TEXT DEFAULT '',
    id_back_image TEXT DEFAULT '',
    education VARCHAR(50) DEFAULT '',
    marital_status VARCHAR(50) DEFAULT '',

    -- Liên hệ khẩn cấp
    emergency_contact_name VARCHAR(255) DEFAULT '',
    emergency_contact_relation VARCHAR(100) DEFAULT '',
    emergency_contact_phone VARCHAR(50) DEFAULT '',

    -- Thông tin công việc
    department_id BIGINT REFERENCES departments(id),
    manager_id BIGINT REFERENCES employees(id),
    join_date VARCHAR(20) DEFAULT '',
    contract_type VARCHAR(50) DEFAULT 'official',
    contract_sign_date VARCHAR(20) DEFAULT '',
    contract_end_date VARCHAR(20) DEFAULT '',
    contract_renewal INT DEFAULT 1,

    -- Lương & Bảo hiểm
    basic_salary DOUBLE PRECISION DEFAULT 0,
    insurance_salary DOUBLE PRECISION DEFAULT 0,

    -- Ngân hàng
    bank_account VARCHAR(100) DEFAULT '',
    bank_name VARCHAR(100) DEFAULT '',
    bank_holder_name VARCHAR(255) DEFAULT '',
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dependents (người phụ thuộc)
CREATE TABLE IF NOT EXISTS dependents (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    dob VARCHAR(20) DEFAULT '',
    gender VARCHAR(20) DEFAULT '',
    relationship VARCHAR(50) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance
CREATE TABLE IF NOT EXISTS office_locations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approved_wi_fis (
    id BIGSERIAL PRIMARY KEY,
    ssid VARCHAR(255) NOT NULL,
    bssid VARCHAR(255) DEFAULT '',
    office_location_id BIGINT NOT NULL REFERENCES office_locations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    gps_lat DOUBLE PRECISION,
    gps_lng DOUBLE PRECISION,
    wifi_ssid VARCHAR(255) DEFAULT '',
    status VARCHAR(50) DEFAULT 'checked_in',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    type VARCHAR(50) NOT NULL,
    start_date VARCHAR(20) NOT NULL,
    end_date VARCHAR(20) NOT NULL,
    days DOUBLE PRECISION NOT NULL,
    reason TEXT DEFAULT '',
    leader_status VARCHAR(50) DEFAULT 'pending',
    hr_status VARCHAR(50) DEFAULT 'pending',
    overall_status VARCHAR(50) DEFAULT 'pending',
    leader_comment TEXT DEFAULT '',
    hr_comment TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leave_balances (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    year INT NOT NULL,
    total_days INT DEFAULT 12,
    used_days INT DEFAULT 0,
    remaining_days INT DEFAULT 12,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Overtime
CREATE TABLE IF NOT EXISTS overtime_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    date VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    hours DOUBLE PRECISION NOT NULL,
    reason TEXT DEFAULT '',
    leader_status VARCHAR(50) DEFAULT 'pending',
    ceo_status VARCHAR(50) DEFAULT 'pending',
    overall_status VARCHAR(50) DEFAULT 'pending',
    leader_comment TEXT DEFAULT '',
    ceo_comment TEXT DEFAULT '',
    ot_type VARCHAR(50) DEFAULT 'normal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salary
CREATE TABLE IF NOT EXISTS allowances (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    is_taxable BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_allowances (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    allowance_id BIGINT NOT NULL REFERENCES allowances(id),
    amount DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bonuses (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    month INT NOT NULL,
    year INT NOT NULL,
    type VARCHAR(100) DEFAULT '',
    amount DOUBLE PRECISION DEFAULT 0,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_advances (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    month INT NOT NULL,
    year INT NOT NULL,
    amount DOUBLE PRECISION DEFAULT 0,
    reason TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_records (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    month INT NOT NULL,
    year INT NOT NULL,
    basic_salary DOUBLE PRECISION DEFAULT 0,
    insurance_salary DOUBLE PRECISION DEFAULT 0,
    total_allowances DOUBLE PRECISION DEFAULT 0,
    ot_hours DOUBLE PRECISION DEFAULT 0,
    ot_rate DOUBLE PRECISION DEFAULT 0,
    total_ot_pay DOUBLE PRECISION DEFAULT 0,
    total_bonus DOUBLE PRECISION DEFAULT 0,
    bhxh DOUBLE PRECISION DEFAULT 0,
    bhyt DOUBLE PRECISION DEFAULT 0,
    bhtn DOUBLE PRECISION DEFAULT 0,
    total_deductions DOUBLE PRECISION DEFAULT 0,
    salary_advance DOUBLE PRECISION DEFAULT 0,
    net_salary DOUBLE PRECISION DEFAULT 0,
    standard_work_days INT DEFAULT 0,
    actual_work_days INT DEFAULT 0,
    ot_pay_normal DOUBLE PRECISION DEFAULT 0,
    ot_pay_weekend DOUBLE PRECISION DEFAULT 0,
    ot_pay_holiday DOUBLE PRECISION DEFAULT 0,
    parking_fee DOUBLE PRECISION DEFAULT 0,
    taxable_income DOUBLE PRECISION DEFAULT 0,
    personal_deduction DOUBLE PRECISION DEFAULT 0,
    dependent_deduction DOUBLE PRECISION DEFAULT 0,
    pit_amount DOUBLE PRECISION DEFAULT 0,
    union_fee_employee DOUBLE PRECISION DEFAULT 0,
    union_fee_employer DOUBLE PRECISION DEFAULT 0,
    prorated_salary DOUBLE PRECISION DEFAULT 0,
    employer_insurance_cost DOUBLE PRECISION DEFAULT 0,
    employer_bhxh DOUBLE PRECISION DEFAULT 0,
    employer_bhyt DOUBLE PRECISION DEFAULT 0,
    employer_bhtn DOUBLE PRECISION DEFAULT 0,
    employer_tnnn DOUBLE PRECISION DEFAULT 0,
    total_employer_cost DOUBLE PRECISION DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    payment_date VARCHAR(20) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    body TEXT DEFAULT '',
    type VARCHAR(50) DEFAULT '',
    is_read BOOLEAN DEFAULT false,
    reference_id BIGINT,
    reference_type VARCHAR(100) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'active',
    start_date VARCHAR(20) DEFAULT '',
    end_date VARCHAR(20) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_assignments (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    role VARCHAR(50) DEFAULT '',
    allocation_percentage INT DEFAULT 100,
    start_date VARCHAR(20) DEFAULT '',
    end_date VARCHAR(20) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements & Polls
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_type VARCHAR(50) DEFAULT 'all',
    target_id BIGINT,
    is_pinned BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS polls (
    id BIGSERIAL PRIMARY KEY,
    announcement_id BIGINT REFERENCES announcements(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    is_multiple_choice BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    deadline TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_options (
    id BIGSERIAL PRIMARY KEY,
    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL,
    vote_count INT DEFAULT 0,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_votes (
    id BIGSERIAL PRIMARY KEY,
    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id BIGINT NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    deadline VARCHAR(20) DEFAULT '',
    status VARCHAR(50) DEFAULT 'upcoming',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestone_items (
    id BIGSERIAL PRIMARY KEY,
    milestone_id BIGINT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_dependents_employee_id ON dependents(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_employee_id ON overtime_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_employee_id ON salary_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_employee ON project_assignments(employee_id);
