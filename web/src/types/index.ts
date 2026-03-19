// ============================================================
// Shared types for Exn-Hr Web Admin
// API Base: http://localhost:8080/api/v1
// ============================================================

// ---- Auth ----

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

// ---- User / Employee ----

export type Role = "admin" | "ceo" | "hr" | "leader" | "employee";

export type EmploymentStatus = "active" | "inactive" | "on_leave" | "terminated";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  department_id?: number;
  avatar_url?: string;
}

export interface Employee {
  id: number;
  employee_code: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  department_id: number;
  department_name: string;
  position: string;
  status: EmploymentStatus;
  hire_date: string; // ISO date
  birth_date?: string;
  address?: string;
  insurance_salary: number;
  base_salary: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  phone?: string;
  role: Role;
  department_id: number;
  position: string;
  hire_date: string;
  birth_date?: string;
  address?: string;
  insurance_salary: number;
  base_salary: number;
}

// ---- Department ----

export interface Department {
  id: number;
  name: string;
  description?: string;
  leader_id?: number;
  leader_name?: string;
  member_count: number;
  created_at: string;
}

// ---- Attendance ----

export type AttendanceStatus = "present" | "absent" | "late" | "half_day" | "wfh";

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: AttendanceStatus;
  location_verified: boolean;
  note?: string;
}

// ---- Leave ----

export type LeaveStatus = "pending" | "leader_approved" | "approved" | "rejected";
export type LeaveType = "annual" | "sick" | "unpaid" | "other";

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  department_name: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  leader_approved_at?: string;
  hr_approved_at?: string;
  rejected_reason?: string;
  created_at: string;
}

// ---- Overtime ----

export type OvertimeStatus = "pending" | "leader_approved" | "ceo_approved" | "rejected";

export interface OvertimeRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  department_name: string;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  reason: string;
  status: OvertimeStatus;
  rate: number; // 1.5
  amount: number;
  leader_approved_at?: string;
  ceo_approved_at?: string;
  rejected_reason?: string;
  created_at: string;
}

// ---- Payroll ----

export interface PayrollRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  department_name: string;
  month: number;
  year: number;
  base_salary: number;
  total_allowances: number;
  total_overtime: number;
  insurance_deduction: number;
  net_salary: number;
  status: "draft" | "approved" | "paid";
  paid_at?: string;
}

export interface PayrollSummary {
  month: number;
  year: number;
  total_employees: number;
  total_gross: number;
  total_net: number;
  total_overtime: number;
  total_allowances: number;
  total_insurance: number;
  status: "draft" | "approved" | "paid";
}

// ---- Allowance ----

export interface AllowanceType {
  id: number;
  name: string;
  description?: string;
  is_taxable: boolean;
  created_at: string;
}

export interface EmployeeAllowance {
  id: number;
  employee_id: number;
  allowance_type_id: number;
  allowance_type_name: string;
  amount: number;
  effective_from: string;
  effective_to?: string;
}

// ---- Team ----

export interface Team {
  id: number;
  name: string;
  department_id: number;
  department_name: string;
  leader_id?: number;
  leader_name?: string;
  member_count: number;
  created_at: string;
}

// ---- Notification ----

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "leave" | "overtime" | "payroll" | "attendance" | "system";
  is_read: boolean;
  link?: string;
  created_at: string;
}

// ---- Payslip ----

export interface Payslip {
  id: number;
  employee_id: number;
  employee_name: string;
  month: number;
  year: number;
  base_salary: number;
  total_allowances: number;
  total_overtime: number;
  total_bonus: number;
  total_deductions: number;
  insurance_deduction: number;
  net_salary: number;
  status: "draft" | "approved" | "paid";
  generated_at: string;
  paid_at?: string;
}

// ---- Reports ----

export interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  endpoint: string;
}

// ---- Pagination ----

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
  };
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// ---- Dashboard Stats ----

export interface DashboardStats {
  total_employees: number;
  present_today: number;
  on_leave: number;
  pending_leave_requests: number;
  pending_overtime_requests: number;
  total_departments: number;
}
