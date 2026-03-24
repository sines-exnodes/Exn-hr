// ============================================================
// Shared types for Exn-Hr Web Admin
// Synced with API.md — Base URL: http://localhost:8080/api/v1
// ============================================================

// ---- Generic API Response ----

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  size: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

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

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// ---- User ----

export type Role = "admin" | "ceo" | "hr" | "leader" | "employee";

export interface User {
  id: number;
  email: string;
  role: Role;
  is_active: boolean;
}

// ---- Employee ----

export interface Employee {
  id: number;
  user_id: number;
  full_name: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: "male" | "female";
  join_date: string;
  position: string;
  team_id?: number;
  basic_salary: number;
  insurance_salary: number;
  created_at: string;
  updated_at: string;
  user?: User;
  team?: Team;
}

export interface CreateEmployeeRequest {
  email: string;
  password: string;
  role: Role;
  full_name: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: "male" | "female";
  join_date: string;
  position: string;
  team_id?: number;
  basic_salary: number;
  insurance_salary: number;
}

export interface UpdateEmployeeRequest {
  full_name?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: "male" | "female";
  position?: string;
  team_id?: number;
  basic_salary?: number;
  insurance_salary?: number;
  is_active?: boolean;
}

// ---- Department ----

export interface Department {
  id: number;
  name: string;
  description?: string;
  teams?: Team[];
}

// ---- Team ----

export interface Team {
  id: number;
  name: string;
  department_id: number;
  leader_id?: number;
  department?: { id: number; name: string };
  leader?: { id: number; full_name: string };
  members?: Employee[];
}

// ---- Attendance ----

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  check_in_time?: string;
  check_out_time?: string;
  gps_lat?: number;
  gps_lng?: number;
  wifi_ssid?: string;
  status: "checked_in" | "checked_out";
  employee?: Employee;
}

export interface CheckInRequest {
  latitude: number;
  longitude: number;
  wifi_ssid?: string;
}

export interface OfficeLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  approved_wifis?: ApprovedWifi[];
}

export interface ApprovedWifi {
  id: number;
  ssid: string;
  bssid?: string;
  office_location_id: number;
}

// ---- Leave ----

export type LeaveType = "paid" | "unpaid";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
  id: number;
  employee_id: number;
  type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  leader_status: ApprovalStatus;
  hr_status: ApprovalStatus;
  overall_status: ApprovalStatus;
  leader_comment?: string;
  hr_comment?: string;
  created_at?: string;
  employee?: Employee;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
}

export interface ApproveRequest {
  status: "approved" | "rejected";
  comment?: string;
}

// ---- Overtime ----

export interface OvertimeRequest {
  id: number;
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  reason: string;
  leader_status: ApprovalStatus;
  ceo_status: ApprovalStatus;
  overall_status: ApprovalStatus;
  leader_comment?: string;
  ceo_comment?: string;
  created_at?: string;
  employee?: Employee;
}

// ---- Salary / Payroll ----

export interface SalaryRecord {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  basic_salary: number;
  insurance_salary?: number;
  total_allowances: number;
  ot_hours?: number;
  ot_rate?: number;
  total_ot_pay: number;
  total_bonus: number;
  bhxh?: number;
  bhyt?: number;
  bhtn?: number;
  total_deductions: number;
  salary_advance: number;
  net_salary: number;
  status: "draft" | "confirmed";
  employee?: Employee;
}

export interface RunPayrollRequest {
  month: number;
  year: number;
}

// ---- Allowance ----

export interface AllowanceType {
  id: number;
  name: string;
  description?: string;
}

export interface EmployeeAllowance {
  id: number;
  employee_id: number;
  allowance_id: number;
  amount: number;
  allowance?: AllowanceType;
}

// ---- Bonus ----

export interface Bonus {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  type: string;
  amount: number;
  description?: string;
}

// ---- Salary Advance ----

export interface SalaryAdvance {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  amount: number;
  reason?: string;
}

// ---- Notification ----

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  type: "leave" | "ot" | "salary" | "attendance";
  is_read: boolean;
  reference_id?: number;
  reference_type?: string;
  created_at: string;
}

// ---- Dashboard Stats (derived) ----

export interface DashboardStats {
  total_employees: number;
  present_today: number;
  on_leave: number;
  pending_leave_requests: number;
  pending_overtime_requests: number;
  total_departments: number;
}
